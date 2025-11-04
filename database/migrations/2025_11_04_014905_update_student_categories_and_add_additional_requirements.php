<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateStudentCategoriesAndAddAdditionalRequirements extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // Update category enum to use proper names (drop and recreate)
            DB::statement('ALTER TABLE students DROP COLUMN category');
            $table->enum('category', ['freshman', 'transferee', 'returnee', 'regular', 'irregular'])->default('freshman')->after('archived');
            
            // Transferee requirements
            $table->string('college_academic_record_tor_image_url')->nullable()->after('application_form_image_url');
            $table->string('eligibility_to_transfer_image_url')->nullable()->after('college_academic_record_tor_image_url');
            $table->string('course_evaluation_image_url')->nullable()->after('eligibility_to_transfer_image_url');
            $table->string('good_standing_status_image_url')->nullable()->after('course_evaluation_image_url');
            $table->string('prior_education_proof_image_url')->nullable()->after('good_standing_status_image_url');
            $table->string('marital_status_image_url')->nullable()->after('prior_education_proof_image_url');
            
            // Returnee requirements
            $table->string('request_to_reenroll_image_url')->nullable()->after('marital_status_image_url');
            $table->string('account_clearance_image_url')->nullable()->after('request_to_reenroll_image_url');
            $table->string('academic_review_image_url')->nullable()->after('account_clearance_image_url');
            $table->string('health_status_image_url')->nullable()->after('academic_review_image_url');
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
                'college_academic_record_tor_image_url',
                'eligibility_to_transfer_image_url',
                'course_evaluation_image_url',
                'good_standing_status_image_url',
                'prior_education_proof_image_url',
                'marital_status_image_url',
                'request_to_reenroll_image_url',
                'account_clearance_image_url',
                'academic_review_image_url',
                'health_status_image_url'
            ]);
            
            // Revert category enum back to old values
            $table->dropColumn('category');
            $table->enum('category', ['freshman', 'other1', 'other2'])->default('freshman')->after('archived');
        });
    }
}
