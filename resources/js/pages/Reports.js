import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { AnimatedPage } from '../components/Animations/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RingSpinner } from '../components/Loaders/Spinner';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('student');
  
  // Filter states
  const [studentFilters, setStudentFilters] = useState({
    course_id: '',
    department_id: '',
    academic_year: '',
    category: ''
  });
  
  const [facultyFilters, setFacultyFilters] = useState({
    department_id: '',
    employment_type: ''
  });

  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [deptRes, courseRes, yearRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/courses'),
        axios.get('/api/academic-years')
      ]);

      setDepartments(deptRes.data);
      setCourses(courseRes.data);
      setAcademicYears(yearRes.data);
    } catch (error) {
      setError('Failed to fetch dropdown data');
      console.error('Error fetching dropdown data:', error);
    }
  };

  const generateReport = async (type) => {
    try {
      setLoading(true);
      const filters = type === 'student' ? studentFilters : facultyFilters;
      const response = await axios.get('/api/reports/' + type, {
        params: filters,
        responseType: 'blob'
      });

      const fileName = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(response.data, fileName);
    } catch (error) {
      setError('Failed to generate report');
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === 'student'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('student')}
        >
          Student Reports
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'faculty'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('faculty')}
        >
          Faculty Reports
        </button>
      </div>

      {activeTab === 'student' ? (
        <Card>
          <CardHeader>
            <CardTitle>Student Report Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Department</label>
                <select
                  className="w-full form-select mt-1"
                  value={studentFilters.department_id}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, department_id: e.target.value })
                  }
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Course</label>
                <select
                  className="w-full form-select mt-1"
                  value={studentFilters.course_id}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, course_id: e.target.value })
                  }
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Academic Year</label>
                <select
                  className="w-full form-select mt-1"
                  value={studentFilters.academic_year}
                  onChange={(e) =>
                    setStudentFilters({ ...studentFilters, academic_year: e.target.value })
                  }
                >
                  <option value="">All Years</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => generateReport('student')}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <RingSpinner size="sm" className="text-white" /> : 'Generate Report'}
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Report Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Department</label>
                <select
                  className="w-full form-select mt-1"
                  value={facultyFilters.department_id}
                  onChange={(e) =>
                    setFacultyFilters({ ...facultyFilters, department_id: e.target.value })
                  }
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Employment Type</label>
                <select
                  className="w-full form-select mt-1"
                  value={facultyFilters.employment_type}
                  onChange={(e) =>
                    setFacultyFilters({ ...facultyFilters, employment_type: e.target.value })
                  }
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => generateReport('faculty')}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <RingSpinner size="sm" className="text-white" /> : 'Generate Report'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </AnimatedPage>
  );
};

export default Reports;