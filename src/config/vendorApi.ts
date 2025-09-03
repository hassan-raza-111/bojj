import { API_CONFIG, apiCall } from './api';

export interface VendorDashboardSummary {
  availableJobs: number;
  activeBids: number;
  awardedJobs: number;
  monthlyEarnings: number;
  pendingPayments: number;
  rating: number;
}

export interface AvailableJob {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  budgetType: string;
  location?: string;
  city?: string;
  state?: string;
  deadline?: string;
  createdAt: string;
  urgency?: string;
  estimatedDuration?: string;
  totalBids: number;
  averageBidAmount: number;
  customerRating: number;
  customerTotalJobs: number;
  distance: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    location?: string;
    customerProfile?: {
      totalJobsPosted: number;
    };
  };
  bids: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
}

export interface ActiveBid {
  id: string;
  amount: number;
  description: string;
  timeline: string;
  status: string;
  notes?: string;
  milestones?: any;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    category: string;
    budget?: number;
    location?: string;
    customer: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface VendorBid {
  id: string;
  amount: number;
  description: string;
  timeline: string;
  status: string;
  notes?: string;
  milestones?: any;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    budget?: number;
    budgetType: string;
    location?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    deadline?: string;
    status: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      location?: string;
      customerProfile?: {
        totalJobsPosted: number;
      };
    };
  };
}

export interface AwardedJob {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  assignedVendorId: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  payments: Array<{
    status: string;
    amount: number;
  }>;
}

export interface VendorEarnings {
  totalEarnings: number;
  pendingPayments: number;
  monthlyBreakdown: Array<{
    date: string;
    amount: number;
  }>;
}

export interface BidSubmission {
  jobId: string;
  amount: number;
  description: string;
  timeline: string;
  milestones?: any;
}

export interface JobDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  budgetType: string;
  location?: string;
  deadline?: string;
  requirements: string[];
  customer: {
    firstName: string;
    lastName: string;
    location?: string;
    phone?: string;
  };
  bids: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
}

export const vendorApi = {
  // Get dashboard summary
  getDashboardSummary: async (): Promise<VendorDashboardSummary> => {
    const response = await apiCall(
      '/api/vendor/dashboard/summary',
      { method: 'GET' },
      true
    );
    return response;
  },

  // Get available jobs
  getAvailableJobs: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    budgetMin?: number;
    budgetMax?: number;
  }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    const url = `/api/vendor/jobs/available${queryString}`;
    const response = await apiCall(url, { method: 'GET' }, true);
    return response;
  },

  // Get available filters
  getAvailableFilters: async () => {
    const response = await apiCall(
      '/api/vendor/jobs/filters',
      { method: 'GET' },
      true
    );
    return response;
  },

  // Get active bids
  getActiveBids: async (params?: { page?: number; limit?: number }) => {
    // Filter out undefined values and build query string
    const cleanParams: Record<string, string | number> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanParams[key] = value;
        }
      });
    }

    const queryString =
      Object.keys(cleanParams).length > 0
        ? `?${new URLSearchParams(cleanParams as any).toString()}`
        : '';

    return apiCall(
      `/api/vendor/bids/active${queryString}`,
      { method: 'GET' },
      true
    );
  },

  // Get all bids with filtering
  getAllBids: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    // Filter out undefined values and build query string
    const cleanParams: Record<string, string | number> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanParams[key] = value;
        }
      });
    }

    const queryString =
      Object.keys(cleanParams).length > 0
        ? `?${new URLSearchParams(cleanParams as any).toString()}`
        : '';

    return apiCall(`/api/vendor/bids${queryString}`, { method: 'GET' }, true);
  },

  // Get bid details
  getBidDetails: async (bidId: string) => {
    return apiCall(`/api/vendor/bids/${bidId}`, { method: 'GET' }, true);
  },

  // Update bid
  updateBid: async (
    bidId: string,
    bidData: {
      amount?: number;
      description?: string;
      timeline?: string;
      notes?: string;
      milestones?: any;
    }
  ) => {
    return apiCall(
      `/api/vendor/bids/${bidId}`,
      {
        method: 'PUT',
        body: JSON.stringify(bidData),
      },
      true
    );
  },

  // Withdraw bid
  withdrawBid: async (bidId: string) => {
    return apiCall(`/api/vendor/bids/${bidId}`, { method: 'DELETE' }, true);
  },

  // Get awarded jobs
  getAwardedJobs: async (params?: { page?: number; limit?: number }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(
      `/api/vendor/jobs/awarded${queryString}`,
      { method: 'GET' },
      true
    );
  },

  // Get earnings
  getEarnings: async (period?: string) => {
    const queryString = period ? `?period=${period}` : '';
    return apiCall(
      `/api/vendor/earnings${queryString}`,
      { method: 'GET' },
      true
    );
  },

  // Submit bid
  submitBid: async (bidData: BidSubmission) => {
    return apiCall(
      '/api/vendor/bids/submit',
      {
        method: 'POST',
        body: JSON.stringify(bidData),
      },
      true
    );
  },

  // Get job details
  getJobDetails: async (jobId: string) => {
    return apiCall(
      `/api/vendor/jobs/${jobId}/details`,
      { method: 'GET' },
      true
    );
  },
};
