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
  customer: {
    firstName: string;
    lastName: string;
    location?: string;
  };
  bids: Array<{ id: string }>;
}

export interface ActiveBid {
  id: string;
  amount: number;
  description: string;
  timeline: string;
  status: string;
  createdAt: string;
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
    return apiCall('/api/vendor/dashboard/summary', { method: 'GET' }, true);
  },

  // Get available jobs
  getAvailableJobs: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
  }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(
      `/api/vendor/jobs/available${queryString}`,
      { method: 'GET' },
      true
    );
  },

  // Get active bids
  getActiveBids: async (params?: { page?: number; limit?: number }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';
    return apiCall(
      `/api/vendor/bids/active${queryString}`,
      { method: 'GET' },
      true
    );
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
