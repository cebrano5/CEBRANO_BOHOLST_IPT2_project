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
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Students Card */}
        <Card className="hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students across all departments
            </p>
          </CardContent>
        </Card>

        {/* Total Faculty Card */}
        <Card className="hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.faculty.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active faculty members
            </p>
          </CardContent>
        </Card>

        {/* Average Faculty Salary */}
        <Card className="hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Faculty Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{stats?.faculty.averageSalary?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average monthly salary
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Course Distribution Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Course Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseChart data={stats?.students.byCourse || []} />
          </CardContent>
        </Card>

        {/* Department Distribution Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentChart data={stats?.students.byDepartment || []} />
          </CardContent>
        </Card>
      </div>

      {/* Faculty Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Faculty by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentChart data={stats?.faculty.byDepartment || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.faculty.byEmploymentType?.map((type) => (
                <div key={type.type} className="flex items-center">
                  <div className="w-full flex items-center justify-between">
                    <span className="font-medium">{type.type}</span>
                    <span className="text-muted-foreground">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;