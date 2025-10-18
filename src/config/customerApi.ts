import { API_CONFIG, apiCall } from './api';

// Customer API Service - Essential Methods Only
export const customerAPI = {
  // Dashboard Data
  getDashboard: async (customerId: string) => {
    return apiCall(
      `${API_CONFIG.ENDPOINTS.DASHBOARD.CUSTOMER}?customerId=${customerId}`,
      { method: 'GET' },
      true
    );
  },

  // Job Management
  getJobs: async (customerId: string) => {
    return apiCall(
      `${API_CONFIG.ENDPOINTS.JOBS.GET_CUSTOMER_JOBS}?customerId=${customerId}`,
      { method: 'GET' },
      true
    );
  },

  getJobById: async (jobId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.GET_BY_ID(jobId),
      { method: 'GET' },
      true
    );
  },

  getJobDetails: async (jobId: string, customerId: string) => {
    console.log('🔧 CustomerAPI.getJobDetails called');
    console.log('Job ID:', jobId);
    console.log('Customer ID:', customerId);
    console.log('URL:', `${API_CONFIG.ENDPOINTS.JOBS.GET_BY_ID(jobId)}`);

    const response = await apiCall(
      `${API_CONFIG.ENDPOINTS.JOBS.GET_BY_ID(jobId)}`,
      { method: 'GET' },
      true
    );

    console.log('🔧 CustomerAPI.getJobDetails response:', response);
    return response;
  },

  getJobAnalytics: async (jobId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.DASHBOARD.JOB_ANALYTICS(jobId),
      { method: 'GET' },
      true
    );
  },

  createJob: async (jobData: any) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(jobData),
      },
      true
    );
  },

  updateJob: async (jobId: string, jobData: any) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.UPDATE(jobId),
      {
        method: 'PATCH',
        body: JSON.stringify(jobData),
      },
      true
    );
  },

  deleteJob: async (jobId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.DELETE(jobId),
      { method: 'DELETE' },
      true
    );
  },

  // Bid Management
  getJobBids: async (jobId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.GET_BIDS(jobId),
      { method: 'GET' },
      true
    );
  },

  acceptBid: async (jobId: string, bidId: string, customerId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.ACCEPT_BID(jobId, bidId),
      {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      },
      true
    );
  },

  rejectBid: async (jobId: string, bidId: string, customerId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.REJECT_BID(jobId, bidId),
      {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      },
      true
    );
  },

  // User Profile
  getProfile: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.ME, { method: 'GET' }, true);
  },

  updateProfile: async (profileData: any) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE,
      {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      },
      true
    );
  },

  // Enhanced Profile Management
  getProfileData: async () => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE_DATA,
      { method: 'GET' },
      true
    );
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.UPLOAD_PICTURE,
      {
        method: 'POST',
        body: formData,
      },
      true
    );
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      true
    );
  },

  deleteAccount: async (password: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT,
      {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      },
      true
    );
  },

  // Counter Bid
  counterBid: async (
    bidId: string,
    counterAmount: number,
    message: string,
    userId?: string
  ) => {
    const currentUserId = userId || localStorage.getItem('userId');
    console.log('🔍 customerAPI.counterBid called:', {
      bidId,
      counterAmount,
      message,
      userId: currentUserId,
      url: `/api/jobs/bids/${bidId}/counter-offer`,
    });

    return apiCall(
      `/api/jobs/bids/${bidId}/counter-offer`,
      {
        method: 'POST',
        body: JSON.stringify({
          counterAmount,
          message,
          userId: currentUserId,
          userRole: 'CUSTOMER',
        }),
      },
      true
    );
  },
};

export default customerAPI;
