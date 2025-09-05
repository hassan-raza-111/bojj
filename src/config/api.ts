import { ENV_CONFIG } from './env';

// API Configuration
export const API_CONFIG = {
  // Backend base URL
  BASE_URL: ENV_CONFIG.BACKEND_URL,

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      UPDATE_PROFILE: '/api/auth/me',
      CHANGE_PASSWORD: '/api/auth/change-password',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      PROFILE_DATA: '/api/auth/profile',
      UPLOAD_PICTURE: '/api/auth/profile/picture',
      DELETE_ACCOUNT: '/api/auth/account',
    },
    USERS: {
      GET_ALL: '/api/users',
      GET_BY_ID: (id: string) => `/api/users/${id}`,
      UPDATE: (id: string) => `/api/users/${id}`,
      DELETE: (id: string) => `/api/users/${id}`,
      STATS: (id: string) => `/api/users/${id}/stats`,
    },
    JOBS: {
      GET_ALL: '/api/jobs',
      GET_OPEN: '/api/jobs/open',
      GET_BY_ID: (id: string) => `/api/jobs/${id}`,
      CREATE: '/api/jobs',
      UPDATE: (id: string) => `/api/jobs/${id}`,
      DELETE: (id: string) => `/api/jobs/${id}`,
      BID: (id: string) => `/api/jobs/${id}/bid`,
      GET_BIDS: (id: string) => `/api/jobs/${id}/bids`,
      GET_CUSTOMER_JOBS: '/api/jobs/customer',
      GET_VENDOR_JOBS: '/api/jobs/vendor',
      GET_DETAILS: (id: string) => `/api/jobs/${id}/details`,
      ACCEPT_BID: (jobId: string, bidId: string) =>
        `/api/jobs/${jobId}/accept-bid/${bidId}`,
      REJECT_BID: (jobId: string, bidId: string) =>
        `/api/jobs/${jobId}/reject-bid/${bidId}`,
    },
    SERVICES: {
      GET_ALL: '/api/services',
      GET_BY_ID: (id: string) => `/api/services/${id}`,
      CREATE: '/api/services',
      UPDATE: (id: string) => `/api/services/${id}`,
      DELETE: (id: string) => `/api/services/${id}`,
    },
    PAYMENTS: {
      GET_ALL: '/api/payments',
      GET_BY_ID: (id: string) => `/api/payments/${id}`,
      CREATE: '/api/payments',
      RELEASE: (id: string) => `/api/payments/${id}/release`,
      REFUND: (id: string) => `/api/payments/${id}/refund`,
    },
    SUPPORT: {
      GET_ALL: '/api/support/tickets',
      GET_BY_ID: (id: string) => `/api/support/tickets/${id}`,
      CREATE: '/api/support/tickets',
      UPDATE: (id: string) => `/api/support/tickets/${id}`,
      ADMIN_TICKETS: '/api/support/admin/tickets',
      ADMIN_STATS: '/api/support/admin/tickets/stats',
    },
    DASHBOARD: {
      CUSTOMER: '/api/dashboard/customer',
      VENDOR: '/api/dashboard/vendor',
      ADMIN: '/api/dashboard/admin',
      JOB_ANALYTICS: (jobId: string) =>
        `/api/dashboard/customer/job/${jobId}/analytics`,
    },
  },

  // Request headers
  getHeaders: (includeAuth: boolean = false) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  },

  // Full URL builder
  getUrl: (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`,
};

// API utility functions
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = false
) => {
  const url = API_CONFIG.getUrl(endpoint);
  const headers = API_CONFIG.getHeaders(includeAuth);

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  console.log('🚀 API Call Details:');
  console.log('🚀 URL:', url);
  console.log('🚀 Method:', options.method || 'GET');
  console.log('🚀 Headers:', headers);
  console.log('🚀 Include Auth:', includeAuth);
  console.log('🚀 Options:', options);

  try {
    const response = await fetch(url, config);
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', errorData);

      // Create a custom error object that preserves the API response details
      const customError = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
      (customError as any).details = errorData.details;
      (customError as any).statusCode = errorData.statusCode;
      (customError as any).success = errorData.success;
      (customError as any).apiResponse = errorData;

      throw customError;
    }

    const data = await response.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.ME,
      {
        method: 'GET',
      },
      true
    );
  },

  updateProfile: async (userData: any) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE,
      {
        method: 'PATCH',
        body: JSON.stringify(userData),
      },
      true
    );
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      {
        method: 'PATCH',
        body: JSON.stringify(passwordData),
      },
      true
    );
  },

  logout: async () => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
      {
        method: 'POST',
      },
      true
    );
  },
};

export default API_CONFIG;
