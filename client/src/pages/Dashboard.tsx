import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, GraduationCap, TrendingUp, Calendar } from 'lucide-react';
import { getAxiosClient } from '../lib/apiConfig';
import { SkeletonCard } from '../components/Loaders';
import { AnimatedPage, StaggeredContainer } from '../components/Animations';
import { DepartmentChart, CourseChart } from '../components/Charts';

interface Stats {
  students: {
    total: number;
    byCourse: Array<{ course: string; count: number }>;
    byDepartment: Array<{ department: string; count: number }>;
    byYear: Array<{ year: string; count: number }>;
  };
  faculty: {
    total: number;
    byDepartment: Array<{ department: string; count: number }>;
    byEmploymentType: Array<{ type: string; count: number }>;
    byPosition: Array<{ position: string; count: number }>;
    averageSalary: number;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const api = getAxiosClient();
        const [studentStats, facultyStats] = await Promise.all([
          api.get('/students/stats'),
          api.get('/faculty/stats')
        ]);

        setStats({
          students: studentStats.data.stats,
          faculty: facultyStats.data.stats
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
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
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of your institution's data</p>
      </div>

      {/* Stats Cards */}
      <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active enrolled students
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.faculty.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active faculty members
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students.byCourse.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.faculty.byDepartment.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Academic departments
            </p>
          </CardContent>
        </Card>
      </StaggeredContainer>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students by Course</CardTitle>
            <CardDescription>Distribution of students across courses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonCard className="h-80" />
            ) : (
              <CourseChart data={stats?.students.byCourse || []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faculty by Department</CardTitle>
            <CardDescription>Distribution of faculty across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonCard className="h-80" />
            ) : (
              <DepartmentChart data={stats?.faculty.byDepartment || []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="group p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-105 dark:border-gray-700"
              onClick={() => navigate('/students')}
            >
              <GraduationCap className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-medium dark:text-white group-hover:text-primary transition-colors">Add New Student</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Register a new student in the system</p>
            </div>
            <div
              className="group p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-105 dark:border-gray-700"
              onClick={() => navigate('/faculty')}
            >
              <Users className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-medium dark:text-white group-hover:text-primary transition-colors">Add Faculty Member</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new faculty member</p>
            </div>
            <div
              className="group p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-105 dark:border-gray-700"
              onClick={() => navigate('/reports')}
            >
              <TrendingUp className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-200" />
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
