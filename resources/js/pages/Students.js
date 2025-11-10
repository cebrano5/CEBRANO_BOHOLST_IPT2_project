import React, { useState, useEffect } from 'react';
import { getAxiosClient, getConfig } from '../lib/apiConfig';
import { AnimatedPage } from '../components/Animations/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { RingSpinner } from '../components/Loaders/Spinner';
import StudentForm from '../components/forms/StudentForm';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const api = getAxiosClient();
      const { endpoints } = getConfig();
      const params = new URLSearchParams({
        page,
        per_page: itemsPerPage,
        search: searchTerm,
        department_id: filterDepartment,
        course_id: filterCourse,
        category: filterCategory
      });

      // Get students with pagination
      const response = await api.get(endpoints.students.list + '?' + params.toString());
      
      if (response.data.data) {
        setStudents(response.data.data);
        if (response.data.meta) {
          setTotalPages(Math.ceil(response.data.meta.total / response.data.meta.per_page));
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch students');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch students');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const api = getAxiosClient();
      const { endpoints } = getConfig();
      const response = await api.get(endpoints.settings.departments.list);
      if (response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const api = getAxiosClient();
      const { endpoints } = getConfig();
      const response = await api.get(endpoints.settings.courses.list);
      if (response.data.data) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchCourses()]);
  }, []);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage, filterDepartment, filterCourse, filterCategory]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchStudents(1);
  };

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const handleAddStudent = async (formData) => {
    try {
      setLoading(true);
      const api = getAxiosClient();
      const response = await api.post('/students', formData);
      
      if (response.data.success) {
        setShowAddForm(false);
        fetchStudents(currentPage);
      } else {
        throw new Error(response.data.message || 'Failed to add student');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add student');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async (formData) => {
    try {
      setLoading(true);
      const api = getAxiosClient();
      const response = await api.put('/students/' + editingStudent.id, formData);
      
      if (response.data.success) {
        setShowEditForm(false);
        setEditingStudent(null);
        fetchStudents(currentPage);
      } else {
        throw new Error(response.data.message || 'Failed to update student');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update student');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      setLoading(true);
      const api = getAxiosClient();
      const response = await api.delete('/students/' + id);
      
      if (response.data.success) {
        fetchStudents(currentPage);
      } else {
        throw new Error(response.data.message || 'Failed to delete student');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete student');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(getConfig().endpoints.students.export.excel)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={() => window.open(getConfig().endpoints.students.export.pdf)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Export PDF
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Add Student
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                disabled={loadingDepartments}
                className={`form-select ${loadingDepartments ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loadingDepartments ? 'Loading departments...' : 'All Departments'}
                </option>
                {!loadingDepartments && departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                disabled={loadingCourses}
                className={`form-select ${loadingCourses ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loadingCourses ? 'Loading courses...' : 'All Courses'}
                </option>
                {!loadingCourses && courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">
                Search
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {selectedStudents.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <div className="text-sm text-gray-600">
            {selectedStudents.length} student{selectedStudents.length === 1 ? '' : 's'} selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(getConfig().endpoints.students.export.excel + '?ids=' + selectedStudents.join(','))}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export Selected
            </button>
            <button
              onClick={() => {
                if (!window.confirm('Are you sure you want to delete the selected students?')) return;
                Promise.all(selectedStudents.map(id => handleDeleteStudent(id)))
                  .then(() => setSelectedStudents([]));
              }}
              className="px-3 py-1 text-sm bg-destructive text-white rounded-md hover:bg-destructive/90"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(students.map(s => s.id));
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>{student.year_level}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setShowEditForm(true);
                      }}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {students.length} results
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Last
            </button>
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="form-select text-sm"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <StudentForm
            onSubmit={handleAddStudent}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <StudentForm
              student={editingStudent}
              onSubmit={handleEditStudent}
              onCancel={() => {
                setShowEditForm(false);
                setEditingStudent(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default Students;