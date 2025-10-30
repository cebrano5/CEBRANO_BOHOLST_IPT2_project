import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiConfig {
  apiBaseUrl: string;
  routes: Record<string, any>;
}

interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

let config: ApiConfig | null = null;
let axiosClient: AxiosInstance | null = null;

/**
 * Load API configuration from backend
 * This should be called once during app initialization
 */
export async function loadApiConfig(): Promise<ApiConfig> {
  try {
    // Use correct API URL - default to localhost:8000 for Laravel
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    // Don't use credentials for config fetch - no auth required
    const response = await axios.get(`${apiUrl}/api/config`);
    config = response.data;
    initializeAxiosClient();
    return config as ApiConfig;
  } catch (error) {
    console.error('Failed to load API configuration:', error);
    // Fallback to default config if backend is unavailable
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    config = {
      apiBaseUrl: `${apiUrl}/api`,
      routes: {
        auth: { login: '/auth/login', register: '/auth/register', logout: '/logout' },
        user: { profile: '/profile', me: '/user' },
        students: '/students',
        faculty: '/faculty',
        courses: '/courses',
        departments: '/departments',
        academicYears: '/academic-years',
        reports: { students: '/reports/students', faculty: '/reports/faculty' },
        export: {
          students_pdf: '/export/students/pdf',
          students_excel: '/export/students/excel',
          faculty_pdf: '/export/faculty/pdf',
          faculty_excel: '/export/faculty/excel',
          enrollment_excel: '/export/enrollment/excel',
          enrollment_pdf: '/export/enrollment/pdf',
        },
      }
    };
    initializeAxiosClient();
    return config;
  }
}

/**
 * Initialize the Axios client with auth token and error handling
 */
function initializeAxiosClient(): void {
  if (!config) return;

  const clientConfig: ApiClientConfig = {
    baseURL: config.apiBaseUrl,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  };

  axiosClient = axios.create(clientConfig);

  // Request interceptor: Add auth token
  axiosClient.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('token');
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  });

  // Response interceptor: Handle 401 errors by clearing auth
  axiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login (can be done in component)
        window.dispatchEvent(new Event('auth:logout'));
      }
      return Promise.reject(error);
    }
  );
}

/**
 * Get CSRF token from meta tag or cookie
 */
function getCsrfToken(): string | null {
  // First try to get from meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  // Fall back to getting from cookie
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  
  return null;
}

/**
 * Get the Axios client instance
 */
export function getAxiosClient(): AxiosInstance {
  if (!axiosClient) {
    throw new Error('API client not initialized. Call loadApiConfig() first.');
  }
  return axiosClient;
}

/**
 * Get a route by path (e.g., 'auth.login' -> '/auth/login')
 */
export function getRoute(path: string): string {
  if (!config) {
    throw new Error('API config not loaded');
  }

  const parts = path.split('.');
  let value: any = config.routes;

  for (const part of parts) {
    value = value?.[part];
  }

  if (typeof value !== 'string') {
    throw new Error(`Route not found: ${path}`);
  }

  return value;
}

/**
 * Get the API base URL
 */
export function getApiBaseUrl(): string {
  if (!config) {
    throw new Error('API config not loaded');
  }
  return config.apiBaseUrl;
}

/**
 * Check if config is loaded
 */
export function isConfigLoaded(): boolean {
  return config !== null;
}

/**
 * Export the config for direct access if needed
 */
export function getConfig(): ApiConfig | null {
  return config;
}

const apiExport = {
  loadApiConfig,
  getAxiosClient,
  getRoute,
  getApiBaseUrl,
  isConfigLoaded,
  getConfig,
};

export default apiExport;
