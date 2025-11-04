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
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create departments
        $departments = [];
        $deptData = [
            ['name' => 'Computer Science', 'code' => 'CS'],
            ['name' => 'Engineering', 'code' => 'ENG'],
            ['name' => 'Business', 'code' => 'BIZ'],
            ['name' => 'Arts', 'code' => 'ART'],
            ['name' => 'Sciences', 'code' => 'SCI'],
        ];
        
        foreach ($deptData as $data) {
            $departments[] = Department::create([
                'name' => $data['name'],
                'code' => $data['code'],
                'description' => "Department of {$data['name']}",
            ]);
        }

        // Create academic years
        $years = [];
        for ($i = 2023; $i <= 2025; $i++) {
            $years[] = AcademicYear::create([
                'name' => "{$i}-" . ($i + 1),
                'start_year' => $i,
                'end_year' => $i + 1,
                'is_current' => ($i == 2024),
            ]);
        }

        // Create courses
        $courses = [];
        $courseData = [
            ['name' => 'Introduction to Programming', 'code' => 'CS101', 'credits' => 3],
            ['name' => 'Data Structures', 'code' => 'CS201', 'credits' => 4],
            ['name' => 'Web Development', 'code' => 'CS301', 'credits' => 3],
            ['name' => 'Database Systems', 'code' => 'CS302', 'credits' => 4],
            ['name' => 'Software Engineering', 'code' => 'CS401', 'credits' => 4],
            ['name' => 'Advanced Mathematics', 'code' => 'MA201', 'credits' => 4],
            ['name' => 'Physics 1', 'code' => 'PH101', 'credits' => 4],
            ['name' => 'Chemistry 1', 'code' => 'CH101', 'credits' => 3],
            ['name' => 'Business Management', 'code' => 'BZ101', 'credits' => 3],
            ['name' => 'Economics', 'code' => 'EC101', 'credits' => 3],
        ];

        foreach ($courseData as $data) {
            $courses[] = Course::create(array_merge($data, [
                'department_id' => $departments[rand(0, count($departments) - 1)]->id,
                'description' => "This is a course on {$data['name']}",
            ]));
        }

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create faculty members
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => "Professor Smith {$i}",
                'email' => "faculty{$i}@example.com",
                'password' => bcrypt('password'),
                'role' => 'faculty',
            ]);

            Faculty::create([
                'user_id' => $user->id,
                'employee_id' => "EMP" . str_pad($i, 5, '0', STR_PAD_LEFT),
                'department_id' => $departments[rand(0, count($departments) - 1)]->id,
                'position' => ['Assistant Professor', 'Associate Professor', 'Professor'][rand(0, 2)],
                'employment_type' => ['full_time', 'part_time'][rand(0, 1)],
                'salary' => rand(50000, 120000),
                'phone' => '555-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'address' => "Faculty Address {$i}, City",
                'qualifications' => 'PhD, Master\'s Degree',
                'specializations' => 'Computer Science, Programming',
            ]);
        }

        // Create students with categories
        $categories = ['freshman', 'transferee', 'returnee'];
        
        for ($i = 1; $i <= 50; $i++) {
            $user = User::create([
                'name' => "Student Name {$i}",
                'email' => "student{$i}@sfms.local",
                'password' => bcrypt('password123'),
                'role' => 'student',
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'student_id' => "STU" . str_pad($i, 6, '0', STR_PAD_LEFT),
                'department_id' => $departments[rand(0, count($departments) - 1)]->id,
                'academic_year_id' => $years[rand(0, count($years) - 1)]->id,
                'course_id' => $courses[rand(0, count($courses) - 1)]->id,
                'phone' => '555-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'address' => "Student Address {$i}, City",
                'category' => $categories[rand(0, count($categories) - 1)],
            ]);
        }

        // Create many regular students
        for ($i = 51; $i <= 200; $i++) {
            $user = User::create([
                'name' => "Regular Student {$i}",
                'email' => "regular{$i}@sfms.local",
                'password' => bcrypt('password123'),
                'role' => 'student',
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'student_id' => "REG" . str_pad($i, 6, '0', STR_PAD_LEFT),
                'department_id' => $departments[rand(0, count($departments) - 1)]->id,
                'academic_year_id' => $years[rand(0, count($years) - 1)]->id,
                'course_id' => $courses[rand(0, count($courses) - 1)]->id,
                'phone' => '555-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'address' => "Regular Student Address {$i}, City",
                'category' => 'regular',
            ]);
        }

        // Create many irregular students
        for ($i = 201; $i <= 350; $i++) {
            $user = User::create([
                'name' => "Irregular Student {$i}",
                'email' => "irregular{$i}@sfms.local",
                'password' => bcrypt('password123'),
                'role' => 'student',
            ]);

            $student = Student::create([
                'user_id' => $user->id,
                'student_id' => "IRR" . str_pad($i, 6, '0', STR_PAD_LEFT),
                'department_id' => $departments[rand(0, count($departments) - 1)]->id,
                'academic_year_id' => $years[rand(0, count($years) - 1)]->id,
                'course_id' => $courses[rand(0, count($courses) - 1)]->id,
                'phone' => '555-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'address' => "Irregular Student Address {$i}, City",
                'category' => 'irregular',
            ]);
        }

        $this->command->info('Database seeded successfully with test data!');
        $this->command->info('Total Students Created: 350');
        $this->command->info('  - Freshman/Transferee/Returnee: 50 students');
        $this->command->info('  - Regular Students: 150 students');
        $this->command->info('  - Irregular Students: 150 students');
        $this->command->info('');
        $this->command->info('Test Users:');
        $this->command->info('  Admin: admin@example.com / password');
        $this->command->info('  Faculty: faculty1@example.com / password');
        $this->command->info('  Student: student1@sfms.local / password123');
        $this->command->info('  Regular Student: regular51@sfms.local / password123');
        $this->command->info('  Irregular Student: irregular201@sfms.local / password123');
    }
}
