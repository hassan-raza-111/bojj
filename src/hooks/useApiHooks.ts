import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiService } from '../services/api';

// Query Keys - Organized structure
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'],
  },
  users: {
    all: ['users'],
    byId: (id: string) => ['users', id],
    stats: (id: string) => ['users', id, 'stats'],
  },
  jobs: {
    all: ['jobs'],
    open: ['jobs', 'open'],
    byId: (id: string) => ['jobs', id],
    customer: ['jobs', 'customer'],
    vendor: ['jobs', 'vendor'],
    bids: (id: string) => ['jobs', id, 'bids'],
  },
  services: {
    all: ['services'],
    byId: (id: string) => ['services', id],
  },
  payments: {
    all: ['payments'],
    byId: (id: string) => ['payments', id],
  },
  support: {
    tickets: ['support', 'tickets'],
    byId: (id: string) => ['support', 'tickets', id],
    adminTickets: ['support', 'admin', 'tickets'],
    adminStats: ['support', 'admin', 'stats'],
  },
  dashboard: {
    customer: ['dashboard', 'customer'],
    vendor: ['dashboard', 'vendor'],
    admin: ['dashboard', 'admin'],
  },
};

// ===== AUTHENTICATION HOOKS =====
export const useAuthProfile = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: apiService.auth.getProfile,
    ...options,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.auth.login,
    onSuccess: (data) => {
      // Store token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: apiService.auth.register,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.auth.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: apiService.auth.changePassword,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.auth.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      queryClient.clear();
    },
  });
};

// ===== USERS HOOKS =====
export const useUsers = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: apiService.users.getAll,
    ...options,
  });
};

export const useUserById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.users.byId(id),
    queryFn: () => apiService.users.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useUserStats = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.users.stats(id),
    queryFn: () => apiService.users.getStats(id),
    enabled: !!id,
    ...options,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) =>
      apiService.users.update(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.users.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

// ===== JOBS HOOKS =====
export const useJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.all,
    queryFn: apiService.jobs.getAll,
    ...options,
  });
};

export const useOpenJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.open,
    queryFn: apiService.jobs.getOpen,
    ...options,
  });
};

export const useJobById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.byId(id),
    queryFn: () => apiService.jobs.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCustomerJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.customer,
    queryFn: apiService.jobs.getCustomerJobs,
    ...options,
  });
};

export const useVendorJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.vendor,
    queryFn: apiService.jobs.getVendorJobs,
    ...options,
  });
};

export const useJobBids = (jobId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.bids(jobId),
    queryFn: () => apiService.jobs.getBids(jobId),
    enabled: !!jobId,
    ...options,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.jobs.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.open });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.customer });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, jobData }: { id: string; jobData: any }) =>
      apiService.jobs.update(id, jobData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.open });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.jobs.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.open });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.customer });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.vendor });
    },
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, bidData }: { jobId: string; bidData: any }) =>
      apiService.jobs.placeBid(jobId, bidData),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.bids(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(jobId) });
    },
  });
};

export const useAcceptBid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, bidId }: { jobId: string; bidId: string }) =>
      apiService.jobs.acceptBid(jobId, bidId),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.bids(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.customer });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.vendor });
    },
  });
};

export const useRejectBid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, bidId }: { jobId: string; bidId: string }) =>
      apiService.jobs.rejectBid(jobId, bidId),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.bids(jobId) });
    },
  });
};

// ===== SERVICES HOOKS =====
export const useServices = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: apiService.services.getAll,
    ...options,
  });
};

export const useServiceById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.services.byId(id),
    queryFn: () => apiService.services.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.services.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, serviceData }: { id: string; serviceData: any }) =>
      apiService.services.update(id, serviceData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.services.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

// ===== PAYMENTS HOOKS =====
export const usePayments = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: apiService.payments.getAll,
    ...options,
  });
};

export const usePaymentById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.payments.byId(id),
    queryFn: () => apiService.payments.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.payments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useReleasePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.payments.release,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.payments.refund,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

// ===== SUPPORT HOOKS =====
export const useSupportTickets = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.tickets,
    queryFn: apiService.support.getTickets,
    ...options,
  });
};

export const useSupportTicketById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.byId(id),
    queryFn: () => apiService.support.getTicketById(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminTickets = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.adminTickets,
    queryFn: apiService.support.getAdminTickets,
    ...options,
  });
};

export const useAdminStats = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.adminStats,
    queryFn: apiService.support.getAdminStats,
    ...options,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.support.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.adminTickets });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ticketData }: { id: string; ticketData: any }) =>
      apiService.support.updateTicket(id, ticketData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.adminTickets });
    },
  });
};

// ===== DASHBOARD HOOKS =====
export const useCustomerDashboard = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dashboard.customer,
    queryFn: apiService.dashboard.getCustomerDashboard,
    ...options,
  });
};

export const useVendorDashboard = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dashboard.vendor,
    queryFn: apiService.dashboard.getVendorDashboard,
    ...options,
  });
};

export const useAdminDashboard = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: apiService.dashboard.getAdminDashboard,
    ...options,
  });
};
