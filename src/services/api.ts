import { API_CONFIG, apiCall } from '../config/api';

// API Service Functions - Pure API calls without React Query
export const apiService = {
  // Authentication APIs
  auth: {
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
  },

  // Users APIs
  users: {
    getAll: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.USERS.GET_ALL,
        {
          method: 'GET',
        },
        true
      );
    },

    getById: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id),
        {
          method: 'GET',
        },
        true
      );
    },

    getStats: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.USERS.STATS(id),
        {
          method: 'GET',
        },
        true
      );
    },

    update: async (id: string, userData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.USERS.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(userData),
        },
        true
      );
    },

    delete: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.USERS.DELETE(id),
        {
          method: 'DELETE',
        },
        true
      );
    },
  },

  // Jobs APIs
  jobs: {
    getAll: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_ALL,
        {
          method: 'GET',
        },
        true
      );
    },

    getOpen: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_OPEN,
        {
          method: 'GET',
        },
        true
      );
    },

    getById: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_BY_ID(id),
        {
          method: 'GET',
        },
        true
      );
    },

    getCustomerJobs: async (customerId: string) => {
      return apiCall(
        `${API_CONFIG.ENDPOINTS.JOBS.GET_CUSTOMER_JOBS}?customerId=${customerId}`,
        {
          method: 'GET',
        },
        true
      );
    },

    getVendorJobs: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_VENDOR_JOBS,
        {
          method: 'GET',
        },
        true
      );
    },

    getBids: async (jobId: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_BIDS(jobId),
        {
          method: 'GET',
        },
        true
      );
    },

    create: async (jobData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(jobData),
        },
        true
      );
    },

    update: async (id: string, jobData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(jobData),
        },
        true
      );
    },

    delete: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.DELETE(id),
        {
          method: 'DELETE',
        },
        true
      );
    },

    placeBid: async (jobId: string, bidData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.BID(jobId),
        {
          method: 'POST',
          body: JSON.stringify(bidData),
        },
        true
      );
    },

    acceptBid: async (jobId: string, bidId: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.ACCEPT_BID(jobId, bidId),
        {
          method: 'POST',
        },
        true
      );
    },

    rejectBid: async (jobId: string, bidId: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.JOBS.REJECT_BID(jobId, bidId),
        {
          method: 'POST',
        },
        true
      );
    },
  },

  // Services APIs
  services: {
    getAll: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.GET_ALL,
        {
          method: 'GET',
        },
        true
      );
    },

    getById: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.GET_BY_ID(id),
        {
          method: 'GET',
        },
        true
      );
    },

    create: async (serviceData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(serviceData),
        },
        true
      );
    },

    update: async (id: string, serviceData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(serviceData),
        },
        true
      );
    },

    delete: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.DELETE(id),
        {
          method: 'DELETE',
        },
        true
      );
    },
  },

  // Payments APIs
  payments: {
    getAll: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL,
        {
          method: 'GET',
        },
        true
      );
    },

    getById: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_ID(id),
        {
          method: 'GET',
        },
        true
      );
    },

    create: async (paymentData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(paymentData),
        },
        true
      );
    },

    release: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.RELEASE(id),
        {
          method: 'POST',
        },
        true
      );
    },

    refund: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.REFUND(id),
        {
          method: 'POST',
        },
        true
      );
    },
  },

  // Support APIs
  support: {
    getTickets: async (
      userId?: string,
      status?: string,
      page = 1,
      limit = 10
    ) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (userId) params.append('userId', userId);
      if (status) params.append('status', status);

      return apiCall(
        `${API_CONFIG.ENDPOINTS.SUPPORT.GET_ALL}?${params}`,
        {
          method: 'GET',
        },
        true
      );
    },

    getTicketById: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.GET_BY_ID(id),
        {
          method: 'GET',
        },
        true
      );
    },

    getAdminTickets: async (
      status?: string,
      priority?: string,
      category?: string,
      page = 1,
      limit = 20
    ) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (category) params.append('category', category);

      return apiCall(
        `${API_CONFIG.ENDPOINTS.SUPPORT.ADMIN_TICKETS}?${params}`,
        {
          method: 'GET',
        },
        true
      );
    },

    getAdminTicketsByStatus: async (status: string, page = 1, limit = 10) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      return apiCall(
        `${API_CONFIG.ENDPOINTS.SUPPORT.ADMIN_TICKETS_BY_STATUS(
          status
        )}?${params}`,
        {
          method: 'GET',
        },
        true
      );
    },

    getAdminStats: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.ADMIN_STATS,
        {
          method: 'GET',
        },
        true
      );
    },

    createTicket: async (ticketData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(ticketData),
        },
        true
      );
    },

    updateTicket: async (id: string, ticketData: any) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(ticketData),
        },
        true
      );
    },

    deleteTicket: async (id: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.DELETE(id),
        {
          method: 'DELETE',
        },
        true
      );
    },

    assignTicket: async (id: string, assignedToId: string) => {
      return apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.ASSIGN_TICKET(id),
        {
          method: 'PATCH',
          body: JSON.stringify({ assignedToId }),
        },
        true
      );
    },

    getCategories: async () => {
      return apiCall(API_CONFIG.ENDPOINTS.SUPPORT.CATEGORIES, {
        method: 'GET',
      });
    },

    getPriorities: async () => {
      return apiCall(API_CONFIG.ENDPOINTS.SUPPORT.PRIORITIES, {
        method: 'GET',
      });
    },
  },

  // Dashboard APIs
  dashboard: {
    getCustomerDashboard: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.DASHBOARD.CUSTOMER,
        {
          method: 'GET',
        },
        true
      );
    },

    getVendorDashboard: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.DASHBOARD.VENDOR,
        {
          method: 'GET',
        },
        true
      );
    },

    getAdminDashboard: async () => {
      return apiCall(
        API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN,
        {
          method: 'GET',
        },
        true
      );
    },
  },
};

export default apiService;
