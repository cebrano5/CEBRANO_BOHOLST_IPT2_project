<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Faculty Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 20px;
            font-size: 12px;
        }
        .header {
            background-color: #10b981;
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
            color: #10b981;
            border-bottom: 2px solid #10b981;
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
            background-color: #10b981;
            color: white;
            padding: 10px 6px;
            text-align: left;
            font-size: 9px;
            border: 1px solid #059669;
        }
        table.data-table td {
            padding: 8px 6px;
            border: 1px solid #dee2e6;
            font-size: 8px;
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
        .badge-full_time { background-color: #dbeafe; color: #1e40af; }
        .badge-part_time { background-color: #fef3c7; color: #92400e; }
        .badge-contract { background-color: #e9d5ff; color: #6b21a8; }
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
        <h1>Faculty Management Report</h1>
        <p>Comprehensive overview of faculty members</p>
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
                    <span class="meta-label">Total Faculty</span>
                    <span class="meta-value">{{ count($faculty) }}</span>
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
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Employment</th>
                <th>Email</th>
                <th>Phone</th>
            </tr>
        </thead>
        <tbody>
            @forelse($faculty as $member)
            <tr>
                <td><strong>{{ $member->employee_id }}</strong></td>
                <td>{{ $member->user->name ?? 'N/A' }}</td>
                <td>{{ $member->department->name ?? 'N/A' }}</td>
                <td>{{ $member->position ?? 'N/A' }}</td>
                <td>
                    <span class="badge badge-{{ strtolower($member->employment_type ?? 'full_time') }}">
                        {{ ucwords(str_replace('_', ' ', $member->employment_type ?? 'N/A')) }}
                    </span>
                </td>
                <td>{{ $member->user->email ?? 'N/A' }}</td>
                <td>{{ $member->phone ?? 'N/A' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #999;">
                    No faculty data available
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

