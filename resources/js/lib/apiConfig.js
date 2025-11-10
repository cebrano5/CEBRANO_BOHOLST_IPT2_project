import axios from 'axios';

let config = null;

export async function loadApiConfig() {
  try {
    const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
    config = {
      baseUrl,
      endpoints: {
        auth: {
          login: '/api/auth/login',
          register: '/api/auth/register',
          logout: '/api/auth/logout',
          profile: '/api/profile'
        },
        dashboard: {
          stats: '/api/dashboard/stats'
        },
        students: {
          list: '/api/students',
          create: '/api/students',
          update: id => `/api/students/${id}`,
          delete: id => `/api/students/${id}`,
          restore: id => `/api/students/${id}/restore`,
          stats: '/api/students/stats',
          export: {
            excel: '/api/students/export/excel',
            pdf: '/api/students/export/pdf'
          }
        },
        faculty: {
          list: '/api/faculty',
          create: '/api/faculty',
          update: id => `/api/faculty/${id}`,
          delete: id => `/api/faculty/${id}`,
          restore: id => `/api/faculty/${id}/restore`,
          stats: '/api/faculty/stats',
          export: {
            excel: '/api/faculty/export/excel',
            pdf: '/api/faculty/export/pdf'
          }
        },
        settings: {
          departments: {
            list: '/api/departments',
            create: '/api/departments',
            update: id => `/api/departments/${id}`,
            delete: id => `/api/departments/${id}`,
            restore: id => `/api/departments/${id}/restore`
          },
          courses: {
            list: '/api/courses',
            create: '/api/courses',
            update: id => `/api/courses/${id}`,
            delete: id => `/api/courses/${id}`,
            restore: id => `/api/courses/${id}/restore`
          },
          academicYears: {
            list: '/api/academic-years',
            create: '/api/academic-years',
            update: id => `/api/academic-years/${id}`,
            delete: id => `/api/academic-years/${id}`,
            restore: id => `/api/academic-years/${id}/restore`
          }
        },
        reports: {
          enrollment: {
            excel: '/api/reports/enrollment/excel',
            pdf: '/api/reports/enrollment/pdf'
          },
          students: {
            excel: '/api/reports/students/excel',
            pdf: '/api/reports/students/pdf'
          },
          faculty: {
            excel: '/api/reports/faculty/excel',
            pdf: '/api/reports/faculty/pdf'
          }
        }
      },
      csrf: document.querySelector('meta[name="csrf-token"]')?.content
    };

    return config;
  } catch (error) {
    console.error('Failed to load API configuration:', error);
    throw error;
  }
}

export function getAxiosClient() {
  const api = axios.create({
    baseURL: config?.baseUrl || window.location.origin,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
  });

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
}

export function getRoute(path) {
  if (!config) {
    throw new Error('API configuration not loaded. Call loadApiConfig first.');
  }

  // Remove leading slash if present
  path = path.startsWith('/') ? path.substring(1) : path;

  return `${config.baseUrl}/${path}`;
}

export function getApiBaseUrl() {
  if (!config) {
    throw new Error('API configuration not loaded. Call loadApiConfig first.');
  }
  return config.baseUrl;
}

export function isConfigLoaded() {
  return config !== null;
}

export function getConfig() {
  return config;
}

const apiExport = {
  loadApiConfig,
  getAxiosClient,
  getRoute,
  getApiBaseUrl,
  isConfigLoaded,
  getConfig
};

export default apiExport;