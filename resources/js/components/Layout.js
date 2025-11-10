import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  GraduationCap,
  Users, 
  FileText,
  Settings,
  User,
  Moon,
  Sun,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Faculty', href: '/faculty', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="text-xl font-bold text-blue-500 dark:text-blue-400">
            SFMS
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                  ${location.pathname === item.href
                    ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm dark:shadow-gray-900">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Right side controls */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Theme toggle button with icons */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || 'Admin User'}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
