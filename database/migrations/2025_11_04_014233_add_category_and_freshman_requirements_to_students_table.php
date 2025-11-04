<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCategoryAndFreshmanRequirementsToStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->enum('category', ['freshman', 'other1', 'other2'])->default('freshman')->after('archived');
            $table->string('academic_performance_image_url')->nullable()->after('category');
            $table->string('completion_diploma_image_url')->nullable()->after('academic_performance_image_url');
            $table->string('character_certificate_image_url')->nullable()->after('completion_diploma_image_url');
            $table->string('admission_test_image_url')->nullable()->after('character_certificate_image_url');
            $table->string('application_form_image_url')->nullable()->after('admission_test_image_url');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'academic_performance_image_url',
                'completion_diploma_image_url',
                'character_certificate_image_url',
                'admission_test_image_url',
                'application_form_image_url'
            ]);
        });
    }
}
