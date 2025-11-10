<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Students Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 20px;
            font-size: 12px;
        }
        .header {
            background-color: #667eea;
            color: white;
            padding: 20px;
            margin: -20px -20px 20px -20px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 24px;
        }
        .header p {
            margin: 0;
            font-size: 12px;
        }
        .meta-info {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid #dee2e6;
        }
        .meta-info h2 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        .meta-table {
            width: 100%;
            margin-top: 10px;
        }
        .meta-table td {
            padding: 8px;
            background-color: white;
            border: 1px solid #dee2e6;
            width: 33.33%;
        }
        .meta-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            display: block;
            margin-bottom: 3px;
        }
        .meta-value {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table.data-table th {
            background-color: #667eea;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
            border: 1px solid #5568d3;
        }
        table.data-table td {
            padding: 8px;
            border: 1px solid #dee2e6;
            font-size: 9px;
        }
        table.data-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            display: inline-block;
        }
        .badge-freshman { background-color: #e3f2fd; color: #1976d2; }
        .badge-transferee { background-color: #e8f5e9; color: #388e3c; }
        .badge-returnee { background-color: #f3e5f5; color: #7b1fa2; }
        .badge-regular { background-color: #fff3e0; color: #f57c00; }
        .badge-irregular { background-color: #ffebee; color: #c62828; }
        .footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #dee2e6;
            text-align: center;
            font-size: 9px;
            color: #6c757d;
        }
        .footer p {
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Student Management Report</h1>
        <p>Comprehensive overview of enrolled students</p>
    </div>

    <div class="meta-info">
        <h2>Report Summary</h2>
        <table class="meta-table">
            <tr>
                <td>
                    <span class="meta-label">Generated</span>
                    <span class="meta-value">{{ date('M d, Y') }}</span>
                </td>
                <td>
                    <span class="meta-label">Total Students</span>
                    <span class="meta-value">{{ count($students) }}</span>
                </td>
                <td>
                    <span class="meta-label">Report Time</span>
                    <span class="meta-value">{{ date('H:i') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Course</th>
                <th>Academic Year</th>
                <th>Category</th>
            </tr>
        </thead>
        <tbody>
            @forelse($students as $student)
            <tr>
                <td><strong>{{ $student->student_id }}</strong></td>
                <td>{{ $student->user->name ?? 'N/A' }}</td>
                <td>{{ $student->department->name ?? 'N/A' }}</td>
                <td>{{ $student->course->name ?? 'N/A' }}</td>
                <td>{{ $student->academicYear->name ?? 'N/A' }}</td>
                <td>
                    <span class="badge badge-{{ strtolower($student->category ?? 'regular') }}">
                        {{ ucfirst($student->category ?? 'N/A') }}
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #999;">
                    No student data available
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p><strong>Student Faculty Management System</strong></p>
        <p>This is an automatically generated report. Please verify all data for accuracy.</p>
        <p>&copy; {{ date('Y') }} - Confidential Document</p>
    </div>
</body>
</html>
