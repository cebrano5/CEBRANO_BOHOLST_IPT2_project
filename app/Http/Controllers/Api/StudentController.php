<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Pagination\Paginator;

class StudentController extends Controller
{
    /**
     * Get all students with pagination and filters
     */
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $search = $request->query('search');
        $departmentId = $request->query('department_id');
        $courseId = $request->query('course_id');

        $query = Student::with('user', 'course', 'department', 'academicYear')->active();

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('student_id', 'like', "%{$search}%");
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        $total = $query->count();
        $students = $query->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'students' => $students->items(),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Get single student
     */
    public function show($id)
    {
        $student = Student::with('user', 'course', 'department', 'academicYear')->find($id);

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        return response()->json(['student' => $student]);
    }

    /**
     * Create new student
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'student_id' => 'required|string|unique:students',
            'course_id' => 'sometimes|integer|exists:courses,id',
            'department_id' => 'sometimes|integer|exists:departments,id',
            'academic_year' => 'sometimes|integer|exists:academic_years,id',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
        ]);

        // Create user first
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'student',
        ]);

        // Then create student record
        $student = Student::create([
            'user_id' => $user->id,
            'student_id' => $validated['student_id'],
            'course_id' => $validated['course_id'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'academic_year_id' => $validated['academic_year'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        return response()->json(['student' => $student->load('user', 'course', 'department', 'academicYear')], 201);
    }

    /**
     * Update student
     */
    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $student->user_id,
            'course_id' => 'sometimes|integer|exists:courses,id',
            'department_id' => 'sometimes|integer|exists:departments,id',
            'academic_year' => 'sometimes|integer|exists:academic_years,id',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
        ]);

        // Update user if name or email provided
        if (isset($validated['name']) || isset($validated['email'])) {
            $student->user->update([
                'name' => $validated['name'] ?? $student->user->name,
                'email' => $validated['email'] ?? $student->user->email,
            ]);
        }

        // Prepare student data with correct field mapping
        $studentData = $validated;
        if (isset($studentData['academic_year'])) {
            $studentData['academic_year_id'] = $studentData['academic_year'];
            unset($studentData['academic_year']);
        }

        // Update student record
        $student->update($studentData);

        return response()->json(['student' => $student->load('user', 'course', 'department', 'academicYear')]);
    }

    /**
     * Archive student
     */
    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        $student->update(['archived' => true]);

        return response()->json(['message' => 'Student archived successfully']);
    }

    /**
     * Restore student
     */
    public function restore($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        $student->update(['archived' => false]);

        return response()->json(['message' => 'Student restored successfully']);
    }

    /**
     * Get student statistics
     */
    public function statistics()
    {
        try {
            $students = Student::with('department', 'course', 'academicYear')->get();
            
            // Group by department safely
            $byDepartment = $students
                ->filter(fn($s) => $s->department !== null)
                ->groupBy(fn($item) => $item->department->name ?? 'Unknown')
                ->map(fn($group) => [
                    'department' => $group->first()->department->name ?? 'Unknown',
                    'count' => $group->count()
                ])
                ->values();
            
            // Group by course safely
            $byCourse = $students
                ->filter(fn($s) => $s->course !== null)
                ->groupBy(fn($item) => $item->course->name ?? 'Unknown')
                ->map(fn($group) => [
                    'course' => $group->first()->course->name ?? 'Unknown',
                    'count' => $group->count()
                ])
                ->values();
            
            // Group by academic year safely
            $byYear = $students
                ->filter(fn($s) => $s->academicYear !== null)
                ->groupBy(fn($item) => $item->academicYear->name ?? 'Unknown')
                ->map(fn($group) => [
                    'year' => $group->first()->academicYear->name ?? 'Unknown',
                    'count' => $group->count()
                ])
                ->values();
            
            return response()->json([
                'success' => true,
                'stats' => [
                    'total' => $students->count(),
                    'byDepartment' => $byDepartment,
                    'byCourse' => $byCourse,
                    'byYear' => $byYear
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Student statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'stats' => [
                    'total' => 0,
                    'byDepartment' => [],
                    'byCourse' => [],
                    'byYear' => []
                ]
            ], 500);
        }
    }
}
