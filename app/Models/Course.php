<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'department_id',
        'credits',
        'description',
        'archived',
        'status',
    ];

    /**
     * Get the department that owns the course.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the students enrolled in this course.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Scope to get only active (non-archived) courses.
     */
    public function scopeActive($query)
    {
        return $query->where('archived', false);
    }

    /**
     * Scope to get only archived courses.
     */
    public function scopeArchived($query)
    {
        return $query->where('archived', true);
    }
}
