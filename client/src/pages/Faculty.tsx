import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, Search, Edit, Archive, Filter } from 'lucide-react';
import { getAxiosClient } from '../lib/apiConfig';
import { SkeletonTable } from '../components/Loaders';

const Faculty: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalFaculty, setTotalFaculty] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_id: '',
    department_id: '1',
    position: '',
    hire_date: '',
    employment_type: 'full_time',
    salary: '',
    qualifications: '',
    specializations: '',
    phone: '',
    address: ''
  });

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

  const fetchFaculty = async (search = '', departmentFilter = '', page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departmentFilter) params.append('department_id', departmentFilter);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      
      const api = getAxiosClient();
      const response = await api.get(`/faculty?${params.toString()}`);
      
      // Handle the correct response format from backend
      if (response.data.faculty && Array.isArray(response.data.faculty)) {
        setFaculty(response.data.faculty);
        if (response.data.pagination) {
          setTotalFaculty(response.data.pagination.total);
          setTotalPages(response.data.pagination.pages);
          setCurrentPage(page);
        }
      } else {
        setFaculty([]);
      }
    } catch (error: any) {
      console.error('Error fetching faculty:', error);
      setError(error.response?.data?.message || 'Failed to fetch faculty data');
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFaculty(searchTerm, filterDepartment, 1);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const api = getAxiosClient();
      await api.post('/faculty', formData);
      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        employee_id: '',
        department_id: '1',
        position: '',
        hire_date: '',
        employment_type: 'full_time',
        salary: '',
        qualifications: '',
        specializations: '',
        phone: '',
        address: ''
      });
      fetchFaculty(searchTerm, filterDepartment, 1);
      alert('Faculty added successfully!');
    } catch (error: any) {
      console.error('Error adding faculty:', error);
      alert(error.response?.data?.message || 'Failed to add faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchFaculty(searchTerm, filterDepartment, 1);
  };

  // Handle edit faculty
  const handleEdit = (facultyMember: any) => {
    setEditingFaculty(facultyMember);
    setFormData({
      name: facultyMember.user?.name || '',
      email: facultyMember.user?.email || '',
      password: '', // Don't prefill password
      employee_id: facultyMember.employee_id || '',
      department_id: facultyMember.department_id?.toString() || '1',
      position: facultyMember.position || '',
      hire_date: facultyMember.hire_date || '',
      employment_type: facultyMember.employment_type || 'full_time',
      salary: facultyMember.salary || '',
      qualifications: facultyMember.qualifications || '',
      specializations: facultyMember.specializations || '',
      phone: facultyMember.phone || '',
      address: facultyMember.address || ''
    });
    setShowEditForm(true);
  };

  // Handle update faculty
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    try {
      setLoading(true);
      const api = getAxiosClient();
      await api.put(`/faculty/${editingFaculty.id}`, formData);
      setShowEditForm(false);
      setEditingFaculty(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        employee_id: '',
        department_id: '1',
        position: '',
        hire_date: '',
        employment_type: 'full_time',
        salary: '',
        qualifications: '',
        specializations: '',
        phone: '',
        address: ''
      });
      fetchFaculty(searchTerm, filterDepartment, currentPage);
      alert('Faculty updated successfully!');
    } catch (error: any) {
      console.error('Error updating faculty:', error);
      alert(error.response?.data?.message || 'Failed to update faculty');
    } finally {
      setLoading(false);
    }
  };

  // Handle archive faculty
  const handleArchive = async (facultyId: number, facultyName: string) => {
    if (!window.confirm(`Are you sure you want to archive ${facultyName}? This action can be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const api = getAxiosClient();
      await api.delete(`/faculty/${facultyId}`);
      fetchFaculty(searchTerm, filterDepartment, currentPage);
      alert('Faculty archived successfully!');
    } catch (error: any) {
      console.error('Error archiving faculty:', error);
      alert(error.response?.data?.message || 'Failed to archive faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage faculty members and their information</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
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
                  placeholder="Search faculty by name or employee ID..."
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
            <div className="flex gap-4 items-end">
              <div className="flex-1">
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
              
              <Button onClick={handleFilterChange} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filter
              </Button>
              
              <Button 
                onClick={() => {
                  setFilterDepartment('');
                  setSearchTerm('');
                  fetchFaculty();
                }} 
                variant="outline"
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty List</CardTitle>
          <CardDescription>
            Complete list of faculty members with department filtering and search
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={6} />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => fetchFaculty()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : faculty.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No faculty members found.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                The faculty data will appear here once the Laravel backend is properly connected.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.map((facultyMember, index) => (
                  <TableRow key={facultyMember.id || index}>
                    <TableCell className="font-medium">
                      {facultyMember.employee_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {facultyMember.user_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {facultyMember.user_email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {facultyMember.department_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {facultyMember.position || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        facultyMember.employment_type === 'full_time' 
                          ? 'bg-blue-100 text-blue-800' 
                          : facultyMember.employment_type === 'part_time'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {facultyMember.employment_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        facultyMember.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {facultyMember.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(facultyMember)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(facultyMember.id, facultyMember.user?.name || 'Faculty')}
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
                onClick={() => fetchFaculty(searchTerm, filterDepartment, 1)}
              >
                First
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchFaculty(searchTerm, filterDepartment, currentPage - 1)}
              >
                Previous
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => fetchFaculty(searchTerm, filterDepartment, page)}
                  className="min-w-10"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchFaculty(searchTerm, filterDepartment, currentPage + 1)}
              >
                Next
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchFaculty(searchTerm, filterDepartment, totalPages)}
              >
                Last
              </Button>

              <div className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                Page {currentPage} of {totalPages} • Total: {totalFaculty} faculty members
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Faculty Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Faculty Member</DialogTitle>
            <DialogDescription>
              Enter faculty information to add them to the system.
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
                name="employee_id"
                placeholder="Employee ID"
                value={formData.employee_id}
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
              <Input
                name="position"
                placeholder="Position (e.g., Professor, Assistant Professor)"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="hire_date"
                type="date"
                placeholder="Hire Date"
                value={formData.hire_date}
                onChange={handleInputChange}
                required
              />
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="salary"
                type="number"
                placeholder="Salary (optional)"
                value={formData.salary}
                onChange={handleInputChange}
              />
              <Input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
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
            <Input
              name="qualifications"
              placeholder="Qualifications (e.g., PhD in Computer Science)"
              value={formData.qualifications}
              onChange={handleInputChange}
            />
            <Input
              name="specializations"
              placeholder="Specializations (e.g., Machine Learning, AI)"
              value={formData.specializations}
              onChange={handleInputChange}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Faculty Member</DialogTitle>
            <DialogDescription>
              Update faculty member information.
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
                name="employee_id"
                placeholder="Employee ID"
                value={formData.employee_id}
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
              
              <Input
                name="position"
                placeholder="Position (e.g., Professor, Associate Professor)"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="hire_date"
                type="date"
                placeholder="Hire Date"
                value={formData.hire_date}
                onChange={handleInputChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="salary"
                type="number"
                placeholder="Salary (optional)"
                value={formData.salary}
                onChange={handleInputChange}
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

            <Input
              name="qualifications"
              placeholder="Qualifications (e.g., PhD in Computer Science)"
              value={formData.qualifications}
              onChange={handleInputChange}
            />
            
            <Input
              name="specializations"
              placeholder="Specializations (e.g., Machine Learning, Database Systems)"
              value={formData.specializations}
              onChange={handleInputChange}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Faculty;
