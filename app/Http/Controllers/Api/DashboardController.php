<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        // Student Statistics
        $studentStats = [
            'total' => Student::where('archived', false)->count(),
            'byCourse' => Student::where('archived', false)
                ->select('course_id', DB::raw('count(*) as count'))
                ->groupBy('course_id')
                ->with('course:id,name')
                ->get()
                ->map(function ($item) {
                    return [
                        'course' => $item->course ? $item->course->name : 'Unspecified',
                        'count' => $item->count
                    ];
                }),
            'byDepartment' => Student::where('students.archived', false)
                ->join('courses', 'students.course_id', '=', 'courses.id')
                ->join('departments', 'courses.department_id', '=', 'departments.id')
                ->select('departments.name', DB::raw('count(*) as count'))
                ->groupBy('departments.id', 'departments.name')
                ->get()
                ->map(function ($item) {
                    return [
                        'department' => $item->name,
                        'count' => $item->count
                    ];
                })
        ];

        // Faculty Statistics
        $facultyStats = [
            'total' => Faculty::where('archived', false)->count(),
            'averageSalary' => (int)Faculty::where('archived', false)->avg('salary'),
            'byDepartment' => Faculty::where('faculty.archived', false)
                ->join('departments', 'faculty.department_id', '=', 'departments.id')
                ->select('departments.name', DB::raw('count(*) as count'))
                ->groupBy('departments.id', 'departments.name')
                ->get()
                ->map(function ($item) {
                    return [
                        'department' => $item->name,
                        'count' => $item->count
                    ];
                }),
            'byEmploymentType' => Faculty::where('archived', false)
                ->select('employment_type', DB::raw('count(*) as count'))
                ->groupBy('employment_type')
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => $item->employment_type,
                        'count' => $item->count
                    ];
                })
        ];

        return response()->json([
            'students' => $studentStats,
            'faculty' => $facultyStats,
            'departments' => Department::where('archived', false)->count(),
            'courses' => Course::where('archived', false)->count(),
        ]);
    }
}