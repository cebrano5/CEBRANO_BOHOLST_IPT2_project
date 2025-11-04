<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddRegularIrregularCategoriesToStudents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Modify the existing enum to add regular and irregular categories
        DB::statement("ALTER TABLE students MODIFY COLUMN category ENUM('freshman', 'transferee', 'returnee', 'regular', 'irregular') NOT NULL DEFAULT 'freshman'");
    }

    public function down()
    {
        // Revert back to the previous enum values
        DB::statement("ALTER TABLE students MODIFY COLUMN category ENUM('freshman', 'transferee', 'returnee') NOT NULL DEFAULT 'freshman'");
    }
}
