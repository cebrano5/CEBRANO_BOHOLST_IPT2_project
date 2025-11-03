<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id',
        'course_id',
        'department_id',
        'academic_year_id',
        'phone',
        'address',
        'archived',
    ];

    protected $appends = [
        'user_name',
        'user_email',
        'course_name',
        'department_name',
    ];

    /**
     * Get the user that owns the student record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course that the student is enrolled in.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the department that the student belongs to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the academic year for the student.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    /**
     * Accessors for flattened data
     */
    public function getUserNameAttribute(): string
    {
        return $this->user?->name ?? 'Unknown';
    }

    public function getUserEmailAttribute(): string
    {
        return $this->user?->email ?? 'Unknown';
    }

    public function getCourseNameAttribute(): string
    {
        return $this->course?->name ?? 'Unknown';
    }

    public function getDepartmentNameAttribute(): string
    {
        return $this->department?->name ?? 'Unknown';
    }

    /**
     * Scope to get only active (non-archived) students.
     */
    public function scopeActive($query)
    {
        return $query->where('archived', false);
    }

    /**
     * Scope to get only archived students.
     */
    public function scopeArchived($query)
    {
        return $query->where('archived', true);
    }
}
