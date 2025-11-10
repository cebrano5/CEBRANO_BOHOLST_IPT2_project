<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PDF;

class TestPdfCommand extends Command
{
    protected $signature = 'test:pdf';
    protected $description = 'Test PDF generation';

    public function handle()
    {
        try {
            $this->info('Testing PDF generation...');
            
            $data = [
                'students' => collect([
                    (object)[
                        'student_id' => 'TEST-001',
                        'user' => (object)['name' => 'Test Student'],
                        'department' => (object)['name' => 'Test Dept'],
                        'course' => (object)['name' => 'Test Course'],
                        'academicYear' => (object)['name' => '2023-2024'],
                        'category' => 'regular'
                    ]
                ]),
                'total' => 1,
                'generated_at' => now()->format('Y-m-d H:i:s')
            ];
            
            $pdf = PDF::loadView('pdf.students', $data);
            $pdf->setPaper('a4', 'landscape');
            
            $filename = storage_path('app/test_students.pdf');
            $pdf->save($filename);
            
            $this->info('PDF generated successfully!');
            $this->info('File saved to: ' . $filename);
            $this->info('File size: ' . filesize($filename) . ' bytes');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('PDF generation failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
