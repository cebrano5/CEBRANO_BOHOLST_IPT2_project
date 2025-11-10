import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatedPage } from '../components/Animations/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { RingSpinner } from '../components/Loaders/Spinner';
import { formatCurrency } from '../lib/utils';
import FacultyForm from '../components/forms/FacultyForm';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState([]);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data.data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const fetchFaculty = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', itemsPerPage);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (filterDepartment) {
        params.append('department_id', filterDepartment);
      }

      const response = await axios.get('/api/faculty?' + params.toString());
      
      // Handle the response format from backend
      const facultyData = response.data.faculty || response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setFaculty(facultyData);
      setTotalPages(pagination.pages || Math.ceil((pagination.total || 0) / itemsPerPage));
      setError('');
    } catch (error) {
      setError('Failed to fetch faculty members');
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty(currentPage);
  }, [currentPage, filterDepartment]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFaculty(1);
  };

  const handleAddFaculty = async (formData) => {
    try {
      const response = await axios.post('/api/faculty', formData);
      if (response.data.success) {
        alert('Faculty member added successfully!');
        setShowAddForm(false);
        fetchFaculty(currentPage);
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error.response?.data?.message || 'Failed to add faculty member';
      alert(errorMsg);
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleEditFaculty = async (formData) => {
    try {
      await axios.put('/api/faculty/' + editingFaculty.id, formData);
      setShowEditForm(false);
      setEditingFaculty(null);
      fetchFaculty(currentPage);
    } catch (error) {
      setError('Failed to update faculty member');
      console.error('Error updating faculty:', error);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      await axios.delete('/api/faculty/' + id);
      fetchFaculty(currentPage);
    } catch (error) {
      setError('Failed to delete faculty member');
      console.error('Error deleting faculty:', error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage faculty members and their information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Faculty
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Employment Type</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty && faculty.length > 0 ? (
              faculty.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.employee_id}</TableCell>
                  <TableCell>{member.user?.name || 'N/A'}</TableCell>
                  <TableCell>{member.department?.name || 'N/A'}</TableCell>
                  <TableCell>{member.position || 'N/A'}</TableCell>
                  <TableCell>{member.employment_type || 'N/A'}</TableCell>
                  <TableCell>{member.salary ? formatCurrency(member.salary) : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingFaculty(member);
                          setShowEditForm(true);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(member.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No faculty members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Add Faculty Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Faculty Member</DialogTitle>
          </DialogHeader>
          <FacultyForm
            onSubmit={handleAddFaculty}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty Member</DialogTitle>
          </DialogHeader>
          {editingFaculty && (
            <FacultyForm
              faculty={editingFaculty}
              onSubmit={handleEditFaculty}
              onCancel={() => {
                setShowEditForm(false);
                setEditingFaculty(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default Faculty;