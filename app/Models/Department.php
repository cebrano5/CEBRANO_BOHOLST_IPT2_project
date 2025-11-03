<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'archived',
    ];

    /**
     * Get the courses in this department.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    /**
     * Get the students in this department.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the faculty in this department.
     */
    public function faculty(): HasMany
    {
        return $this->hasMany(Faculty::class);
    }

    /**
     * Scope to get only active (non-archived) departments.
     */
    public function scopeActive($query)
    {
        return $query->where('archived', false);
    }

    /**
     * Scope to get only archived departments.
     */
    public function scopeArchived($query)
    {
        return $query->where('archived', true);
    }
}
