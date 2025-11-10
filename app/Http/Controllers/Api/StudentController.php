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
        $category = $request->query('category');

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

        if ($category) {
            $query->where('category', $category);
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
            'enrollment_date' => 'sometimes|date',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'status' => 'sometimes|in:active,inactive,graduated',
            'category' => 'sometimes|in:freshman,transferee,returnee,regular,irregular',
            'academic_performance_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'completion_diploma_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'character_certificate_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'admission_test_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'application_form_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'college_academic_record_tor_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'eligibility_to_transfer_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'course_evaluation_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'good_standing_status_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'prior_education_proof_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'marital_status_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'request_to_reenroll_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'account_clearance_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'academic_review_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'health_status_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle document uploads
        $documentFields = [
            'academic_performance_image_url', 'completion_diploma_image_url', 'character_certificate_image_url',
            'admission_test_image_url', 'application_form_image_url', 'college_academic_record_tor_image_url',
            'eligibility_to_transfer_image_url', 'course_evaluation_image_url', 'good_standing_status_image_url',
            'prior_education_proof_image_url', 'marital_status_image_url', 'request_to_reenroll_image_url',
            'account_clearance_image_url', 'academic_review_image_url', 'health_status_image_url'
        ];

        $documentPaths = [];
        foreach ($documentFields as $field) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/students/documents'), $fileName);
                $documentPaths[$field] = 'uploads/students/documents/' . $fileName;
            }
        }

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
            'date_enrolled' => $validated['enrollment_date'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'category' => $validated['category'] ?? 'freshman',
            'academic_performance_image_url' => $documentPaths['academic_performance_image_url'] ?? null,
            'completion_diploma_image_url' => $documentPaths['completion_diploma_image_url'] ?? null,
            'character_certificate_image_url' => $documentPaths['character_certificate_image_url'] ?? null,
            'admission_test_image_url' => $documentPaths['admission_test_image_url'] ?? null,
            'application_form_image_url' => $documentPaths['application_form_image_url'] ?? null,
            'college_academic_record_tor_image_url' => $documentPaths['college_academic_record_tor_image_url'] ?? null,
            'eligibility_to_transfer_image_url' => $documentPaths['eligibility_to_transfer_image_url'] ?? null,
            'course_evaluation_image_url' => $documentPaths['course_evaluation_image_url'] ?? null,
            'good_standing_status_image_url' => $documentPaths['good_standing_status_image_url'] ?? null,
            'prior_education_proof_image_url' => $documentPaths['prior_education_proof_image_url'] ?? null,
            'marital_status_image_url' => $documentPaths['marital_status_image_url'] ?? null,
            'request_to_reenroll_image_url' => $documentPaths['request_to_reenroll_image_url'] ?? null,
            'account_clearance_image_url' => $documentPaths['account_clearance_image_url'] ?? null,
            'academic_review_image_url' => $documentPaths['academic_review_image_url'] ?? null,
            'health_status_image_url' => $documentPaths['health_status_image_url'] ?? null,
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
            'enrollment_date' => 'sometimes|date',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'status' => 'sometimes|in:active,inactive,graduated',
            'category' => 'sometimes|in:freshman,transferee,returnee,regular,irregular',
            'academic_performance_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'completion_diploma_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'character_certificate_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'admission_test_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'application_form_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'college_academic_record_tor_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'eligibility_to_transfer_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'course_evaluation_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'good_standing_status_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'prior_education_proof_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'marital_status_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'request_to_reenroll_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'account_clearance_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'academic_review_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'health_status_image_url' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle document uploads
        $documentFields = [
            'academic_performance_image_url', 'completion_diploma_image_url', 'character_certificate_image_url',
            'admission_test_image_url', 'application_form_image_url', 'college_academic_record_tor_image_url',
            'eligibility_to_transfer_image_url', 'course_evaluation_image_url', 'good_standing_status_image_url',
            'prior_education_proof_image_url', 'marital_status_image_url', 'request_to_reenroll_image_url',
            'account_clearance_image_url', 'academic_review_image_url', 'health_status_image_url'
        ];

        foreach ($documentFields as $field) {
            if ($request->hasFile($field)) {
                // Delete old file if exists
                if ($student->$field && file_exists(public_path($student->$field))) {
                    unlink(public_path($student->$field));
                }
                
                $file = $request->file($field);
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/students/documents'), $fileName);
                $validated[$field] = 'uploads/students/documents/' . $fileName;
            }
        }

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
        if (isset($studentData['enrollment_date'])) {
            $studentData['date_enrolled'] = $studentData['enrollment_date'];
            unset($studentData['enrollment_date']);
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
            return response()->json(['success' => false, 'error' => 'Student not found'], 404);
        }

        $student->update(['archived' => true]);

        return response()->json(['success' => true, 'message' => 'Student archived successfully']);
    }

    /**
     * Restore student
     */
    public function restore($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['success' => false, 'error' => 'Student not found'], 404);
        }

        $student->update(['archived' => false]);

        return response()->json(['success' => true, 'message' => 'Student restored successfully']);
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
