import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/AnimatedPage';
import { CourseChart } from '../components/Charts/CourseChart';
import DepartmentChart from '../components/Charts/DepartmentChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RingSpinner } from '../components/Loaders/Spinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data || {
          students: { total: 0, byCourse: [], byDepartment: [] },
          faculty: { total: 0, averageSalary: 0, byDepartment: [], byEmploymentType: [] }
        });
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setStats({
          students: { total: 0, byCourse: [], byDepartment: [] },
          faculty: { total: 0, averageSalary: 0, byDepartment: [], byEmploymentType: [] }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-700 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-Black">Dashboard</h1>
        <p className="text-gray-400">Overview of your institution's data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active enrolled students
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.faculty?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active faculty members
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students?.byCourse?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.faculty?.byDepartment?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Academic departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        <Card>
          <CardHeader>
            <CardTitle>Students by Course</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of students across courses</p>
          </CardHeader>
          <CardContent className="pt-6">
            <CourseChart data={stats?.students?.byCourse || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faculty by Department</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of faculty across departments</p>
          </CardHeader>
          <CardContent className="pt-6">
            <DepartmentChart data={stats?.faculty?.byDepartment || []} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader className="pb-6">
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="group p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-105 dark:border-gray-700"
              onClick={() => navigate('/students')}
            >
              <svg className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="font-medium dark:text-white group-hover:text-primary transition-colors">Add New Student</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Register a new student in the system</p>
            </div>
            <div
              className="group p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-105 dark:border-gray-700"
              onClick={() => navigate('/faculty')}
            >
              <svg className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="font-medium dark:text-white group-hover:text-primary transition-colors">Add Faculty Member</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new faculty member</p>
            </div>
            <div
              className="group p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-105 dark:border-gray-700"
              onClick={() => navigate('/reports')}
            >
              <svg className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="font-medium dark:text-white group-hover:text-primary transition-colors">View Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate and view detailed reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
};

export default Dashboard;
