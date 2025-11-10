<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\Student;
use App\Models\Faculty;

class DatabaseSeeder extends Seeder
{
    public function run(){
    // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }
 
}
