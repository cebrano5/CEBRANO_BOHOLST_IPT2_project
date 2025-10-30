<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public config endpoint (no auth required)
Route::get('/config', function () {
    try {
        $appUrl = config('app.url', 'http://localhost:8000');
        
        return response()->json([
            'apiBaseUrl' => rtrim($appUrl, '/') . '/api',
            'appUrl' => rtrim($appUrl, '/'),
            'routes' => [
                'auth' => [
                    'login' => '/auth/login',
                    'register' => '/auth/register',
                    'logout' => '/logout',
                ],
                'user' => [
                    'profile' => '/profile',
                    'me' => '/user',
                ],
                'students' => '/students',
                'faculty' => '/faculty',
                'courses' => '/courses',
                'departments' => '/departments',
                'academicYears' => '/academic-years',
                'reports' => [
                    'index' => '/reports',
                    'students' => '/reports/students',
                    'faculty' => '/reports/faculty',
                ],
                'export' => [
                    'students_pdf' => '/export/students/pdf',
                    'students_excel' => '/export/students/excel',
                    'faculty_pdf' => '/export/faculty/pdf',
                    'faculty_excel' => '/export/faculty/excel',
                    'enrollment_excel' => '/export/enrollment/excel',
                    'enrollment_pdf' => '/export/enrollment/pdf',
                ],
                'settings' => '/settings',
                'archive' => '/archive',
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'apiBaseUrl' => 'http://localhost:8000/api',
            'appUrl' => 'http://localhost:8000',
            'error' => $e->getMessage(),
            'routes' => [
                'auth' => [
                    'login' => '/auth/login',
                    'register' => '/auth/register',
                    'logout' => '/logout',
                ],
                'user' => [
                    'profile' => '/profile',
                    'me' => '/user',
                ],
                'students' => '/students',
                'faculty' => '/faculty',
                'courses' => '/courses',
                'departments' => '/departments',
                'academicYears' => '/academic-years',
                'reports' => [
                    'index' => '/reports',
                    'students' => '/reports/students',
                    'faculty' => '/reports/faculty',
                ],
                'export' => [
                    'students_pdf' => '/export/students/pdf',
                    'students_excel' => '/export/students/excel',
                    'faculty_pdf' => '/export/faculty/pdf',
                    'faculty_excel' => '/export/faculty/excel',
                    'enrollment_excel' => '/export/enrollment/excel',
                    'enrollment_pdf' => '/export/enrollment/pdf',
                ],
                'settings' => '/settings',
                'archive' => '/archive',
            ]
        ]);
    }
});

// Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Public routes (no auth required)
Route::get('/academic-years', function () {
    return response()->json(['success' => true, 'data' => \App\Models\AcademicYear::all()]);
});

Route::get('/departments', function () {
    return response()->json(['success' => true, 'data' => \App\Models\Department::all()]);
});

Route::get('/courses', function () {
    return response()->json(['success' => true, 'data' => \App\Models\Course::with('department')->get()]);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/students/stats', [StudentController::class, 'statistics']);
    Route::apiResource('students', StudentController::class);
    Route::get('/faculty/stats', [FacultyController::class, 'statistics']);
    Route::apiResource('faculty', FacultyController::class);
    Route::apiResource('courses', CourseController::class);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/students', [ReportController::class, 'studentDetails']);
    Route::get('/reports/faculty', [ReportController::class, 'facultyDetails']);
    Route::get('/export/students/pdf', [ReportController::class, 'exportStudentsPDF']);
    Route::get('/export/students/excel', [ReportController::class, 'exportStudentsExcel']);
    Route::get('/export/faculty/pdf', [ReportController::class, 'exportFacultyPDF']);
    Route::get('/export/faculty/excel', [ReportController::class, 'exportFacultyExcel']);
    Route::get('/export/enrollment/excel', [ReportController::class, 'exportEnrollmentExcel']);
    Route::get('/export/enrollment/pdf', [ReportController::class, 'exportEnrollmentPDF']);
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::get('/archive', [SettingsController::class, 'archive']);
    Route::post('/departments', [SettingsController::class, 'storeDepartment']);
    Route::put('/departments/{id}', [SettingsController::class, 'updateDepartment']);
    Route::delete('/departments/{id}', [SettingsController::class, 'destroyDepartment']);
    Route::post('/academic-years', [SettingsController::class, 'storeAcademicYear']);
    Route::put('/academic-years/{id}', [SettingsController::class, 'updateAcademicYear']);
    Route::delete('/academic-years/{id}', [SettingsController::class, 'destroyAcademicYear']);
});
