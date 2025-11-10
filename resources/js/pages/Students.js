import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { getAxiosClient, getConfig } from '../lib/apiConfig';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Document upload states
  const [documentFiles, setDocumentFiles] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});
  
  const [formData, setFormData] = useState({
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
    // Document image URLs
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
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      console.log('Departments response:', response.data);
      
      // Handle different response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        setDepartments(response.data.data);
      } else if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      console.log('Courses response:', response.data);
      
      // Handle different response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        setCourses(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get('/api/academic-years', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Academic years response:', response.data);
      
      // Handle different response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        setAcademicYears(response.data.data);
      } else if (Array.isArray(response.data)) {
        setAcademicYears(response.data);
      } else {
        setAcademicYears([]);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setAcademicYears([]);
    }
  };

  const fetchStudents = async (search = '', departmentFilter = '', courseFilter = '', categoryFilter = '', page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departmentFilter) params.append('department_id', departmentFilter);
      if (courseFilter) params.append('course_id', courseFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      console.log('Fetching students with params:', params.toString());
      
      // Use axios with credentials
      const response = await axios.get(`/api/students?${params.toString()}`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Full students response:', response);
      console.log('Students response data:', response.data);
      
      // Handle the actual backend response format: { students: [], pagination: {} }
      if (response.data.students) {
        const studentsData = response.data.students;
        const paginationData = response.data.pagination || {};
        
        console.log('Students data:', studentsData);
        console.log('Pagination data:', paginationData);
        
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setTotalStudents(paginationData.total || studentsData.length);
        setTotalPages(paginationData.pages || 1);
        setCurrentPage(paginationData.page || page);
      } else if (response.data.success && response.data.data) {
        // Alternative format: { success: true, data: { data: [], total, last_page, current_page } }
        if (response.data.data.data) {
          const studentsData = response.data.data.data;
          console.log('Students data (paginated):', studentsData);
          setStudents(Array.isArray(studentsData) ? studentsData : []);
          setTotalStudents(response.data.data.total || 0);
          setTotalPages(response.data.data.last_page || 1);
          setCurrentPage(response.data.data.current_page || page);
        } else if (Array.isArray(response.data.data)) {
          console.log('Students data (array):', response.data.data);
          setStudents(response.data.data);
          setTotalStudents(response.data.data.length);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } else if (Array.isArray(response.data)) {
        // Direct array response
        console.log('Students data (direct array):', response.data);
        setStudents(response.data);
        setTotalStudents(response.data.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        console.log('Unexpected response format:', response.data);
        setStudents([]);
        setTotalStudents(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to fetch student data');
      setStudents([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  };

  const filterCoursesByDepartment = useCallback((departmentId) => {
    if (!departmentId || departmentId === '') {
      setAvailableCourses(courses);
    } else {
      const filtered = courses.filter(course => course.department_id?.toString() === departmentId.toString());
      setAvailableCourses(filtered);
    }
  }, [courses]);

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchAcademicYears();
    fetchStudents();
  }, []);

  useEffect(() => {
    setAvailableCourses(courses);
    if (formData.course_id && courses.length > 0) {
      const selectedCourse = courses.find(c => c.id?.toString() === formData.course_id?.toString());
      if (!selectedCourse && courses.length > 0) {
        setFormData(prev => ({ ...prev, course_id: courses[0].id?.toString() || '1' }));
      }
    }
  }, [courses, formData.course_id]);

  useEffect(() => {
    if (showAddForm && formData.department_id) {
      filterCoursesByDepartment(formData.department_id);
    }
  }, [showAddForm, formData.department_id, filterCoursesByDepartment]);

  useEffect(() => {
    setAvailableCourses(courses);
  }, [courses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('student_id', formData.student_id);
      submitData.append('course_id', formData.course_id);
      submitData.append('department_id', formData.department_id);
      submitData.append('academic_year', formData.academic_year);
      submitData.append('enrollment_date', formData.enrollment_date);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('status', formData.status);
      submitData.append('category', formData.category);
      
      // Append all document files
      Object.keys(documentFiles).forEach(fieldName => {
        if (documentFiles[fieldName]) {
          submitData.append(fieldName, documentFiles[fieldName]);
        }
      });
      
      const response = await axios.post('/api/students', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success || response.data.student) {
        setShowAddForm(false);
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
        setDocumentFiles({});
        setDocumentPreviews({});
        fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Display validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.log('DETAILED ERRORS:', JSON.stringify(errors, null, 2));
        
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            // messages is an array, get the first message
            const msg = Array.isArray(messages) ? messages[0] : messages;
            return `${field.toUpperCase()}: ${msg}`;
          })
          .join('\n');
        
        const errorText = `❌ VALIDATION FAILED:\n\n${errorMessages}\n\n${
          errors.email ? '💡 TIP: The email already exists. Please use a different email address!' : ''
        }`;
        
        setError(errorText);
        alert(errorText);
      } else {
        const errorMsg = error.response?.data?.message || 'Failed to add student';
        setError(errorMsg);
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'department_id') {
      filterCoursesByDepartment(value);
      const filteredCourses = courses.filter(course => course.department_id?.toString() === value?.toString());
      if (filteredCourses.length > 0) {
        setFormData(prev => ({ ...prev, course_id: filteredCourses[0].id?.toString() || '1' }));
      }
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, 1);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.user?.name || '',
      email: student.user?.email || '',
      password: '',
      student_id: student.student_id || '',
      course_id: student.course_id?.toString() || '1',
      department_id: student.course?.department_id?.toString() || '1',
      academic_year: student.academic_year_id?.toString() || student.academicYear?.id?.toString() || '1',
      enrollment_date: student.enrollment_date || student.date_enrolled || '',
      phone: student.phone || '',
      address: student.address || '',
      status: student.status || 'active',
      category: (student.category || 'freshman').toLowerCase(),
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
    
    // Set existing document previews if available
    const previews = {};
    const documentFields = [
      'academic_performance_image_url', 'completion_diploma_image_url', 'character_certificate_image_url',
      'admission_test_image_url', 'application_form_image_url', 'college_academic_record_tor_image_url',
      'eligibility_to_transfer_image_url', 'course_evaluation_image_url', 'good_standing_status_image_url',
      'prior_education_proof_image_url', 'marital_status_image_url', 'request_to_reenroll_image_url',
      'account_clearance_image_url', 'academic_review_image_url', 'health_status_image_url'
    ];
    
    documentFields.forEach(field => {
      if (student[field]) {
        previews[field] = `/${student[field]}`;
      }
    });
    
    setDocumentPreviews(previews);
    setDocumentFiles({});
    setShowEditForm(true);
  };

  const handleDocumentChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`Please select a valid image file for ${fieldName}`);
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError(`Image size must be less than 2MB for ${fieldName}`);
        return;
      }
      
      // Store the file
      setDocumentFiles(prev => ({ ...prev, [fieldName]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveDocument = (fieldName) => {
    setDocumentFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });
    setDocumentPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      submitData.append('course_id', formData.course_id);
      submitData.append('department_id', formData.department_id);
      submitData.append('academic_year', formData.academic_year);
      submitData.append('enrollment_date', formData.enrollment_date);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('status', formData.status);
      submitData.append('category', formData.category);
      submitData.append('_method', 'PUT');
      
      // Append all document files
      Object.keys(documentFiles).forEach(fieldName => {
        if (documentFiles[fieldName]) {
          submitData.append(fieldName, documentFiles[fieldName]);
        }
      });
      
      const response = await axios.post(`/api/students/${editingStudent.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success || response.data.student) {
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
        setDocumentFiles({});
        setDocumentPreviews({});
        fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      setError(error.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to archive ${studentName}?`)) return;

    try {
      setLoading(true);
      setError('');
      const response = await axios.delete(`/api/students/${studentId}`);
      
      console.log('Archive response:', response.data);
      
      if (response.data.success) {
        // Remove student from the current list immediately
        setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
        setTotalStudents(prev => prev - 1);
        
        // Show success message
        alert('Student archived successfully!');
        
        // Optionally refetch to ensure consistency
        fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage);
      } else {
        setError(response.data.error || 'Failed to archive student');
      }
    } catch (error) {
      console.error('Error archiving student:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Failed to archive student');
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student records and academic information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search students by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFilterChange}
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterDepartment('');
                  setFilterCourse('');
                  setFilterCategory('');
                  setSearchTerm('');
                  setCurrentPage(1);
                  fetchStudents('', '', '', '', 1);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Student List</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Complete list of students with course and department filtering</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Student ID</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Course</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Academic Year</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-600 dark:text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{student.student_id}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{student.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.user?.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.course?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.department?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          student.category === 'Returnee' ? 'bg-pink-500/20 text-pink-400' :
                          student.category === 'Freshman' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {student.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.academic_year?.name || student.academicYear?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          student.status === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleArchive(student.id, student.user?.name)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {students.length} of {totalStudents} students
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage - 1);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-900 dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      fetchStudents(searchTerm, filterDepartment, filterCourse, filterCategory, currentPage + 1);
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Course</option>
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Academic Year</label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id} className="bg-gray-800 text-white">{year.name || year.year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="freshman">Freshman</option>
                    <option value="transferee">Transferee</option>
                    <option value="returnee">Returnee</option>
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enrollment Date</label>
                  <input
                    type="date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Document Uploads based on Category */}
              {formData.category === 'freshman' && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
                    Freshman Admission Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { field: 'academic_performance_image_url', label: 'Academic Performance' },
                      { field: 'completion_diploma_image_url', label: 'Completion Diploma' },
                      { field: 'character_certificate_image_url', label: 'Character Certificate' },
                      { field: 'admission_test_image_url', label: 'Admission Test' },
                      { field: 'application_form_image_url', label: 'Application Form' }
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {documentPreviews[field] ? 'Change' : 'Choose'} Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentChange(e, field)}
                              className="hidden"
                            />
                          </label>
                          {documentPreviews[field] && (
                            <div className="relative">
                              <img
                                src={documentPreviews[field]}
                                alt={label}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(field)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.category === 'transferee' && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
                    Transferee Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { field: 'college_academic_record_tor_image_url', label: 'College Academic Record (TOR)' },
                      { field: 'eligibility_to_transfer_image_url', label: 'Eligibility to Transfer (Honorable Dismissal)' },
                      { field: 'course_evaluation_image_url', label: 'Course Evaluation (Detailed Course Descriptions/Syllabus)' },
                      { field: 'good_standing_status_image_url', label: 'Good Standing Status (Certificate of Good Moral Character)' },
                      { field: 'prior_education_proof_image_url', label: 'Prior Education Proof (Official High School Transcript/Form 137)' },
                      { field: 'marital_status_image_url', label: 'Marital Status (Photocopy of Marriage Certificate)' }
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {documentPreviews[field] ? 'Change' : 'Choose'} Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentChange(e, field)}
                              className="hidden"
                            />
                          </label>
                          {documentPreviews[field] && (
                            <div className="relative">
                              <img
                                src={documentPreviews[field]}
                                alt={label}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(field)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.category === 'returnee' && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
                    Returnee Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { field: 'request_to_reenroll_image_url', label: 'Request to Re-enroll (Formal Letter of Intent for Readmission)' },
                      { field: 'account_clearance_image_url', label: 'Account Clearance (Clearance Slip from Registrar)' },
                      { field: 'academic_review_image_url', label: 'Academic Review (Review of Last Scholastic Standing)' },
                      { field: 'health_status_image_url', label: 'Health Status (Updated Medical Clearance)' }
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {documentPreviews[field] ? 'Change' : 'Choose'} Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentChange(e, field)}
                              className="hidden"
                            />
                          </label>
                          {documentPreviews[field] && (
                            <div className="relative">
                              <img
                                src={documentPreviews[field]}
                                alt={label}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(field)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditForm && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Student</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Course</option>
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Academic Year</label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>{year.name || year.year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="freshman">Freshman</option>
                    <option value="transferee">Transferee</option>
                    <option value="returnee">Returnee</option>
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enrollment Date</label>
                  <input
                    type="date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Document Uploads based on Category */}
              {formData.category === 'freshman' && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
                    Freshman Admission Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { field: 'academic_performance_image_url', label: 'Academic Performance' },
                      { field: 'completion_diploma_image_url', label: 'Completion Diploma' },
                      { field: 'character_certificate_image_url', label: 'Character Certificate' },
                      { field: 'admission_test_image_url', label: 'Admission Test' },
                      { field: 'application_form_image_url', label: 'Application Form' }
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {documentPreviews[field] ? 'Change' : 'Choose'} Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentChange(e, field)}
                              className="hidden"
                            />
                          </label>
                          {documentPreviews[field] && (
                            <div className="relative">
                              <img
                                src={documentPreviews[field]}
                                alt={label}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(field)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.category === 'transferee' && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
                    Transferee Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { field: 'college_academic_record_tor_image_url', label: 'College Academic Record (TOR)' },
                      { field: 'eligibility_to_transfer_image_url', label: 'Eligibility to Transfer (Honorable Dismissal)' },
                      { field: 'course_evaluation_image_url', label: 'Course Evaluation (Detailed Course Descriptions/Syllabus)' },
                      { field: 'good_standing_status_image_url', label: 'Good Standing Status (Certificate of Good Moral Character)' },
                      { field: 'prior_education_proof_image_url', label: 'Prior Education Proof (Official High School Transcript/Form 137)' },
                      { field: 'marital_status_image_url', label: 'Marital Status (Photocopy of Marriage Certificate)' }
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {documentPreviews[field] ? 'Change' : 'Choose'} Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentChange(e, field)}
                              className="hidden"
                            />
                          </label>
                          {documentPreviews[field] && (
                            <div className="relative">
                              <img
                                src={documentPreviews[field]}
                                alt={label}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(field)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.category === 'returnee' && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2">
                    Returnee Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { field: 'request_to_reenroll_image_url', label: 'Request to Re-enroll (Formal Letter of Intent for Readmission)' },
                      { field: 'account_clearance_image_url', label: 'Account Clearance (Clearance Slip from Registrar)' },
                      { field: 'academic_review_image_url', label: 'Academic Review (Review of Last Scholastic Standing)' },
                      { field: 'health_status_image_url', label: 'Health Status (Updated Medical Clearance)' }
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {documentPreviews[field] ? 'Change' : 'Choose'} Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentChange(e, field)}
                              className="hidden"
                            />
                          </label>
                          {documentPreviews[field] && (
                            <div className="relative">
                              <img
                                src={documentPreviews[field]}
                                alt={label}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(field)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default Students;

