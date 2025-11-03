<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\AcademicYear;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get settings data
     */
    public function index()
    {
        $settings = [
            'departments' => Department::active()->get(),
            'academic_years' => AcademicYear::active()->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get archived data
     */
    public function archive()
    {
        $archivedData = [
            'departments' => Department::archived()->get(),
            'courses' => Course::archived()->with('department')->get(),
            'academic_years' => AcademicYear::archived()->get(),
            'students' => \App\Models\Student::archived()->with('user', 'course', 'department', 'academicYear')->get(),
            'faculty' => \App\Models\Faculty::archived()->with('user', 'department')->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $archivedData,
        ]);
    }

    /**
     * Get active academic years (public route)
     */
    public function getAcademicYears()
    {
        return response()->json(['success' => true, 'data' => AcademicYear::active()->get()]);
    }

    /**
     * Get active departments (public route)
     */
    public function getDepartments()
    {
        return response()->json(['success' => true, 'data' => Department::active()->get()]);
    }

    /**
     * Get active courses (public route)
     */
    public function getCourses()
    {
        return response()->json(['success' => true, 'data' => Course::active()->with('department')->get()]);
    }

    /**
     * Store a new department
     */
    public function storeDepartment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $department = Department::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $department,
            'message' => 'Department created successfully',
        ], 201);
    }

    /**
     * Update a department
     */
    public function updateDepartment(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $department->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $department,
            'message' => 'Department updated successfully',
        ]);
    }

    /**
     * Archive a department
     */
    public function destroyDepartment($id)
    {
        $department = Department::findOrFail($id);
        $department->update(['archived' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Department archived successfully',
        ]);
    }

    /**
     * Store a new academic year
     */
    public function storeAcademicYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50',
            'start_year' => 'required|integer|min:2000|max:2100',
            'end_year' => 'required|integer|min:2000|max:2100|gte:start_year',
            'is_current' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // If setting as current, unset other current years
        if ($request->is_current) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $academicYear = AcademicYear::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $academicYear,
            'message' => 'Academic year created successfully',
        ], 201);
    }

    /**
     * Update an academic year
     */
    public function updateAcademicYear(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50',
            'start_year' => 'required|integer|min:2000|max:2100',
            'end_year' => 'required|integer|min:2000|max:2100|gte:start_year',
            'is_current' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // If setting as current, unset other current years
        if ($request->is_current) {
            AcademicYear::where('is_current', true)->where('id', '!=', $id)->update(['is_current' => false]);
        }

        $academicYear->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $academicYear,
            'message' => 'Academic year updated successfully',
        ]);
    }

    /**
     * Archive an academic year
     */
    public function destroyAcademicYear($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYear->update(['archived' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Academic year archived successfully',
        ]);
    }

    /**
     * Restore a department
     */
    public function restoreDepartment($id)
    {
        $department = Department::findOrFail($id);
        $department->update(['archived' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Department restored successfully',
        ]);
    }

    /**
     * Restore an academic year
     */
    public function restoreAcademicYear($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYear->update(['archived' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Academic year restored successfully',
        ]);
    }

    /**
     * Restore a student
     */
    public function restoreStudent($id)
    {
        $student = \App\Models\Student::findOrFail($id);
        $student->update(['archived' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Student restored successfully',
        ]);
    }

    /**
     * Restore a faculty member
     */
    public function restoreFaculty($id)
    {
        $faculty = \App\Models\Faculty::findOrFail($id);
        $faculty->update(['archived' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Faculty member restored successfully',
        ]);
    }
}