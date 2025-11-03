<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Get all courses with pagination and filters
     */
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $search = $request->query('search');
        $departmentId = $request->query('department_id');

        $query = Course::with('department')->active();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $total = $query->count();
        $courses = $query->paginate($limit, ['*'], 'page', $page);

        // Convert paginated items to array and ensure relationships are included
        $data = [];
        foreach ($courses->items() as $course) {
            $course->load('department');
            $data[] = $course->toArray();
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit),
            ],
        ]);
    }

    /**
     * Get single course
     */
    public function show($id)
    {
        $course = Course::with('department', 'students')->find($id);

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        return response()->json(['course' => $course]);
    }

    /**
     * Create new course
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:courses|max:20',
            'department_id' => 'nullable|integer|exists:departments,id',
            'credits' => 'nullable|integer|min:1|max:6',
            'description' => 'sometimes|string',
        ]);

        $course = Course::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'department_id' => $validated['department_id'] ?? null,
            'credits' => $validated['credits'] ?? 3,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json(['course' => $course->load('department')], 201);
    }

    /**
     * Update course
     */
    public function update(Request $request, $id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|unique:courses,code,' . $id . '|max:20',
            'department_id' => 'nullable|integer|exists:departments,id',
            'credits' => 'nullable|integer|min:1|max:6',
            'description' => 'sometimes|string',
        ]);

        $course->update($validated);

        return response()->json(['course' => $course->load('department')]);
    }

    /**
     * Archive course
     */
    public function destroy($id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $course->update(['archived' => true]);

        return response()->json(['message' => 'Course archived successfully']);
    }

    /**
     * Restore course
     */
    public function restore($id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $course->update(['archived' => false]);

        return response()->json(['message' => 'Course restored successfully']);
    }

    /**
     * Get courses by department
     */
    public function byDepartment($departmentId)
    {
        $courses = Course::where('department_id', $departmentId)
                        ->with('department')
                        ->get();

        return response()->json(['courses' => $courses]);
    }

    /**
     * Get course statistics
     */
    public function statistics()
    {
        return response()->json([
            'total_courses' => Course::count(),
            'by_department' => Course::selectRaw('department_id, COUNT(*) as count')
                ->groupBy('department_id')
                ->with('department')
                ->get(),
            'credit_distribution' => Course::selectRaw('credits, COUNT(*) as count')
                ->groupBy('credits')
                ->get(),
        ]);
    }
}
