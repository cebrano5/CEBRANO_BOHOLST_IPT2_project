import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { FileText, Download, BarChart3, Eye } from 'lucide-react';
import { getAxiosClient } from '../lib/apiConfig';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');
  
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
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [employmentTypes] = useState([
    { id: 'full-time', name: 'Full-time' },
    { id: 'part-time', name: 'Part-time' },
    { id: 'contractual', name: 'Contractual' }
  ]);

  // Fetch departments dynamically
  const fetchDepartments = async () => {
    try {
      const api = getAxiosClient();
      const response = await api.get('/departments');
      // Handle the response format: { success: true, data: [...] }
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
      const api = getAxiosClient();
      const response = await api.get('/courses');
      // Handle the response format: { success: true, data: [...] }
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
      const api = getAxiosClient();
      const response = await api.get('/academic-years');
      
      // Handle the response format: { success: true, data: [...] }
      let years = response.data?.data || [];
      
      // ABSOLUTELY ensure we're setting an array
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
  const generateStudentReport = async (format?: 'pdf' | 'excel') => {
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
        // For downloads, use axios to get the file with proper auth headers
        const exportPath = format === 'pdf' ? '/export/students/pdf' : '/export/students/excel';
        const url = `${exportPath}?${params.toString()}`;
        
        try {
          const api = getAxiosClient();
          const response = await api.get(url, {
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
        const api = getAxiosClient();
        const response = await api.get(`/reports/students?${params.toString()}`);
        
        // Handle response - backend returns { success: true, data: { students: [...], statistics: {...} } }
        const reportData = response.data?.data || response.data;
        const students = reportData?.students;
        
        if (students && Array.isArray(students)) {
          // Set the report data with the statistics from the response
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
    } catch (error: any) {
      console.error('Error generating student report:', error);
      alert(error.response?.data?.message || 'Failed to generate student report');
    } finally {
      setLoading(false);
    }
  };

  const generateFacultyReport = async (format?: 'pdf' | 'excel') => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (facultyFilters.department_id) params.append('department_id', facultyFilters.department_id);
      if (facultyFilters.employment_type) params.append('employment_type', facultyFilters.employment_type);
      if (format) params.append('format', format);
      
      if (format) {
        // For downloads, use axios to get the file with proper auth headers
        const exportPath = format === 'pdf' ? '/export/faculty/pdf' : '/export/faculty/excel';
        const url = `${exportPath}?${params.toString()}`;
        
        try {
          const api = getAxiosClient();
          const response = await api.get(url, {
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
        const api = getAxiosClient();
        const response = await api.get(`/reports/faculty?${params.toString()}`);
        
        // Handle response - backend returns { success: true, data: { faculty: [...], statistics: {...} } }
        const reportData = response.data?.data || response.data;
        const faculty = reportData?.faculty;
        
        if (faculty && Array.isArray(faculty)) {
          // Set the report data with the statistics from the response
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
    } catch (error: any) {
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
    <div className="space-y-6">
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
              <BarChart3 className="mr-2 h-5 w-5" />
              Student Reports
            </CardTitle>
            <CardDescription>
              Generate detailed reports filtered by course and department.
            </CardDescription>
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
              <Button 
                className="w-full" 
                onClick={() => generateStudentReport()}
                disabled={loading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Report
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => generateStudentReport('pdf')}
                  disabled={loading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => generateStudentReport('excel')}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Faculty Reports
            </CardTitle>
            <CardDescription>
              Generate comprehensive faculty reports filtered by department.
            </CardDescription>
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
              <Button 
                className="w-full" 
                onClick={() => generateFacultyReport()}
                disabled={loading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Report
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => generateFacultyReport('pdf')}
                  disabled={loading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => generateFacultyReport('excel')}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview - Single Preview That Switches Between Student and Faculty */}
      {reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {activeTab === 'student' ? 'Student' : 'Faculty'} Report Preview
                </CardTitle>
                <CardDescription>
                  Total {activeTab === 'student' ? 'Students' : 'Faculty'}: {reportData.data?.statistics?.total || 0}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'student' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('student')}
                >
                  Student Report
                </Button>
                <Button
                  variant={activeTab === 'faculty' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('faculty')}
                >
                  Faculty Report
                </Button>
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
                      <p className="text-2xl font-bold text-blue-900">{reportData.data?.statistics?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm text-green-600">By Course</p>
                      <p className="text-sm text-green-900">
                        {reportData.data?.statistics?.byCourse && Array.isArray(reportData.data.statistics.byCourse) 
                          ? reportData.data.statistics.byCourse.length 
                          : 0} courses
                      </p>
                      {reportData.data?.statistics?.byCourse && reportData.data.statistics.byCourse.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {reportData.data.statistics.byCourse.slice(0, 2).map((item: any) => (
                            <div key={item.course}>{item.course}: {item.count}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm text-purple-600">By Department</p>
                      <p className="text-sm text-purple-900">
                        {reportData.data?.statistics?.byDepartment && Array.isArray(reportData.data.statistics.byDepartment)
                          ? reportData.data.statistics.byDepartment.length
                          : 0} departments
                      </p>
                      {reportData.data?.statistics?.byDepartment && reportData.data.statistics.byDepartment.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">
                          {reportData.data.statistics.byDepartment.slice(0, 2).map((item: any) => (
                            <div key={item.department}>{item.department}: {item.count}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-sm text-orange-600">Academic Years</p>
                      <p className="text-sm text-orange-900">
                        {reportData.data?.statistics?.byAcademicYear && Array.isArray(reportData.data.statistics.byAcademicYear)
                          ? reportData.data.statistics.byAcademicYear.length
                          : 0} years
                      </p>
                      {reportData.data?.statistics?.byAcademicYear && reportData.data.statistics.byAcademicYear.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {reportData.data.statistics.byAcademicYear.slice(0, 2).map((item: any) => (
                            <div key={item.year}>{item.year}: {item.count}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-sm text-red-600">By Category</p>
                      <p className="text-sm text-red-900">
                        {reportData.data?.statistics?.byCategory && Array.isArray(reportData.data.statistics.byCategory)
                          ? reportData.data.statistics.byCategory.length
                          : 0} categories
                      </p>
                      {reportData.data?.statistics?.byCategory && reportData.data.statistics.byCategory.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {reportData.data.statistics.byCategory.slice(0, 2).map((item: any) => (
                            <div key={item.category}>{item.category}: {item.count}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.data.students.slice(0, 10).map((student: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{student.user_name}</TableCell>
                          <TableCell>{student.course_name || student.course_code || 'N/A'}</TableCell>
                          <TableCell>{student.department_name || 'N/A'}</TableCell>
                          <TableCell>{student.academic_year_name || 'N/A'}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                      <p className="text-2xl font-bold text-blue-900">{reportData.data?.statistics?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm text-green-600">Avg Salary</p>
                      <p className="text-sm text-green-900">${reportData.data?.statistics?.averageSalary?.toFixed(0) || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm text-purple-600">Departments</p>
                      <p className="text-sm text-purple-900">
                        {reportData.data?.statistics?.byDepartment && Array.isArray(reportData.data.statistics.byDepartment)
                          ? reportData.data.statistics.byDepartment.length
                          : 0} departments
                      </p>
                      {reportData.data?.statistics?.byDepartment && reportData.data.statistics.byDepartment.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {reportData.data.statistics.byDepartment.slice(0, 2).map((item: any) => (
                            <div key={item.department}>{item.department}: {item.count}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-sm text-orange-600">Employment Types</p>
                      <p className="text-sm text-orange-900">
                        {reportData.data?.statistics?.byEmploymentType && Array.isArray(reportData.data.statistics.byEmploymentType)
                          ? reportData.data.statistics.byEmploymentType.length
                          : 0} types
                      </p>
                      {reportData.data?.statistics?.byEmploymentType && reportData.data.statistics.byEmploymentType.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {reportData.data.statistics.byEmploymentType.slice(0, 2).map((item: any) => (
                            <div key={item.type}>{item.type}: {item.count}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Employment Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.data.faculty.slice(0, 10).map((faculty: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{faculty.employee_id}</TableCell>
                          <TableCell>{faculty.user_name}</TableCell>
                          <TableCell>{faculty.department_name || 'N/A'}</TableCell>
                          <TableCell>{faculty.position}</TableCell>
                          <TableCell>{faculty.employment_type?.replace('_', ' ').toUpperCase()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
    </div>
  );
};

export default Reports;
