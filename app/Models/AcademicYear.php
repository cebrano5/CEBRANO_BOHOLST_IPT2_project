<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    use HasFactory;

    protected $table = 'academic_years';

    protected $fillable = [
        'name',
        'start_year',
        'end_year',
        'is_current',
        'archived',
        'status',
    ];

    protected $casts = [
        'is_current' => 'boolean',
    ];

    /**
     * Get the students for this academic year.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'academic_year_id');
    }

    /**
     * Scope to get only active (non-archived) academic years.
     */
    public function scopeActive($query)
    {
        return $query->where('archived', false);
    }

    /**
     * Scope to get only archived academic years.
     */
    public function scopeArchived($query)
    {
        return $query->where('archived', true);
    }
}
