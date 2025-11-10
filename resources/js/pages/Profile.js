import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { User, Edit, LogOut, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile');
      if (response.data.success) {
        setProfileData(response.data.data);
        setFormData({
          name: response.data.data?.name || '',
          email: response.data.data?.email || '',
          password: '',
          phone: response.data.data?.phone || '',
          address: response.data.data?.address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate inputs
      if (!formData.name || !formData.email) {
        alert('Name and email are required');
        setLoading(false);
        return;
      }

      // Validate password if provided
      if (formData.password && formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      // Validate phone length
      if (formData.phone && formData.phone.length > 20) {
        alert('Phone number must be 20 characters or less');
        setLoading(false);
        return;
      }

      // Validate address length
      if (formData.address && formData.address.length > 500) {
        alert('Address must be 500 characters or less');
        setLoading(false);
        return;
      }
      
      // Build request payload - only send provided data
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      // Only include password if provided and not empty
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password;
      }

      // Include phone and address if provided
      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone;
      }

      if (formData.address && formData.address.trim()) {
        payload.address = formData.address;
      }

      const response = await axios.put('/api/profile', payload);
      
      if (response.data.success) {
        // Update the displayed data immediately with the response
        if (response.data.user) {
          // Update auth context with new user data
          updateUser({
            name: response.data.user.name,
            email: response.data.user.email
          });
        }
        
        if (response.data.data) {
          setProfileData({
            ...profileData,
            phone: response.data.data.phone || formData.phone,
            address: response.data.data.address || formData.address
          });
          
          // Update formData with the response data
          setFormData(prev => ({
            ...prev,
            phone: response.data.data.phone || formData.phone,
            address: response.data.data.address || formData.address
          }));
        }
        
        alert('Profile updated successfully!');
        setShowEditForm(false);
        
        // Clear password field after successful update
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        alert(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert('Validation Error:\n' + errorMessages);
        } else {
          alert('Validation failed. Please check your input.');
        }
      } else {
        alert(error.response?.data?.message || error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    
    try {
      await axios.post('/api/logout');
      logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if API call fails, logout locally
      logout();
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and update your profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {user?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : user?.role === 'faculty'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.role?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Member Since
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                    }
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {profileData?.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {profileData?.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              {user?.role === 'student' && profileData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Student ID
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {profileData.student_id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Course
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.course?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.department?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Academic Year
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.academic_year?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user?.role === 'faculty' && profileData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Faculty Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Employee ID
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {profileData.employee_id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.position || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.department?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Employment Type
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profileData.employment_type === 'full_time' 
                          ? 'bg-blue-100 text-blue-800'
                          : profileData.employment_type === 'part_time'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profileData.employment_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {profileData.qualifications && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Qualifications
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.qualifications}
                      </p>
                    </div>
                  )}
                  
                  {profileData.specializations && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Specializations
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profileData.specializations}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-6 flex gap-4">
                <Button 
                  onClick={() => {
                    // Ensure form data is populated with current profile data
                    if (profileData) {
                      setFormData({
                        name: profileData.user?.name || user?.name || '',
                        email: profileData.user?.email || user?.email || '',
                        password: '',
                        phone: profileData.phone || '',
                        address: profileData.address || ''
                      });
                    }
                    setShowEditForm(true);
                  }}
                  disabled={!profileData || loading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                <span className="text-sm text-gray-900 dark:text-white">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
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
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password (leave blank to keep current)"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;