// Admin API functions - Updated to fix duplicate declarations - ${new Date().toISOString()}
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
  phone?: string;
  status: string;
  location?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  vendorProfile?: {
    companyName?: string;
    businessType?: string;
    experience?: number;
    skills: string[];
    rating: number;
    totalReviews: number;
    completedJobs: number;
    portfolio?: string[];
    documents?: string[];
    verified: boolean;
    verifiedAt?: string;
  };
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  lastActive?: string;
  totalReviews?: number;
  averageRating?: number;
  recentActivity?: string;
  customerProfile?: {
    preferredCategories: string[];
    budgetRange?: string;
    totalJobsPosted: number;
    totalSpent: number;
  };
  createdAt: string;
}

export interface CustomerStats {
  success: boolean;
  data: {
    totalCustomers: number;
    activeCustomers: number;
    suspendedCustomers: number;
    deletedCustomers: number;
    newCustomersThisMonth: number;
    customerGrowth: string;
    activePercentage: string;
    totalRevenue: number;
    averageOrderValue: number;
    highValueCustomers: number;
    mediumValueCustomers: number;
    lowValueCustomers: number;
  };
}

export interface CustomerDetails extends Customer {
  jobs: {
    id: string;
    title: string;
    status: string;
    budget: number;
    createdAt: string;
  }[];
  customerPayments: {
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  method: string;
  isEscrow: boolean;
  escrowFee: number;
  platformFee: number;
  netAmount: number;
  jobId?: string;
  customerId: string;
  vendorId: string;
  transactionId?: string;
  paymentMethod?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  vendor: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  job?: {
    id: string;
    title: string;
    description: string;
    budget?: number;
    budgetType: string;
  };
  createdAt: string;
  paidAt?: string;
  releasedAt?: string;
}

export interface PaymentStats {
  success: boolean;
  data: {
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalRevenue: number;
    totalPlatformFees: number;
    totalEscrowFees: number;
    monthlyRevenue: number;
    monthlyGrowth: string;
    successRate: string;
    pendingAmount: number;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  budgetType: string;
  status: string;
  priority: string;
  location?: string;
  isRemote: boolean;
  deadline?: string;
  requirements?: string[];
  tags?: string[];
  customer: { firstName: string; lastName: string; email: string };
  assignedVendor?: { firstName: string; lastName: string; email: string };
  bids: { id: string }[];
  viewCount?: number;
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
  success: boolean;
  data: {
    users?: T[];
    jobs?: T[];
    vendors?: T[];
    customers?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'DELETED';
  emailVerified: boolean;
  phoneVerified: boolean;
  rating?: number;
  totalReviews?: number;
  totalEarnings?: number;
  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  location?: string;
  totalJobs?: number;
  totalSpent?: number;
  joinedDate?: string;
  lastActive?: string;
  vendorProfile?: {
    companyName?: string;
    businessType?: string;
    experience?: number;
    skills: string[];
    verified: boolean;
    totalJobs: number;
    completedJobs: number;
  };
  customerProfile?: {
    preferredCategories: string[];
    budgetRange?: string;
    totalJobsPosted: number;
    totalSpent: number;
  };
}

export interface UserStats {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    pendingVerification: number;
    suspendedUsers: number;
    totalVendors: number;
    totalCustomers: number;
    newUsersThisMonth: number;
    activeUsersThisMonth: number;
    userGrowth: string;
    activePercentage: string;
  };
}

export interface JobStats {
  success: boolean;
  data: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    disputedJobs: number;
    totalValue: number;
    averageBudget: number;
    jobGrowth: string;
    categoryDistribution: {
      category: string;
      count: number;
      percentage: number;
    }[];
    monthlyTrends: {
      month: string;
      jobs: number;
      value: number;
    }[];
  };
}

export interface UserDetails extends User {
  jobs: {
    id: string;
    title: string;
    status: string;
    budget: number;
    createdAt: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
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

// Enhanced vendor management APIs
export const getVendorStats = async (): Promise<{
  success: boolean;
  data: {
    totalVendors: number;
    verifiedVendors: number;
    pendingVendors: number;
    suspendedVendors: number;
    rejectedVendors: number;
    newVendorsThisMonth: number;
    vendorGrowth: string;
    verifiedPercentage: string;
    averageRating: number;
    totalCompletedJobs: number;
  };
}> => {
  const response = await apiCall(
    '/api/admin/vendors/stats',
    { method: 'GET' },
    true
  );
  return response;
};

export const getVendorDetails = async (
  vendorId: string
): Promise<{
  success: boolean;
  data: Vendor & {
    vendorProfile?: {
      companyName?: string;
      businessType?: string;
      experience?: number;
      skills: string[];
      rating: number;
      totalReviews: number;
      completedJobs: number;
      portfolio?: string[];
      documents?: string[];
      verified: boolean;
      verifiedAt?: string;
    };
    jobs: {
      id: string;
      title: string;
      status: string;
      budget: number;
      createdAt: string;
    }[];
    reviews: {
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
    }[];
  };
}> => {
  const response = await apiCall(
    `/api/admin/vendors/${vendorId}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const bulkUpdateVendorStatus = async (
  vendorIds: string[],
  status: string,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: { updatedVendors: number };
}> => {
  const response = await apiCall(
    '/api/admin/vendors/bulk/status',
    {
      method: 'PATCH',
      body: JSON.stringify({ vendorIds, status, reason }),
    },
    true
  );
  return response;
};

export const bulkDeleteVendors = async (
  vendorIds: string[],
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: { deletedVendors: number };
}> => {
  const response = await apiCall(
    '/api/admin/vendors/bulk',
    {
      method: 'DELETE',
      body: JSON.stringify({ vendorIds, reason }),
    },
    true
  );
  return response;
};

export const exportVendors = async (params?: {
  format?: 'csv' | 'json';
  status?: string;
  verification?: string;
  search?: string;
}): Promise<Blob | { success: boolean; data: Vendor[]; exportInfo: any }> => {
  const searchParams = new URLSearchParams();
  if (params?.format) searchParams.append('format', params.format);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.verification)
    searchParams.append('verification', params.verification);
  if (params?.search) searchParams.append('search', params.search);

  if (params?.format === 'csv') {
    // For CSV, return blob
    const response = await fetch(
      `${
        process.env.REACT_APP_API_URL
      }/api/admin/vendors/export?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export vendors');
    }

    return response.blob();
  } else {
    // For JSON, use regular apiCall
    const response = await apiCall(
      `/api/admin/vendors/export?${searchParams.toString()}`,
      { method: 'GET' },
      true
    );
    return response;
  }
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

export const getCustomerStats = async (): Promise<CustomerStats> => {
  const response = await apiCall(
    '/api/admin/customers/stats',
    { method: 'GET' },
    true
  );
  return response;
};

export const getCustomerDetails = async (
  customerId: string
): Promise<CustomerDetails> => {
  const response = await apiCall(
    `/api/admin/customers/${customerId}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const toggleCustomerStatus = async (
  customerId: string,
  status: string,
  reason?: string
): Promise<void> => {
  await apiCall(
    `/api/admin/customers/${customerId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    },
    true
  );
};

export const bulkUpdateCustomerStatus = async (
  customerIds: string[],
  status: string,
  reason?: string
): Promise<void> => {
  await apiCall(
    '/api/admin/customers/bulk/status',
    {
      method: 'PATCH',
      body: JSON.stringify({ customerIds, status, reason }),
    },
    true
  );
};

export const bulkDeleteCustomers = async (
  customerIds: string[],
  reason?: string
): Promise<void> => {
  await apiCall(
    '/api/admin/customers/bulk',
    {
      method: 'DELETE',
      body: JSON.stringify({ customerIds, reason }),
    },
    true
  );
};

export const getCustomersBySpending = async (
  spending: 'high' | 'medium' | 'low',
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Customer>> => {
  const response = await apiCall(
    `/api/admin/customers/spending/${spending}?page=${page}&limit=${limit}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const exportCustomers = async (
  format: 'csv' | 'json' = 'csv',
  status?: string,
  spending?: string,
  search?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);
  if (status) params.append('status', status);
  if (spending) params.append('spending', spending);
  if (search) params.append('search', search);

  const response = await apiCall(
    `/api/admin/customers/export?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

// ========================================
// PAYMENT MANAGEMENT
// ========================================

export const getAllPayments = async (
  status?: string,
  type?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Payment>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiCall(
    `/api/admin/payments?${params.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const getPaymentStats = async (): Promise<PaymentStats> => {
  const response = await apiCall(
    '/api/admin/payments/stats',
    { method: 'GET' },
    true
  );
  return response;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: string,
  reason?: string
): Promise<void> => {
  await apiCall(
    `/api/admin/payments/${paymentId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    },
    true
  );
};

export const exportPayments = async (
  format: 'csv' | 'json' = 'csv',
  status?: string,
  type?: string
): Promise<void> => {
  const params = new URLSearchParams();
  params.append('format', format);
  if (status) params.append('status', status);
  if (type) params.append('type', type);

  await apiCall(
    `/api/admin/payments/export?${params.toString()}`,
    { method: 'GET' },
    true
  );
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
// USER MANAGEMENT APIs
// ========================================

export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<User>> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.role) searchParams.append('role', params.role);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const response = await apiCall(
    `/api/admin/users?${searchParams.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await apiCall(
    '/api/admin/users/stats',
    { method: 'GET' },
    true
  );
  return response;
};

export const getUserDetails = async (userId: string): Promise<UserDetails> => {
  const response = await apiCall(
    `/api/admin/users/${userId}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const updateUserStatus = async (
  userId: string,
  status: string,
  reason?: string
): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await apiCall(
    `/api/admin/users/${userId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    },
    true
  );
  return response;
};

export const deleteUser = async (
  userId: string
): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await apiCall(
    `/api/admin/users/${userId}`,
    { method: 'DELETE' },
    true
  );
  return response;
};

// New user management APIs
export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  password: string;
  location?: string;
  companyName?: string;
  businessType?: string;
  experience?: number;
  skills?: string[];
  preferredCategories?: string[];
  budgetRange?: string;
}): Promise<{ success: boolean; message: string; data: User }> => {
  const response = await apiCall(
    '/api/admin/users',
    {
      method: 'POST',
      body: JSON.stringify(userData),
    },
    true
  );
  return response;
};

export const bulkUpdateUserStatus = async (
  userIds: string[],
  status: string,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: { updatedUsers: User[] };
}> => {
  const response = await apiCall(
    '/api/admin/users/bulk/status',
    {
      method: 'PATCH',
      body: JSON.stringify({ userIds, status, reason }),
    },
    true
  );
  return response;
};

export const bulkDeleteUsers = async (
  userIds: string[],
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: { deletedUsers: User[] };
}> => {
  const response = await apiCall(
    '/api/admin/users/bulk',
    {
      method: 'DELETE',
      body: JSON.stringify({ userIds, reason }),
    },
    true
  );
  return response;
};

export const updateUserVerification = async (
  userId: string,
  verificationData: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    reason?: string;
  }
): Promise<{ success: boolean; message: string; data: User }> => {
  const response = await apiCall(
    `/api/admin/users/${userId}/verification`,
    {
      method: 'PATCH',
      body: JSON.stringify(verificationData),
    },
    true
  );
  return response;
};

export const getUserActivity = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<{
  success: boolean;
  data: {
    user: User;
    jobs: PaginatedResponse<any>;
    payments: PaginatedResponse<any>;
    bids?: PaginatedResponse<any>;
    reviews: PaginatedResponse<any>;
  };
}> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await apiCall(
    `/api/admin/users/${userId}/activity?${searchParams.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const exportUsers = async (params?: {
  format?: 'csv' | 'json';
  role?: string;
  status?: string;
  search?: string;
}): Promise<Blob | { success: boolean; data: User[]; exportInfo: any }> => {
  const searchParams = new URLSearchParams();
  if (params?.format) searchParams.append('format', params.format);
  if (params?.role) searchParams.append('role', params.role);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.search) searchParams.append('search', params.search);

  if (params?.format === 'csv') {
    // For CSV, return blob
    const response = await fetch(
      `${
        process.env.REACT_APP_API_URL
      }/api/admin/users/export?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export users');
    }

    return response.blob();
  } else {
    // For JSON, use regular apiCall
    const response = await apiCall(
      `/api/admin/users/export?${searchParams.toString()}`,
      { method: 'GET' },
      true
    );
    return response;
  }
};

// ========================================
// JOB MANAGEMENT APIs
// ========================================

export const getJobStats = async (): Promise<JobStats> => {
  const response = await apiCall(
    '/api/admin/jobs/stats',
    { method: 'GET' },
    true
  );
  return response;
};

export const getAllJobs = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Job>> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const response = await apiCall(
    `/api/admin/jobs?${searchParams.toString()}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const getJobDetails = async (
  jobId: string
): Promise<{ success: boolean; data: Job }> => {
  const response = await apiCall(
    `/api/admin/jobs/${jobId}`,
    { method: 'GET' },
    true
  );
  return response;
};

export const updateJobStatus = async (
  jobId: string,
  status: string,
  reason?: string
): Promise<{ success: boolean; message: string; data: Job }> => {
  const response = await apiCall(
    `/api/admin/jobs/${jobId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    },
    true
  );
  return response;
};

export const deleteJob = async (
  jobId: string,
  reason?: string
): Promise<{ success: boolean; message: string; data: Job }> => {
  const response = await apiCall(
    `/api/admin/jobs/${jobId}`,
    {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    },
    true
  );
  return response;
};

export const bulkUpdateJobStatus = async (
  jobIds: string[],
  status: string,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: { updatedJobs: Job[] };
}> => {
  const response = await apiCall(
    '/api/admin/jobs/bulk/status',
    {
      method: 'PATCH',
      body: JSON.stringify({ jobIds, status, reason }),
    },
    true
  );
  return response;
};

export const bulkDeleteJobs = async (
  jobIds: string[],
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  data: { deletedJobs: Job[] };
}> => {
  const response = await apiCall(
    '/api/admin/jobs/bulk',
    {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    },
    true
  );
  return response;
};

export const exportJobs = async (params?: {
  format?: 'csv' | 'json';
  status?: string;
  category?: string;
  search?: string;
}): Promise<Blob | { success: boolean; data: Job[]; exportInfo: any }> => {
  const searchParams = new URLSearchParams();
  if (params?.format) searchParams.append('format', params.format);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);

  if (params?.format === 'csv') {
    // For CSV, return blob
    const response = await fetch(
      `${
        process.env.REACT_APP_API_URL
      }/api/admin/jobs/export?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export jobs');
    }

    return response.blob();
  } else {
    // For JSON, use regular apiCall
    const response = await apiCall(
      `/api/admin/jobs/export?${searchParams.toString()}`,
      { method: 'GET' },
      true
    );
    return response;
  }
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
