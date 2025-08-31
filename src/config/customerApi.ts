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

  acceptBid: async (jobId: string, bidId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.ACCEPT_BID(jobId, bidId),
      { method: 'POST' },
      true
    );
  },

  rejectBid: async (jobId: string, bidId: string) => {
    return apiCall(
      API_CONFIG.ENDPOINTS.JOBS.REJECT_BID(jobId, bidId),
      { method: 'POST' },
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
};

export default customerAPI;
