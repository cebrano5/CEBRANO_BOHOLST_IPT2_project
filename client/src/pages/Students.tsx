import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, Search, Edit, Archive, Filter } from 'lucide-react';
import { getAxiosClient } from '../lib/apiConfig';
import { SkeletonTable } from '../components/Loaders';

const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_id: '',
    course_id: '1', // Default to first course
    department_id: '1', // Default to first department  
    academic_year: '', // Manual text input
    enrollment_date: '',
    phone: '',
    address: '',
    status: 'active',
    category: 'freshman',
    academic_performance_image_url: '',
    completion_diploma_image_url: '',
    character_certificate_image_url: '',
    admission_test_image_url: '',
    application_form_image_url: '',
    college_academic_record_tor_image_url: '',
    eligibility_to_transfer_image_url: '',
    course_evaluation_image_url: '',
    good_standing_status_image_url: '',
    prior_education_proof_image_url: '',
    marital_status_image_url: '',
    request_to_reenroll_image_url: '',
    account_clearance_image_url: '',
    academic_review_image_url: '',
    health_status_image_url: ''
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  const fetchDepartments = async () => {
    try {
      const api = getAxiosClient();
      const response = await api.get('/departments');
      if (response.data.success && Array.isArray(response.data.data)) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const api = getAxiosClient();
      const response = await api.get('/courses');
      if (response.data.success && Array.isArray(response.data.data)) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const api = getAxiosClient();
      const response = await api.get('/academic-years');
      if (response.data.success && Array.isArray(response.data.data)) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchStudents = async (search = '', departmentFilter = '', courseFilter = '', categoryFilter = '', page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departmentFilter) params.append('department_id', departmentFilter);
      if (courseFilter) params.append('course_id', courseFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      
      const api = getAxiosClient();
      const response = await api.get(`/students?${params.toString()}`);
      
      // Handle the correct response format from backend
      if (response.data.students && Array.isArray(response.data.students)) {
        setStudents(response.data.students);
        if (response.data.pagination) {
          setTotalStudents(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
          setCurrentPage(page);
        }
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Failed to fetch student data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on selected department
  const filterCoursesByDepartment = useCallback((departmentId: string) => {
    const filtered = courses.filter((course: any) => course.department_id === parseInt(departmentId));
    setAvailableCourses(filtered);
    // Reset course selection when department changes
    setFormData(prev => ({ ...prev, course_id: filtered.length > 0 ? filtered[0].id.toString() : '' }));
  }, [courses]);

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchAcademicYears();
    fetchStudents();
  }, []);

  // Initialize availableCourses with all courses when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      setAvailableCourses(courses);
      // Set default course if not already set
      if (!formData.course_id || formData.course_id === '') {
        setFormData(prev => ({ ...prev, course_id: courses[0].id.toString() }));
      }
    }
  }, [courses, formData.course_id]);

  // Ensure availableCourses is set when add form opens
  useEffect(() => {
    if (showAddForm && courses.length > 0) {
      // If department is selected, show only courses from that department
      if (formData.department_id) {
        filterCoursesByDepartment(formData.department_id);
      } else {
        // If no department selected, show all courses
        setAvailableCourses(courses);
      }
    }
  }, [showAddForm, formData.department_id, courses, filterCoursesByDepartment]);

  // Set initial available courses when courses and departments are loaded
  useEffect(() => {
    if (courses.length > 0) {
      setAvailableCourses(courses);
    }
  }, [courses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const api = getAxiosClient();
      await api.post('/students', formData);
      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        student_id: '',
        course_id: '1',
        department_id: '1',
        academic_year: '',
        enrollment_date: '',
        phone: '',
        address: '',
        status: 'active',
        category: 'freshman',
        academic_performance_image_url: '',
        completion_diploma_image_url: '',
        character_certificate_image_url: '',
        admission_test_image_url: '',
        application_form_image_url: '',
        college_academic_record_tor_image_url: '',
        eligibility_to_transfer_image_url: '',
        course_evaluation_image_url: '',
        good_standing_status_image_url: '',
        prior_education_proof_image_url: '',
        marital_status_image_url: '',
        request_to_reenroll_image_url: '',
        account_clearance_image_url: '',
        academic_review_image_url: '',
        health_status_image_url: ''
      });
      setAvailableCourses(courses);
      fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, 1);
      alert('Student added successfully!');
    } catch (error: any) {
      console.error('Error adding student:', error);
      alert(error.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Filter courses when department changes
    if (name === 'department_id') {
      if (value) {
        filterCoursesByDepartment(value);
      } else {
        // Show all courses when no department is selected
        setAvailableCourses(courses);
        setFormData(prev => ({ ...prev, course_id: courses.length > 0 ? courses[0].id.toString() : '' }));
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, 1);
  };

  // Handle edit student
  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.user?.name || '',
      email: student.user?.email || '',
      password: '', // Don't prefill password
      student_id: student.student_id || '',
      course_id: student.course_id?.toString() || '1',
      department_id: student.department_id?.toString() || '1',
      academic_year: student.academic_year_id?.toString() || '',
      enrollment_date: student.date_enrolled || '',
      phone: student.phone || '',
      address: student.address || '',
      status: student.status || 'active',
      category: student.category || 'freshman',
      academic_performance_image_url: student.academic_performance_image_url || '',
      completion_diploma_image_url: student.completion_diploma_image_url || '',
      character_certificate_image_url: student.character_certificate_image_url || '',
      admission_test_image_url: student.admission_test_image_url || '',
      application_form_image_url: student.application_form_image_url || '',
      college_academic_record_tor_image_url: student.college_academic_record_tor_image_url || '',
      eligibility_to_transfer_image_url: student.eligibility_to_transfer_image_url || '',
      course_evaluation_image_url: student.course_evaluation_image_url || '',
      good_standing_status_image_url: student.good_standing_status_image_url || '',
      prior_education_proof_image_url: student.prior_education_proof_image_url || '',
      marital_status_image_url: student.marital_status_image_url || '',
      request_to_reenroll_image_url: student.request_to_reenroll_image_url || '',
      account_clearance_image_url: student.account_clearance_image_url || '',
      academic_review_image_url: student.academic_review_image_url || '',
      health_status_image_url: student.health_status_image_url || ''
    });
    setShowEditForm(true);
  };

  // Handle update student
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setLoading(true);
      const api = getAxiosClient();
      await api.put(`/students/${editingStudent.id}`, formData);
      setShowEditForm(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        student_id: '',
        course_id: '1',
        department_id: '1',
        academic_year: '',
        enrollment_date: '',
        phone: '',
        address: '',
        status: 'active',
        category: 'freshman',
        academic_performance_image_url: '',
        completion_diploma_image_url: '',
        character_certificate_image_url: '',
        admission_test_image_url: '',
        application_form_image_url: '',
        college_academic_record_tor_image_url: '',
        eligibility_to_transfer_image_url: '',
        course_evaluation_image_url: '',
        good_standing_status_image_url: '',
        prior_education_proof_image_url: '',
        marital_status_image_url: '',
        request_to_reenroll_image_url: '',
        account_clearance_image_url: '',
        academic_review_image_url: '',
        health_status_image_url: ''
      });
      fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage);
      alert('Student updated successfully!');
    } catch (error: any) {
      console.error('Error updating student:', error);
      alert(error.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  // Handle archive student
  const handleArchive = async (studentId: number, studentName: string) => {
    if (!window.confirm(`Are you sure you want to archive ${studentName}? This action can be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const api = getAxiosClient();
      await api.delete(`/students/${studentId}`);
      fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage);
      alert('Student archived successfully!');
    } catch (error: any) {
      console.error('Error archiving student:', error);
      alert(error.response?.data?.message || 'Failed to archive student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student records and academic information</p>
        </div>
        <Button onClick={() => {
          // Reset form to show all courses
          setFormData({
            name: '',
            email: '',
            password: '',
            student_id: '',
            course_id: '',
            department_id: '',
            academic_year: '',
            enrollment_date: '',
            phone: '',
            address: '',
            status: 'active',
            category: 'freshman',
            academic_performance_image_url: '',
            completion_diploma_image_url: '',
            character_certificate_image_url: '',
            admission_test_image_url: '',
            application_form_image_url: '',
            college_academic_record_tor_image_url: '',
            eligibility_to_transfer_image_url: '',
            course_evaluation_image_url: '',
            good_standing_status_image_url: '',
            prior_education_proof_image_url: '',
            marital_status_image_url: '',
            request_to_reenroll_image_url: '',
            account_clearance_image_url: '',
            academic_review_image_url: '',
            health_status_image_url: ''
          });
          setAvailableCourses(courses);
          setShowAddForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search students by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Department
                </label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Course
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Courses</option>
                  {courses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button onClick={handleFilterChange} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              
              <Button 
                onClick={() => {
                  setFilterDepartment('');
                  setFilterCourse('');
                  setFilterCategory('');
                  setSearchTerm('');
                  fetchStudents();
                }} 
                variant="outline"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            Complete list of students with course and department filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={8} />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => fetchStudents()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No students found.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                The student data will appear here once the Laravel backend is properly connected.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id || index}>
                    <TableCell className="font-medium">
                      {student.student_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.user_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.user_email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.course_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.department_name || 'N/A'}
                    </TableCell>
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
                    <TableCell>
                      {student.academic_year?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : student.status === 'graduated'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(student.id, student.user?.name || 'Student')}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, 1)}
              >
                First
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage - 1)}
              >
                Previous
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, page)}
                  className="min-w-10"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage + 1)}
              >
                Next
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, totalPages)}
              >
                Last
              </Button>

              <div className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                Page {currentPage} of {totalPages} • Total: {totalStudents} students
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Student Module Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-600">✅ Implemented:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>• Complete Laravel API with CRUD operations</li>
                <li>• Course and department filtering</li>
                <li>• Role-based access control (Admin only)</li>
                <li>• GPA tracking and academic progress</li>
                <li>• MySQL database with relationships</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600">🔄 Ready to Connect:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                <li>• Add/Edit student forms</li>
                <li>• Course and department filtering</li>
                <li>• Academic year selection</li>
                <li>• Student profile viewing</li>
                <li>• Enrollment management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter student information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="student_id"
                placeholder="Student ID"
                value={formData.student_id}
                onChange={handleInputChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Course</option>
                {availableCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.start_year} - {year.end_year})
                  </option>
                ))}
              </select>
              <Input
                name="enrollment_date"
                type="date"
                placeholder="Enrollment Date"
                value={formData.enrollment_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <Input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="freshman">Freshman</option>
                <option value="transferee">Transferee</option>
                <option value="returnee">Returnee</option>
                <option value="regular">Regular</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>

            {formData.category === 'freshman' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Admission Requirements (Image URLs)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="academic_performance_image_url"
                    placeholder="Academic Performance Image URL"
                    value={formData.academic_performance_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="completion_diploma_image_url"
                    placeholder="Completion Diploma Image URL"
                    value={formData.completion_diploma_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="character_certificate_image_url"
                    placeholder="Character Certificate Image URL"
                    value={formData.character_certificate_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="admission_test_image_url"
                    placeholder="Admission Test Image URL"
                    value={formData.admission_test_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="application_form_image_url"
                    placeholder="Application Form Image URL"
                    value={formData.application_form_image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {formData.category === 'transferee' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Transferee Requirements (Image URLs)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="college_academic_record_tor_image_url"
                    placeholder="College Academic Record (TOR) Image URL"
                    value={formData.college_academic_record_tor_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="eligibility_to_transfer_image_url"
                    placeholder="Eligibility to Transfer (Honorable Dismissal) Image URL"
                    value={formData.eligibility_to_transfer_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="course_evaluation_image_url"
                    placeholder="Course Evaluation (Detailed Course Descriptions/Syllabus) Image URL"
                    value={formData.course_evaluation_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="good_standing_status_image_url"
                    placeholder="Good Standing Status (Certificate of Good Moral Character) Image URL"
                    value={formData.good_standing_status_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="prior_education_proof_image_url"
                    placeholder="Prior Education Proof (Official High School Transcript/Form 137) Image URL"
                    value={formData.prior_education_proof_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="marital_status_image_url"
                    placeholder="Marital Status (Photocopy of Marriage Certificate) Image URL"
                    value={formData.marital_status_image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {formData.category === 'returnee' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Returnee Requirements (Image URLs)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="request_to_reenroll_image_url"
                    placeholder="Request to Re-enroll (Formal Letter of Intent for Readmission) Image URL"
                    value={formData.request_to_reenroll_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="account_clearance_image_url"
                    placeholder="Account Clearance (Clearance Slip from Registrar) Image URL"
                    value={formData.account_clearance_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="academic_review_image_url"
                    placeholder="Academic Review (Review of Last Scholastic Standing) Image URL"
                    value={formData.academic_review_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="health_status_image_url"
                    placeholder="Health Status (Updated Medical Clearance) Image URL"
                    value={formData.health_status_image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="student_id"
                placeholder="Student ID"
                value={formData.student_id}
                onChange={handleInputChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="New Password (leave blank to keep current)"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  {availableCourses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.start_year} - {year.end_year})
                  </option>
                ))}
              </select>
              <Input
                name="enrollment_date"
                type="date"
                placeholder="Enrollment Date"
                value={formData.enrollment_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <Input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="freshman">Freshman</option>
                <option value="transferee">Transferee</option>
                <option value="returnee">Returnee</option>
                <option value="regular">Regular</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>

            {formData.category === 'freshman' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Admission Requirements (Image URLs)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="academic_performance_image_url"
                    placeholder="Academic Performance Image URL"
                    value={formData.academic_performance_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="completion_diploma_image_url"
                    placeholder="Completion Diploma Image URL"
                    value={formData.completion_diploma_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="character_certificate_image_url"
                    placeholder="Character Certificate Image URL"
                    value={formData.character_certificate_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="admission_test_image_url"
                    placeholder="Admission Test Image URL"
                    value={formData.admission_test_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="application_form_image_url"
                    placeholder="Application Form Image URL"
                    value={formData.application_form_image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {formData.category === 'transferee' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Transferee Requirements (Image URLs)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="college_academic_record_tor_image_url"
                    placeholder="College Academic Record (TOR) Image URL"
                    value={formData.college_academic_record_tor_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="eligibility_to_transfer_image_url"
                    placeholder="Eligibility to Transfer (Honorable Dismissal) Image URL"
                    value={formData.eligibility_to_transfer_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="course_evaluation_image_url"
                    placeholder="Course Evaluation (Detailed Course Descriptions/Syllabus) Image URL"
                    value={formData.course_evaluation_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="good_standing_status_image_url"
                    placeholder="Good Standing Status (Certificate of Good Moral Character) Image URL"
                    value={formData.good_standing_status_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="prior_education_proof_image_url"
                    placeholder="Prior Education Proof (Official High School Transcript/Form 137) Image URL"
                    value={formData.prior_education_proof_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="marital_status_image_url"
                    placeholder="Marital Status (Photocopy of Marriage Certificate) Image URL"
                    value={formData.marital_status_image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {formData.category === 'returnee' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Returnee Requirements (Image URLs)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="request_to_reenroll_image_url"
                    placeholder="Request to Re-enroll (Formal Letter of Intent for Readmission) Image URL"
                    value={formData.request_to_reenroll_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="account_clearance_image_url"
                    placeholder="Account Clearance (Clearance Slip from Registrar) Image URL"
                    value={formData.account_clearance_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="academic_review_image_url"
                    placeholder="Academic Review (Review of Last Scholastic Standing) Image URL"
                    value={formData.academic_review_image_url}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="health_status_image_url"
                    placeholder="Health Status (Updated Medical Clearance) Image URL"
                    value={formData.health_status_image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
