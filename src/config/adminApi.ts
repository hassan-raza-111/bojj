import { apiCall, API_CONFIG } from './api';

export interface DashboardStats {
  totalVendors: number;
  totalCustomers: number;
  totalJobs: number;
  totalPayments: number;
  pendingVendors: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  recentActivity: {
    recentJobs: any[];
    recentPayments: any[];
  };
}

export interface SystemAnalytics {
  period: number;
  newUsers: number;
  newJobs: number;
  completedJobs: number;
  totalRevenue: number;
  topCategories: any[];
  userGrowth: any[];
  conversionRate: number;
}

export interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  vendorProfile?: {
    companyName?: string;
    businessType?: string;
    experience?: number;
    skills: string[];
    rating: number;
    totalReviews: number;
    completedJobs: number;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  customerProfile?: {
    preferredCategories: string[];
    budgetRange?: string;
    totalJobsPosted: number;
    totalSpent: number;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  isEscrow: boolean;
  customer: { firstName: string; lastName: string; email: string };
  vendor: { firstName: string; lastName: string; email: string };
  job?: { title: string };
  createdAt: string;
  paidAt?: string;
  releasedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  budgetType: string;
  status: string;
  priority: string;
  location?: string;
  isRemote: boolean;
  deadline?: string;
  requirements?: string[];
  customer: { firstName: string; lastName: string; email: string };
  assignedVendor?: { firstName: string; lastName: string; email: string };
  bids: { id: string }[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  user: { firstName: string; lastName: string; email: string };
  assignedTo?: { firstName: string; lastName: string; email: string };
  createdAt: string;
  resolvedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ========================================
// TEST & DEBUG FUNCTIONS
// ========================================

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing backend connection...');
    const response = await apiCall('/health', { method: 'GET' });
    console.log('🧪 Health check response:', response);
    return true;
  } catch (error) {
    console.error('🧪 Backend connection failed:', error);
    return false;
  }
};

// ========================================
// DASHBOARD & STATISTICS
// ========================================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  console.log('🔍 Calling getDashboardStats...');
  console.log('🔍 Endpoint: /api/admin/dashboard/stats');
  console.log('🔍 Full URL:', API_CONFIG.getUrl('/api/admin/dashboard/stats'));

  try {
    const response = await apiCall(
      '/api/admin/dashboard/stats',
      { method: 'GET' },
      true
    );
    console.log('✅ getDashboardStats response:', response);
    return response;
  } catch (error) {
    console.error('❌ getDashboardStats error:', error);
    throw error;
  }
};

export const getSystemAnalytics = async (
  period: number = 30
): Promise<SystemAnalytics> => {
  const response = await apiCall(
    `/api/admin/dashboard/analytics?period=${period}`,
    { method: 'GET' },
    true
  );
  return response;
};

// ========================================
// VENDOR MANAGEMENT
// ========================================

export const getPendingVendors = async (): Promise<Vendor[]> => {
  const response = await apiCall(
    '/api/admin/vendors/pending',
    { method: 'GET' },
    true
  );
  return response;
};

export const getAllVendors = async (
  search?: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Vendor>> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/vendors?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const approveVendor = async (vendorId: string): Promise<void> => {
  await apiCall(
    `/api/admin/vendors/${vendorId}/approve`,
    { method: 'PATCH' },
    true
  );
};

export const rejectVendor = async (
  vendorId: string,
  reason: string
): Promise<void> => {
  await apiCall(
    `/api/admin/vendors/${vendorId}/reject`,
    {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    },
    true
  );
};

export const toggleVendorStatus = async (
  vendorId: string,
  status: string
): Promise<void> => {
  await apiCall(
    `/api/admin/vendors/${vendorId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    true
  );
};

// ========================================
// CUSTOMER MANAGEMENT
// ========================================

export const getAllCustomers = async (
  search?: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Customer>> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/customers?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const toggleCustomerStatus = async (
  customerId: string,
  status: string
): Promise<void> => {
  await apiCall(
    `/api/admin/customers/${customerId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    true
  );
};

// ========================================
// PAYMENT MANAGEMENT
// ========================================

export const getAllPayments = async (
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Payment>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/payments?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const confirmPayment = async (paymentId: string): Promise<void> => {
  await apiCall(
    `/api/admin/payments/${paymentId}/confirm`,
    { method: 'PATCH' },
    true
  );
};

export const releasePayment = async (paymentId: string): Promise<void> => {
  await apiCall(
    `/api/admin/payments/${paymentId}/release`,
    { method: 'PATCH' },
    true
  );
};

export const refundPayment = async (
  paymentId: string,
  reason: string
): Promise<void> => {
  await apiCall(
    `/api/admin/payments/${paymentId}/refund`,
    {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    },
    true
  );
};

// ========================================
// JOB MANAGEMENT
// ========================================

export const getAllJobs = async (
  status?: string,
  category?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Job>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/jobs?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const updateJobStatus = async (
  jobId: string,
  status: string
): Promise<void> => {
  await apiCall(
    `/api/admin/jobs/${jobId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    true
  );
};

export const assignJobToVendor = async (
  jobId: string,
  vendorId: string
): Promise<void> => {
  await apiCall(
    `/api/admin/jobs/${jobId}/assign`,
    {
      method: 'PATCH',
      body: JSON.stringify({ vendorId }),
    },
    true
  );
};

export const cancelJob = async (
  jobId: string,
  reason: string
): Promise<void> => {
  await apiCall(
    `/api/admin/jobs/${jobId}/cancel`,
    {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    },
    true
  );
};

// ========================================
// SUPPORT TICKET MANAGEMENT
// ========================================

export const getAllSupportTickets = async (
  status?: string,
  priority?: string,
  category?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<SupportTicket>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/support-tickets?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const assignTicket = async (
  ticketId: string,
  assignedToId: string
): Promise<void> => {
  await apiCall(
    `/api/admin/support-tickets/${ticketId}/assign`,
    {
      method: 'PATCH',
      body: JSON.stringify({ assignedToId }),
    },
    true
  );
};

export const updateTicketStatus = async (
  ticketId: string,
  status: string
): Promise<void> => {
  await apiCall(
    `/api/admin/support-tickets/${ticketId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    true
  );
};

export const closeTicket = async (
  ticketId: string,
  resolution: string
): Promise<void> => {
  await apiCall(
    `/api/admin/support-tickets/${ticketId}/close`,
    {
      method: 'PATCH',
      body: JSON.stringify({ resolution }),
    },
    true
  );
};

// ========================================
// CATEGORY MANAGEMENT
// ========================================

export const getAllCategories = async (): Promise<any[]> => {
  const response = await apiCall(
    '/api/admin/categories',
    { method: 'GET' },
    true
  );
  return response;
};

export const createCategory = async (categoryData: any): Promise<void> => {
  await apiCall(
    '/api/admin/categories',
    {
      method: 'POST',
      body: JSON.stringify(categoryData),
    },
    true
  );
};

export const updateCategory = async (
  categoryId: string,
  categoryData: any
): Promise<void> => {
  await apiCall(
    `/api/admin/categories/${categoryId}`,
    {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    },
    true
  );
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await apiCall(
    `/api/admin/categories/${categoryId}`,
    { method: 'DELETE' },
    true
  );
};

// ========================================
// ADMIN ACTION LOGS
// ========================================

export const getAdminActionLogs = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<any>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/admin-logs?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
