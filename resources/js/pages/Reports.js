import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatedPage } from '../components/Animations/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
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
  const [employmentTypes] = useState([
    { id: 'full_time', name: 'Full Time' },
    { id: 'part_time', name: 'Part Time' },
    { id: 'contract', name: 'Contract' }
  ]);

  // Fetch departments dynamically
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      const depts = response.data?.data || [];
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  // Fetch courses dynamically
  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      const crses = response.data?.data || [];
      setCourses(crses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  // Fetch academic years dynamically
  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get('/api/academic-years');
      let years = response.data?.data || [];
      
      if (!Array.isArray(years)) {
        console.error('ERROR: years is not an array! Setting to empty array. Type:', typeof years, 'Value:', years);
        years = [];
      }
      
      setAcademicYears(years);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setAcademicYears([]);
    }
  };

  // Generate report with filters
  const generateStudentReport = async (format) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (studentFilters.course_id) params.append('course_id', studentFilters.course_id);
      if (studentFilters.department_id) params.append('department_id', studentFilters.department_id);
      if (studentFilters.academic_year) params.append('academic_year', studentFilters.academic_year);
      if (studentFilters.category) params.append('category', studentFilters.category);
      if (format) params.append('format', format);
      
      if (format) {
        // For downloads
        const exportPath = format === 'pdf' ? '/api/export/students/pdf' : '/api/export/students/excel';
        const url = `${exportPath}?${params.toString()}`;
        
        try {
          const response = await axios.get(url, {
            responseType: 'blob',
          });
          
          // Create download link
          const blob = new Blob([response.data], { 
            type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
          });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `students_report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'csv'}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          
          alert(`${format.toUpperCase()} report downloaded successfully!`);
        } catch (error) {
          console.error('Download error:', error);
          alert(`Failed to download ${format.toUpperCase()} report`);
        }
      } else {
        // For preview
        const response = await axios.get(`/api/reports/students?${params.toString()}`);
        
        const reportData = response.data?.data || response.data;
        const students = reportData?.students;
        
        if (students && Array.isArray(students)) {
          setReportData({
            data: {
              students: reportData.students,
              statistics: reportData.statistics || {
                total: reportData.students.length,
                byCourse: [],
                byDepartment: [],
                byAcademicYear: []
              }
            }
          });
          setActiveTab('student');
        } else {
          console.error('Invalid response format:', response.data);
          alert('No data available for the selected filters or invalid response format');
        }
      }
    } catch (error) {
      console.error('Error generating student report:', error);
      alert(error.response?.data?.message || 'Failed to generate student report');
    } finally {
      setLoading(false);
    }
  };

  const generateFacultyReport = async (format) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (facultyFilters.department_id) params.append('department_id', facultyFilters.department_id);
      if (facultyFilters.employment_type) params.append('employment_type', facultyFilters.employment_type);
      if (format) params.append('format', format);
      
      if (format) {
        // For downloads
        const exportPath = format === 'pdf' ? '/api/export/faculty/pdf' : '/api/export/faculty/excel';
        const url = `${exportPath}?${params.toString()}`;
        
        try {
          const response = await axios.get(url, {
            responseType: 'blob',
          });
          
          // Create download link
          const blob = new Blob([response.data], { 
            type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
          });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `faculty_report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'csv'}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          
          alert(`${format.toUpperCase()} report downloaded successfully!`);
        } catch (error) {
          console.error('Download error:', error);
          alert(`Failed to download ${format.toUpperCase()} report`);
        }
      } else {
        // For preview
        const response = await axios.get(`/api/reports/faculty?${params.toString()}`);
        
        const reportData = response.data?.data || response.data;
        const faculty = reportData?.faculty;
        
        if (faculty && Array.isArray(faculty)) {
          setReportData({
            data: {
              faculty: reportData.faculty,
              statistics: reportData.statistics || {
                total: reportData.faculty.length,
                byDepartment: [],
                byEmploymentType: [],
                averageSalary: 0
              }
            }
          });
          setActiveTab('faculty');
        } else {
          console.error('Invalid response format:', response.data);
          alert('No data available for the selected filters or invalid response format');
        }
      }
    } catch (error) {
      console.error('Error generating faculty report:', error);
      alert(error.response?.data?.message || 'Failed to generate faculty report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchAcademicYears();
  }, []);

  return (
    <AnimatedPage className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate comprehensive reports for students and faculty with advanced filtering options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Student Reports
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate detailed reports filtered by course and department.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student Filters */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-sm">Filter Options:</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <select
                  value={studentFilters.course_id}
                  onChange={(e) => setStudentFilters({...studentFilters, course_id: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={studentFilters.department_id}
                  onChange={(e) => setStudentFilters({...studentFilters, department_id: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={studentFilters.academic_year}
                  onChange={(e) => setStudentFilters({...studentFilters, academic_year: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Academic Years</option>
                  {Array.isArray(academicYears) && academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name || `${year.start_year} - ${year.end_year}`}
                    </option>
                  ))}
                </select>
                
                <select
                  value={studentFilters.category}
                  onChange={(e) => setStudentFilters({...studentFilters, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="freshman">Freshman</option>
                  <option value="transferee">Transferee</option>
                  <option value="returnee">Returnee</option>
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>
            </div>

            {/* Student Report Actions */}
            <div className="space-y-3">
              <button 
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4" 
                onClick={() => generateStudentReport()}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Preview Report
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                  onClick={() => generateStudentReport('pdf')}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  PDF
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                  onClick={() => generateStudentReport('excel')}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Excel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Faculty Reports
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate comprehensive faculty reports filtered by department.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Faculty Filters */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-sm">Filter Options:</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <select
                  value={facultyFilters.department_id}
                  onChange={(e) => setFacultyFilters({...facultyFilters, department_id: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={facultyFilters.employment_type}
                  onChange={(e) => setFacultyFilters({...facultyFilters, employment_type: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Employment Types</option>
                  {employmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Faculty Report Actions */}
            <div className="space-y-3">
              <button 
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4" 
                onClick={() => generateFacultyReport()}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Preview Report
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                  onClick={() => generateFacultyReport('pdf')}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  PDF
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                  onClick={() => generateFacultyReport('excel')}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Excel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {activeTab === 'student' ? 'Student' : 'Faculty'} Report Preview
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total {activeTab === 'student' ? 'Students' : 'Faculty'}: {reportData.data?.statistics?.total || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 ${
                    activeTab === 'student' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setActiveTab('student')}
                >
                  Student Report
                </button>
                <button
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-3 ${
                    activeTab === 'faculty' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setActiveTab('faculty')}
                >
                  Faculty Report
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'student' ? (
              // Student Report Preview
              reportData.data?.students && reportData.data.students.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-blue-600">Total Students</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reportData.data?.statistics?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm text-green-600">By Course</p>
                      <p className="text-sm text-green-900 dark:text-green-100">
                        {reportData.data?.statistics?.byCourse && Array.isArray(reportData.data.statistics.byCourse) 
                          ? reportData.data.statistics.byCourse.length 
                          : 0} courses
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm text-purple-600">By Department</p>
                      <p className="text-sm text-purple-900 dark:text-purple-100">
                        {reportData.data?.statistics?.byDepartment && Array.isArray(reportData.data.statistics.byDepartment)
                          ? reportData.data.statistics.byDepartment.length
                          : 0} departments
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-sm text-orange-600">Academic Years</p>
                      <p className="text-sm text-orange-900 dark:text-orange-100">
                        {reportData.data?.statistics?.byAcademicYear && Array.isArray(reportData.data.statistics.byAcademicYear)
                          ? reportData.data.statistics.byAcademicYear.length
                          : 0} years
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-sm text-red-600">By Category</p>
                      <p className="text-sm text-red-900 dark:text-red-100">
                        {reportData.data?.statistics?.byCategory && Array.isArray(reportData.data.statistics.byCategory)
                          ? reportData.data.statistics.byCategory.length
                          : 0} categories
                      </p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Student ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Course</th>
                          <th className="text-left p-2">Department</th>
                          <th className="text-left p-2">Academic Year</th>
                          <th className="text-left p-2">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.students.slice(0, 10).map((student, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{student.student_id}</td>
                            <td className="p-2">{student.user_name}</td>
                            <td className="p-2">{student.course_name || student.course_code || 'N/A'}</td>
                            <td className="p-2">{student.department_name || 'N/A'}</td>
                            <td className="p-2">{student.academic_year_name || 'N/A'}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                student.category === 'freshman' ? 'bg-blue-100 text-blue-800' :
                                student.category === 'transferee' ? 'bg-green-100 text-green-800' :
                                student.category === 'returnee' ? 'bg-purple-100 text-purple-800' :
                                student.category === 'regular' ? 'bg-orange-100 text-orange-800' :
                                student.category === 'irregular' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {student.category ? student.category.charAt(0).toUpperCase() + student.category.slice(1) : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {reportData.data.students.length > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      Showing first 10 of {reportData.data.students.length} students. Export to see all data.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No student data found for the selected filters.</p>
              )
            ) : (
              // Faculty Report Preview
              reportData.data?.faculty && reportData.data.faculty.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-blue-600">Total Faculty</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reportData.data?.statistics?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm text-green-600">Avg Salary</p>
                      <p className="text-sm text-green-900 dark:text-green-100">${reportData.data?.statistics?.averageSalary?.toFixed(0) || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm text-purple-600">Departments</p>
                      <p className="text-sm text-purple-900 dark:text-purple-100">
                        {reportData.data?.statistics?.byDepartment && Array.isArray(reportData.data.statistics.byDepartment)
                          ? reportData.data.statistics.byDepartment.length
                          : 0} departments
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-sm text-orange-600">Employment Types</p>
                      <p className="text-sm text-orange-900 dark:text-orange-100">
                        {reportData.data?.statistics?.byEmploymentType && Array.isArray(reportData.data.statistics.byEmploymentType)
                          ? reportData.data.statistics.byEmploymentType.length
                          : 0} types
                      </p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Employee ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Department</th>
                          <th className="text-left p-2">Position</th>
                          <th className="text-left p-2">Employment Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.faculty.slice(0, 10).map((faculty, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{faculty.employee_id}</td>
                            <td className="p-2">{faculty.user_name}</td>
                            <td className="p-2">{faculty.department_name || 'N/A'}</td>
                            <td className="p-2">{faculty.position}</td>
                            <td className="p-2">{faculty.employment_type?.replace('_', ' ').toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {reportData.data.faculty.length > 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      Showing first 10 of {reportData.data.faculty.length} faculty. Export to see all data.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No faculty data found for the selected filters.</p>
              )
            )}
          </CardContent>
        </Card>
      )}
    </AnimatedPage>
  );
};

export default Reports;