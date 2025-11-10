import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { RingSpinner } from '../Loaders/Spinner';

const FacultyForm = ({ faculty, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_id: '',
    department_id: '',
    position: '',
    employment_type: '',
    salary: '',
    phone: '',
    address: '',
    qualifications: '',
    specializations: '',
    ...faculty
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Clean up the data before submitting
      const submitData = {
        name: formData.name,
        email: formData.email,
        employee_id: formData.employee_id,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        position: formData.position || null,
        employment_type: formData.employment_type || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        phone: formData.phone || null,
        address: formData.address || null,
        qualifications: formData.qualifications || null,
        specializations: formData.specializations || null,
      };

      // Only include password for new faculty (not editing)
      if (!faculty && formData.password) {
        submitData.password = formData.password;
      }

      // Remove null/undefined values for cleaner submission
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          submitData[key] = null;
        }
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input
            id="employee_id"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {!faculty && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 characters"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="department_id">Department</Label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="form-select block w-full"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="e.g., Professor, Assistant Professor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employment_type">Employment Type</Label>
          <select
            id="employment_type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            className="form-select block w-full"
          >
            <option value="">Select Type</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Monthly Salary</Label>
          <Input
            id="salary"
            name="salary"
            type="number"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g., 50000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 555-1234"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full address"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="qualifications">Qualifications</Label>
          <Input
            id="qualifications"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            placeholder="e.g., PhD in Computer Science, Master's Degree"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specializations">Specializations</Label>
          <Input
            id="specializations"
            name="specializations"
            value={formData.specializations}
            onChange={handleChange}
            placeholder="e.g., Machine Learning, Database Systems"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <RingSpinner size="sm" /> : faculty ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default FacultyForm;