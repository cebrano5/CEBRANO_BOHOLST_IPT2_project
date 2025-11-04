<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Students Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        h1 {
            text-align: center;
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .meta {
            text-align: right;
            color: #666;
            margin-bottom: 20px;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
        }
        th {
            background-color: #007bff;
            color: white;
            padding: 5px;
            text-align: left;
            border: 1px solid #ddd;
        }
        td {
            padding: 4px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <h1>Student Report</h1>
    
    <div class="meta">
        <p>Generated: {{ date('Y-m-d H:i:s') }}</p>
        <p>Total Students: {{ count($students) }}</p>
    </div>

    <table>
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
            @foreach($students as $student)
            <tr>
                <td>{{ $student->student_id }}</td>
                <td>{{ $student->user->name ?? 'N/A' }}</td>
                <td>{{ $student->department->name ?? 'N/A' }}</td>
                <td>{{ $student->course->name ?? 'N/A' }}</td>
                <td>{{ $student->academicYear->name ?? 'N/A' }}</td>
                <td>{{ ucfirst($student->category) ?? 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This is an automatically generated report. Please verify data accuracy.</p>
    </div>
</body>
</html>
