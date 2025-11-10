import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatedPage } from '../components/Animations/AnimatedPage';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(false);

  // Data states
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [archivedData, setArchivedData] = useState({
    departments: [],
    courses: [],
    academic_years: [],
    students: [],
    faculty: []
  });

  // Dialog states
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showAcademicYearForm, setShowAcademicYearForm] = useState(false);

  // Edit states
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);

  // Form data states
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active'
  });

  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    credits: '',
    department_id: '',
    status: 'active'
  });

  const [academicYearForm, setAcademicYearForm] = useState({
    name: '',
    start_year: '',
    end_year: '',
    is_current: false,
    status: 'active'
  });

  const tabs = [
    { id: 'departments', name: 'Departments' },
    { id: 'courses', name: 'Courses' },
    { id: 'academic-years', name: 'Academic Years' },
    { id: 'archive', name: 'Archive' },
  ];

  // Fetch functions
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      if (response.data.success) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      if (response.data.success && response.data.data) {
        setCourses(response.data.data);
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
      const response = await axios.get('/api/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchArchivedData = async () => {
    try {
      const response = await axios.get('/api/archive');
      if (response.data.success) {
        setArchivedData(response.data.data || {
          departments: [],
          courses: [],
          academic_years: [],
          students: [],
          faculty: []
        });
      }
    } catch (error) {
      console.error('Error fetching archived data:', error);
    }
  };

  // Department CRUD
  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingDepartment) {
        await axios.put(`/api/departments/${editingDepartment.id}`, departmentForm);
        alert('Department updated successfully!');
      } else {
        await axios.post('/api/departments', departmentForm);
        alert('Department created successfully!');
      }
      setShowDepartmentForm(false);
      setEditingDepartment(null);
      setDepartmentForm({ name: '', code: '', description: '', status: 'active' });
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      status: department.status || 'active'
    });
    setShowDepartmentForm(true);
  };

  const handleArchiveDepartment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive ${name}?`)) return;
    try {
      await axios.delete(`/api/departments/${id}`);
      alert('Department archived successfully!');
      fetchDepartments();
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to archive department');
    }
  };

  // Course CRUD
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up the data - remove empty strings and convert to proper types
      const submitData = {
        name: courseForm.name,
        code: courseForm.code,
        description: courseForm.description || null,
        department_id: courseForm.department_id ? parseInt(courseForm.department_id) : null,
        credits: courseForm.credits ? parseInt(courseForm.credits) : null,
        status: courseForm.status || 'active',
      };
      
      // Remove null/undefined values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          submitData[key] = null;
        }
      });
      
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse.id}`, submitData);
        alert('Course updated successfully!');
      } else {
        await axios.post('/api/courses', submitData);
        alert('Course created successfully!');
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({ name: '', code: '', description: '', credits: '', department_id: '', status: 'active' });
      fetchCourses();
    } catch (error) {
      console.error('Course submit error:', error.response?.data);
      alert(error.response?.data?.message || error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name || '',
      code: course.code || '',
      description: course.description || '',
      credits: course.credits?.toString() || '',
      department_id: course.department_id?.toString() || '',
      status: course.status || 'active'
    });
    setShowCourseForm(true);
  };

  const handleArchiveCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive ${name}?`)) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      alert('Course archived successfully!');
      fetchCourses();
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to archive course');
    }
  };

  // Academic Year CRUD
  const handleAcademicYearSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAcademicYear) {
        await axios.put(`/api/academic-years/${editingAcademicYear.id}`, academicYearForm);
        alert('Academic year updated successfully!');
      } else {
        await axios.post('/api/academic-years', academicYearForm);
        alert('Academic year created successfully!');
      }
      setShowAcademicYearForm(false);
      setEditingAcademicYear(null);
      setAcademicYearForm({ name: '', start_year: '', end_year: '', is_current: false, status: 'active' });
      fetchAcademicYears();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save academic year');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAcademicYear = (academicYear) => {
    setEditingAcademicYear(academicYear);
    setAcademicYearForm({
      name: academicYear.name || '',
      start_year: academicYear.start_year || '',
      end_year: academicYear.end_year || '',
      is_current: academicYear.is_current || false,
      status: academicYear.status || 'active'
    });
    setShowAcademicYearForm(true);
  };

  const handleArchiveAcademicYear = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive ${name}?`)) return;
    try {
      await axios.delete(`/api/academic-years/${id}`);
      alert('Academic year archived successfully!');
      fetchAcademicYears();
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to archive academic year');
    }
  };

  // Restore functions
  const handleRestoreDepartment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to restore ${name}?`)) return;
    try {
      await axios.patch(`/api/departments/${id}/restore`);
      alert('Department restored successfully!');
      fetchDepartments();
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to restore department');
    }
  };

  const handleRestoreCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to restore ${name}?`)) return;
    try {
      await axios.patch(`/api/courses/${id}/restore`);
      alert('Course restored successfully!');
      fetchCourses();
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to restore course');
    }
  };

  const handleRestoreAcademicYear = async (id, name) => {
    if (!window.confirm(`Are you sure you want to restore ${name}?`)) return;
    try {
      await axios.patch(`/api/academic-years/${id}/restore`);
      alert('Academic year restored successfully!');
      fetchAcademicYears();
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to restore academic year');
    }
  };

  const handleRestoreStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to restore ${name}?`)) return;
    try {
      await axios.patch(`/api/students/${id}/restore`);
      alert('Student restored successfully!');
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to restore student');
    }
  };

  const handleRestoreFaculty = async (id, name) => {
    if (!window.confirm(`Are you sure you want to restore ${name}?`)) return;
    try {
      await axios.patch(`/api/faculty/${id}/restore`);
      alert('Faculty member restored successfully!');
      fetchArchivedData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to restore faculty member');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    fetchAcademicYears();
    fetchArchivedData();
  }, []);

  return (
    <AnimatedPage className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage departments, courses, and academic years in a tabbed layout.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                {tab.id === 'departments' && <><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></>}
                {tab.id === 'courses' && <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></>}
                {tab.id === 'academic-years' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></>}
                {tab.id === 'archive' && <><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></>}
              </svg>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'departments' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Departments Management
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add, edit, and archive department information and structure.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Departments ({departments.length})</h3>
                  <button 
                    onClick={() => setShowDepartmentForm(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Department
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Code</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id} className="border-b">
                          <td className="p-2 font-medium">{dept.name}</td>
                          <td className="p-2">{dept.code}</td>
                          <td className="p-2">{dept.description || 'No description'}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              dept.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {dept.status || 'active'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditDepartment(dept)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleArchiveDepartment(dept.id, dept.name)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="21 8 21 21 3 21 3 8"></polyline>
                                  <rect x="1" y="3" width="22" height="5"></rect>
                                  <line x1="10" y1="12" x2="14" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'courses' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Courses Management
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage course information, codes, credits, and descriptions.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Courses ({courses.length})</h3>
                  <button 
                    onClick={() => setShowCourseForm(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Course
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Code</th>
                        <th className="text-left p-2">Department</th>
                        <th className="text-left p-2">Credits</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b">
                          <td className="p-2 font-medium">{course.name}</td>
                          <td className="p-2">{course.code}</td>
                          <td className="p-2">{course.department?.name || 'N/A'}</td>
                          <td className="p-2">{course.credits || 'N/A'}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              course.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {course.status || 'active'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCourse(course)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleArchiveCourse(course.id, course.name)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="21 8 21 21 3 21 3 8"></polyline>
                                  <rect x="1" y="3" width="22" height="5"></rect>
                                  <line x1="10" y1="12" x2="14" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'academic-years' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Academic Years Management
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage academic year periods, current year settings, and transitions.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Academic Years ({academicYears.length})</h3>
                  <button 
                    onClick={() => setShowAcademicYearForm(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Academic Year
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Years</th>
                        <th className="text-left p-2">Current</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academicYears.map((year) => (
                        <tr key={year.id} className="border-b">
                          <td className="p-2 font-medium">{year.name}</td>
                          <td className="p-2">{year.start_year} - {year.end_year}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              year.is_current 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {year.is_current ? 'Current' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              year.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {year.status || 'active'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAcademicYear(year)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleArchiveAcademicYear(year.id, year.name)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="21 8 21 21 3 21 3 8"></polyline>
                                  <rect x="1" y="3" width="22" height="5"></rect>
                                  <line x1="10" y1="12" x2="14" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'archive' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                  </svg>
                  Archived Items Management
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and restore archived departments, courses, and academic years.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Archived Departments */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Archived Departments ({archivedData.departments?.length || 0})</h3>
                    {archivedData.departments?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Code</th>
                              <th className="text-left p-2">Description</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archivedData.departments.map((dept) => (
                              <tr key={dept.id} className="border-b">
                                <td className="p-2 font-medium">{dept.name}</td>
                                <td className="p-2">{dept.code}</td>
                                <td className="p-2">{dept.description || 'No description'}</td>
                                <td className="p-2">
                                  <button
                                    onClick={() => handleRestoreDepartment(dept.id, dept.name)}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No archived departments</p>
                    )}
                  </div>

                  {/* Archived Courses */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Archived Courses ({archivedData.courses?.length || 0})</h3>
                    {archivedData.courses?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Code</th>
                              <th className="text-left p-2">Department</th>
                              <th className="text-left p-2">Credits</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archivedData.courses.map((course) => (
                              <tr key={course.id} className="border-b">
                                <td className="p-2 font-medium">{course.name}</td>
                                <td className="p-2">{course.code}</td>
                                <td className="p-2">{course.department?.name || 'N/A'}</td>
                                <td className="p-2">{course.credits || 'N/A'}</td>
                                <td className="p-2">
                                  <button
                                    onClick={() => handleRestoreCourse(course.id, course.name)}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No archived courses</p>
                    )}
                  </div>

                  {/* Archived Academic Years */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Archived Academic Years ({archivedData.academic_years?.length || 0})</h3>
                    {archivedData.academic_years?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Years</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archivedData.academic_years.map((year) => (
                              <tr key={year.id} className="border-b">
                                <td className="p-2 font-medium">{year.name}</td>
                                <td className="p-2">{year.start_year} - {year.end_year}</td>
                                <td className="p-2">
                                  <button
                                    onClick={() => handleRestoreAcademicYear(year.id, year.name)}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No archived academic years</p>
                    )}
                  </div>

                  {/* Archived Students */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Archived Students ({archivedData.students?.length || 0})</h3>
                    {archivedData.students?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Student ID</th>
                              <th className="text-left p-2">Course</th>
                              <th className="text-left p-2">Department</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archivedData.students.map((student) => (
                              <tr key={student.id} className="border-b">
                                <td className="p-2 font-medium">{student.user?.name || 'Unknown'}</td>
                                <td className="p-2">{student.student_id}</td>
                                <td className="p-2">{student.course?.name || 'N/A'}</td>
                                <td className="p-2">{student.department?.name || 'N/A'}</td>
                                <td className="p-2">
                                  <button
                                    onClick={() => handleRestoreStudent(student.id, student.user?.name || 'Student')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No archived students</p>
                    )}
                  </div>

                  {/* Archived Faculty */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Archived Faculty ({archivedData.faculty?.length || 0})</h3>
                    {archivedData.faculty?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Employee ID</th>
                              <th className="text-left p-2">Position</th>
                              <th className="text-left p-2">Department</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archivedData.faculty.map((faculty) => (
                              <tr key={faculty.id} className="border-b">
                                <td className="p-2 font-medium">{faculty.user?.name || 'Unknown'}</td>
                                <td className="p-2">{faculty.employee_id}</td>
                                <td className="p-2">{faculty.position || 'N/A'}</td>
                                <td className="p-2">{faculty.department?.name || 'N/A'}</td>
                                <td className="p-2">
                                  <button
                                    onClick={() => handleRestoreFaculty(faculty.id, faculty.user?.name || 'Faculty')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No archived faculty</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Department Form Dialog */}
      {showDepartmentForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingDepartment ? 'Edit Department' : 'Add New Department'}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {editingDepartment ? 'Update department information.' : 'Enter department information to add to the system.'}
            </p>
            <form onSubmit={handleDepartmentSubmit} className="space-y-4">
              <Input
                placeholder="Department Name"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                required
              />
              <Input
                placeholder="Department Code (e.g., CSP, ENG)"
                value={departmentForm.code}
                onChange={(e) => setDepartmentForm({...departmentForm, code: e.target.value})}
                required
              />
              <Input
                placeholder="Description (optional)"
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={departmentForm.status}
                  onChange={(e) => setDepartmentForm({...departmentForm, status: e.target.value})}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowDepartmentForm(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                  {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Form Dialog */}
      {showCourseForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {editingCourse ? 'Update course information.' : 'Enter course information to add to the system.'}
            </p>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <Input
                placeholder="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                required
              />
              <Input
                placeholder="Course Code (e.g., BSIT, BSCS)"
                value={courseForm.code}
                onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                required
              />
              <select
                value={courseForm.department_id}
                onChange={(e) => setCourseForm({...courseForm, department_id: e.target.value})}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Credits (optional)"
                type="number"
                value={courseForm.credits}
                onChange={(e) => setCourseForm({...courseForm, credits: e.target.value})}
              />
              <Input
                placeholder="Description (optional)"
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({...courseForm, status: e.target.value})}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCourseForm(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                  {loading ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Year Form Dialog */}
      {showAcademicYearForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingAcademicYear ? 'Edit Academic Year' : 'Add New Academic Year'}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {editingAcademicYear ? 'Update academic year information.' : 'Enter academic year information to add to the system.'}
            </p>
            <form onSubmit={handleAcademicYearSubmit} className="space-y-4">
              <Input
                placeholder="Academic Year Name (e.g., 2024-2025)"
                value={academicYearForm.name}
                onChange={(e) => setAcademicYearForm({...academicYearForm, name: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Start Year"
                  type="number"
                  value={academicYearForm.start_year}
                  onChange={(e) => setAcademicYearForm({...academicYearForm, start_year: e.target.value})}
                  required
                />
                <Input
                  placeholder="End Year"
                  type="number"
                  value={academicYearForm.end_year}
                  onChange={(e) => setAcademicYearForm({...academicYearForm, end_year: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={academicYearForm.is_current}
                  onChange={(e) => setAcademicYearForm({...academicYearForm, is_current: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_current" className="text-sm font-medium">
                  Set as current academic year
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={academicYearForm.status}
                  onChange={(e) => setAcademicYearForm({...academicYearForm, status: e.target.value})}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAcademicYearForm(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                  {loading ? 'Saving...' : (editingAcademicYear ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default Settings;
