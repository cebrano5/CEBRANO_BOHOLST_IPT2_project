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

  const fetchFaculty = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        per_page: itemsPerPage,
        search: searchTerm,
        department: filterDepartment
      });

      const response = await axios.get('/api/faculty?' + params);
      setFaculty(response.data.data);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
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
      await axios.post('/api/faculty', formData);
      setShowAddForm(false);
      fetchFaculty(currentPage);
    } catch (error) {
      setError('Failed to add faculty member');
      console.error('Error adding faculty:', error);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Faculty</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
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
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="form-select"
              >
                <option value="">All Departments</option>
                {/* Department options would go here */}
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
            {faculty.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.faculty_id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>{member.employment_type}</TableCell>
                <TableCell>{formatCurrency(member.salary)}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800'
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