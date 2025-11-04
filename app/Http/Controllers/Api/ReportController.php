<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Get overall system statistics
     */
    public function dashboard()
    {
        return response()->json([
            'students' => [
                'total' => Student::count(),
                'by_department' => Student::selectRaw('department_id, COUNT(*) as count')
                    ->groupBy('department_id')
                    ->with('department:id,name')
                    ->get(),
            ],
            'faculty' => [
                'total' => Faculty::count(),
                'by_department' => Faculty::selectRaw('department_id, COUNT(*) as count')
                    ->groupBy('department_id')
                    ->with('department:id,name')
                    ->get(),
            ],
            'courses' => [
                'total' => Course::count(),
                'by_department' => Course::selectRaw('department_id, COUNT(*) as count')
                    ->groupBy('department_id')
                    ->with('department:id,name')
                    ->get(),
            ],
            'departments' => Department::count(),
        ]);
    }

    /**
     * Get enrollment report
     */
    public function enrollment()
    {
        $enrollmentData = Student::selectRaw('course_id, COUNT(*) as student_count')
            ->groupBy('course_id')
            ->with('course:id,name,code')
            ->get();

        return response()->json([
            'enrollments' => $enrollmentData,
            'total_enrollments' => Student::count(),
        ]);
    }

    /**
     * Get enrollment by department report
     */
    public function enrollmentByDepartment()
    {
        $data = Student::selectRaw('department_id, COUNT(*) as student_count')
            ->groupBy('department_id')
            ->with('department:id,name,code')
            ->get();

        return response()->json([
            'department_enrollments' => $data,
            'total_students' => Student::count(),
        ]);
    }

    /**
     * Get faculty distribution report
     */
    public function facultyDistribution()
    {
        $byDepartment = Faculty::selectRaw('department_id, COUNT(*) as count')
            ->groupBy('department_id')
            ->with('department:id,name')
            ->get();

        $byEmploymentType = Faculty::selectRaw('employment_type, COUNT(*) as count')
            ->groupBy('employment_type')
            ->get();

        return response()->json([
            'by_department' => $byDepartment,
            'by_employment_type' => $byEmploymentType,
            'total_faculty' => Faculty::count(),
        ]);
    }

    /**
     * Get academic year statistics
     */
    public function academicYears()
    {
        $years = AcademicYear::all();

        return response()->json([
            'success' => true,
            'data' => $years,
            'current_year' => AcademicYear::where('is_current', true)->first(),
        ]);
    }

    /**
     * Get detailed department report
     */
    public function departmentDetails($departmentId)
    {
        $department = Department::with([
            'courses',
            'students' => function ($q) {
                $q->selectRaw('department_id, COUNT(*) as count');
            },
            'faculty' => function ($q) {
                $q->selectRaw('department_id, COUNT(*) as count');
            },
        ])->find($departmentId);

        if (!$department) {
            return response()->json(['error' => 'Department not found'], 404);
        }

        $courseEnrollment = Course::where('department_id', $departmentId)
            ->with(['students' => function ($q) {
                $q->selectRaw('COUNT(*) as count');
            }])
            ->get();

        return response()->json([
            'department' => $department,
            'courses' => [
                'total' => Course::where('department_id', $departmentId)->count(),
                'enrollment_by_course' => $courseEnrollment,
            ],
            'students' => Student::where('department_id', $departmentId)->count(),
            'faculty' => Faculty::where('department_id', $departmentId)->count(),
        ]);
    }

    /**
     * Get course statistics
     */
    public function courseStatistics()
    {
        $courses = Course::with('department')
            ->withCount('students')
            ->get();

        return response()->json([
            'courses' => $courses,
            'average_enrollment' => $courses->avg('students_count'),
            'total_courses' => $courses->count(),
        ]);
    }

    /**
     * Get student enrollment by academic year
     */
    public function studentsByAcademicYear()
    {
        $data = Student::selectRaw('academic_year, COUNT(*) as count')
            ->groupBy('academic_year')
            ->get();

        return response()->json([
            'enrollment_by_year' => $data,
            'total_students' => Student::count(),
        ]);
    }

    /**
     * Generate system health report
     */
    public function systemHealth()
    {
        return response()->json([
            'status' => 'healthy',
            'database_status' => 'connected',
            'statistics' => [
                'total_users' => Student::count() + Faculty::count(),
                'total_courses' => Course::count(),
                'total_departments' => Department::count(),
                'total_academic_years' => AcademicYear::count(),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get student details report
     */
    public function studentDetails(Request $request)
    {
        $limit = $request->query('limit', 100);
        $departmentId = $request->query('department_id');
        $courseId = $request->query('course_id');
        $academicYearId = $request->query('academic_year');
        $category = $request->query('category');

        $query = Student::with('user', 'course', 'department', 'academicYear');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        // Calculate statistics first
        $allStudents = $query->get(); // Get all matching students for stats
        $byDepartment = $allStudents->groupBy(function($item) {
            return $item->department->name ?? 'Unknown';
        })->map(function($group) {
            return ['department' => $group->first()->department->name ?? 'Unknown', 'count' => $group->count()];
        })->values();

        $byCourse = $allStudents->groupBy(function($item) {
            return $item->course->name ?? 'Unknown';
        })->map(function($group) {
            return ['course' => $group->first()->course->name ?? 'Unknown', 'count' => $group->count()];
        })->values();

        $byAcademicYear = $allStudents->groupBy(function($item) {
            return $item->academicYear->name ?? 'Unknown';
        })->map(function($group) {
            return ['year' => $group->first()->academicYear->name ?? 'Unknown', 'count' => $group->count()];
        })->values();

        $byCategory = $allStudents->groupBy('category')->map(function($group) {
            return ['category' => $group->first()->category ?? 'Unknown', 'count' => $group->count()];
        })->values();

        $students = $query->paginate($limit);

        // Add academic year name to each student
        $studentItems = $students->items();
        foreach ($studentItems as $student) {
            $student->academic_year_name = $student->academicYear?->name ?? 'N/A';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'students' => $studentItems,
                'statistics' => [
                    'total' => $allStudents->count(),
                    'byDepartment' => $byDepartment,
                    'byCourse' => $byCourse,
                    'byAcademicYear' => $byAcademicYear,
                    'byCategory' => $byCategory
                ],
                'pagination' => [
                    'total' => $students->total(),
                    'per_page' => $students->perPage(),
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                ],
            ]
        ]);
    }

    /**
     * Get faculty details report
     */
    public function facultyDetails(Request $request)
    {
        $limit = $request->query('limit', 100);
        $departmentId = $request->query('department_id');

        $query = Faculty::with('user', 'department');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        // Calculate statistics first
        $allFaculty = $query->get(); // Get all matching faculty for stats
        $byDepartment = $allFaculty->groupBy(function($item) {
            return $item->department->name ?? 'Unknown';
        })->map(function($group) {
            return ['department' => $group->first()->department->name ?? 'Unknown', 'count' => $group->count()];
        })->values();

        $byEmploymentType = $allFaculty->groupBy('employment_type')->map(function($group) {
            return ['type' => $group->first()->employment_type ?? 'Unknown', 'count' => $group->count()];
        })->values();

        $averageSalary = $allFaculty->avg('salary') ?? 0;

        $faculty = $query->paginate($limit);

        return response()->json([
            'success' => true,
            'data' => [
                'faculty' => $faculty->items(),
                'statistics' => [
                    'total' => $allFaculty->count(),
                    'byDepartment' => $byDepartment,
                    'byEmploymentType' => $byEmploymentType,
                    'averageSalary' => round($averageSalary, 2)
                ],
                'pagination' => [
                    'total' => $faculty->total(),
                    'per_page' => $faculty->perPage(),
                    'current_page' => $faculty->currentPage(),
                    'last_page' => $faculty->lastPage(),
                ],
            ]
        ]);
    }

    /**
     * Export students to Excel
     */
    public function exportStudentsExcel(Request $request)
    {
        $departmentId = $request->query('department_id');
        $courseId = $request->query('course_id');
        $academicYearId = $request->query('academic_year');
        $category = $request->query('category');
        
        $query = Student::with('user', 'course', 'department', 'academicYear');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        $students = $query->get();

        // Create CSV content that Excel can read
        $csv = "Student ID,Name,Email,Department,Course,Academic Year,Category,Phone\n";
        
        foreach ($students as $student) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%s","\'%s"' . "\n",
                $student->student_id ?? 'N/A',
                $student->user->name ?? 'N/A',
                $student->user->email ?? 'N/A',
                $student->department->name ?? 'N/A',
                $student->course->name ?? 'N/A',
                $student->academicYear->name ?? 'N/A',
                $student->category ?? 'N/A',
                $student->phone ?? 'N/A'
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="students_' . date('Y-m-d_His') . '.csv"',
        ]);
    }

    /**
     * Export faculty to Excel
     */
    public function exportFacultyExcel(Request $request)
    {
        $departmentId = $request->query('department_id');
        
        $query = Faculty::with('user', 'department');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $faculty_list = $query->get();

        // Create CSV content that Excel can read
        $csv = "Employee ID,Name,Email,Department,Position,Employment Type,Phone\n";
        
        foreach ($faculty_list as $faculty) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","\'%s"' . "\n",
                $faculty->employee_id ?? 'N/A',
                $faculty->user->name ?? 'N/A',
                $faculty->user->email ?? 'N/A',
                $faculty->department->name ?? 'N/A',
                $faculty->position ?? 'N/A',
                ucfirst(str_replace('_', ' ', $faculty->employment_type ?? 'N/A')),
                $faculty->phone ?? 'N/A'
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="faculty_' . date('Y-m-d_His') . '.csv"',
        ]);
    }

    /**
     * Export enrollment report to Excel
     */
    public function exportEnrollmentExcel()
    {
        $courses = Course::with('students', 'department')->get();

        // Create CSV
        $csv = "Course Code,Course Name,Department,Credits,Enrolled Students,Description\n";
        
        foreach ($courses as $course) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s"' . "\n",
                $course->code ?? 'N/A',
                $course->name ?? 'N/A',
                $course->department->name ?? 'N/A',
                $course->credits ?? 'N/A',
                $course->students->count() ?? 0,
                str_replace('"', '""', $course->description ?? 'N/A')
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="enrollment_' . date('Y-m-d_His') . '.csv"',
        ]);
    }

    /**
     * Export students to PDF
     */
    public function exportStudentsPDF(Request $request)
    {
        $departmentId = $request->query('department_id');
        $courseId = $request->query('course_id');
        $academicYearId = $request->query('academic_year');
        $category = $request->query('category');
        
        $query = Student::with('user', 'course', 'department', 'academicYear');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        $students = $query->get();
        
        $pdf = \PDF::loadView('pdf.students', ['students' => $students]);
        return $pdf->download('students.pdf');
    }

    /**
     * Export faculty to PDF
     */
    public function exportFacultyPDF(Request $request)
    {
        $departmentId = $request->query('department_id');
        
        $query = Faculty::with('user', 'department');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $faculty = $query->get();
        
        $pdf = \PDF::loadView('pdf.faculty', ['faculty' => $faculty]);
        return $pdf->download('faculty.pdf');
    }

    /**
     * Export enrollment report to PDF
     */
    public function exportEnrollmentPDF()
    {
        $enrollments = Student::with('course', 'department', 'user', 'academicYear')->get();
        
        $pdf = \PDF::loadView('pdf.enrollment', ['enrollments' => $enrollments]);
        return $pdf->download('enrollment.pdf');
    }
}
