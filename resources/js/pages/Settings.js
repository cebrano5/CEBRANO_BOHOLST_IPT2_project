import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatedPage } from '../components/Animations/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RingSpinner } from '../components/Loaders/Spinner';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Form states
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showYearForm, setShowYearForm] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      switch (activeTab) {
        case 'departments':
          endpoint = '/api/departments';
          break;
        case 'courses':
          endpoint = '/api/courses';
          break;
        case 'academic-years':
          endpoint = '/api/academic-years';
          break;
        case 'archives':
          endpoint = '/api/archives';
          break;
      }

      const response = await axios.get(endpoint);
      switch (activeTab) {
        case 'departments':
          setDepartments(response.data);
          break;
        case 'courses':
          setCourses(response.data);
          break;
        case 'academic-years':
          setAcademicYears(response.data);
          break;
        case 'archives':
          setArchivedData(response.data);
          break;
      }
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      setLoading(true);
      let endpoint = '';
      switch (type) {
        case 'department':
          endpoint = '/api/departments';
          break;
        case 'course':
          endpoint = '/api/courses';
          break;
        case 'academic-year':
          endpoint = '/api/academic-years';
          break;
      }

      await axios.post(endpoint, formData);
      setFormData({});
      setShowDepartmentForm(false);
      setShowCourseForm(false);
      setShowYearForm(false);
      fetchData();
    } catch (error) {
      setError('Failed to save data');
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      let endpoint = '';
      switch (type) {
        case 'department':
          endpoint = '/api/departments';
          break;
        case 'course':
          endpoint = '/api/courses';
          break;
        case 'academic-year':
          endpoint = '/api/academic-years';
          break;
      }

      await axios.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (error) {
      setError('Failed to delete item');
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !departments.length && !courses.length && !academicYears.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === 'departments'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'courses'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'academic-years'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('academic-years')}
        >
          Academic Years
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'archives'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('archives')}
        >
          Archives
        </button>
      </div>

      {activeTab === 'departments' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Departments</CardTitle>
            <button
              onClick={() => setShowDepartmentForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Add Department
            </button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{dept.head}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDelete(dept.id, 'department')}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Similar cards for Courses and Academic Years */}

      {/* Forms */}
      <Dialog open={showDepartmentForm} onOpenChange={setShowDepartmentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, 'department')} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department Head</label>
              <Input
                value={formData.head || ''}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDepartmentForm(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <RingSpinner size="sm" className="text-white" /> : 'Save'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default Settings;