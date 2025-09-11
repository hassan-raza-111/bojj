import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiCall, API_CONFIG } from '../config/api';

// Query Keys
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

// Auth Hooks
export const useAuthProfile = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.ME, { method: 'GET' }, true),
    ...options,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
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
    mutationFn: (userData: any) =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: any) =>
      apiCall(
        API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE,
        {
          method: 'PATCH',
          body: JSON.stringify(userData),
        },
        true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: {
      currentPassword: string;
      newPassword: string;
    }) =>
      apiCall(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          method: 'PATCH',
          body: JSON.stringify(passwordData),
        },
        true
      ),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }, true),
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      queryClient.clear();
    },
  });
};

// Users Hooks
export const useUsers = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.USERS.GET_ALL, { method: 'GET' }, true),
    ...options,
  });
};

export const useUserById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.users.byId(id),
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id),
        { method: 'GET' },
        true
      ),
    enabled: !!id,
    ...options,
  });
};

export const useUserStats = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.users.stats(id),
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.USERS.STATS(id), { method: 'GET' }, true),
    enabled: !!id,
    ...options,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) =>
      apiCall(
        API_CONFIG.ENDPOINTS.USERS.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(userData),
        },
        true
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiCall(
        API_CONFIG.ENDPOINTS.USERS.DELETE(id),
        { method: 'DELETE' },
        true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

// Jobs Hooks
export const useJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.all,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.JOBS.GET_ALL, { method: 'GET' }, true),
    ...options,
  });
};

export const useOpenJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.open,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.JOBS.GET_OPEN, { method: 'GET' }, true),
    ...options,
  });
};

export const useJobById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.byId(id),
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.JOBS.GET_BY_ID(id), { method: 'GET' }, true),
    enabled: !!id,
    ...options,
  });
};

export const useCustomerJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.customer,
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_CUSTOMER_JOBS,
        { method: 'GET' },
        true
      ),
    ...options,
  });
};

export const useVendorJobs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.vendor,
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_VENDOR_JOBS,
        { method: 'GET' },
        true
      ),
    ...options,
  });
};

export const useJobBids = (jobId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs.bids(jobId),
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.GET_BIDS(jobId),
        { method: 'GET' },
        true
      ),
    enabled: !!jobId,
    ...options,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData: any) =>
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(jobData),
        },
        true
      ),
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
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(jobData),
        },
        true
      ),
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
    mutationFn: (id: string) =>
      apiCall(API_CONFIG.ENDPOINTS.JOBS.DELETE(id), { method: 'DELETE' }, true),
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
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.BID(jobId),
        {
          method: 'POST',
          body: JSON.stringify(bidData),
        },
        true
      ),
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
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.ACCEPT_BID(jobId, bidId),
        {
          method: 'POST',
        },
        true
      ),
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
      apiCall(
        API_CONFIG.ENDPOINTS.JOBS.REJECT_BID(jobId, bidId),
        {
          method: 'POST',
        },
        true
      ),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.bids(jobId) });
    },
  });
};

// Services Hooks
export const useServices = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.SERVICES.GET_ALL, { method: 'GET' }, true),
    ...options,
  });
};

export const useServiceById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.services.byId(id),
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.GET_BY_ID(id),
        { method: 'GET' },
        true
      ),
    enabled: !!id,
    ...options,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceData: any) =>
      apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(serviceData),
        },
        true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, serviceData }: { id: string; serviceData: any }) =>
      apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(serviceData),
        },
        true
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiCall(
        API_CONFIG.ENDPOINTS.SERVICES.DELETE(id),
        { method: 'DELETE' },
        true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

// Payments Hooks
export const usePayments = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, { method: 'GET' }, true),
    ...options,
  });
};

export const usePaymentById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.payments.byId(id),
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_ID(id),
        { method: 'GET' },
        true
      ),
    enabled: !!id,
    ...options,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData: any) =>
      apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(paymentData),
        },
        true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useReleasePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.RELEASE(id),
        { method: 'POST' },
        true
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiCall(
        API_CONFIG.ENDPOINTS.PAYMENTS.REFUND(id),
        { method: 'POST' },
        true
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

// Support Hooks
export const useSupportTickets = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.tickets,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.SUPPORT.GET_ALL, { method: 'GET' }, true),
    ...options,
  });
};

export const useSupportTicketById = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.byId(id),
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.GET_BY_ID(id),
        { method: 'GET' },
        true
      ),
    enabled: !!id,
    ...options,
  });
};

export const useAdminTickets = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.adminTickets,
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.ADMIN_TICKETS,
        { method: 'GET' },
        true
      ),
    ...options,
  });
};

export const useAdminStats = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.support.adminStats,
    queryFn: () =>
      apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.ADMIN_STATS,
        { method: 'GET' },
        true
      ),
    ...options,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketData: any) =>
      apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(ticketData),
        },
        true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
      queryClient.invalidateQueries({
        queryKey: queryKeys.support.adminTickets,
      });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ticketData }: { id: string; ticketData: any }) =>
      apiCall(
        API_CONFIG.ENDPOINTS.SUPPORT.UPDATE(id),
        {
          method: 'PATCH',
          body: JSON.stringify(ticketData),
        },
        true
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.byId(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
      queryClient.invalidateQueries({
        queryKey: queryKeys.support.adminTickets,
      });
    },
  });
};

// Dashboard Hooks
export const useCustomerDashboard = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dashboard.customer,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.DASHBOARD.CUSTOMER, { method: 'GET' }, true),
    ...options,
  });
};

export const useVendorDashboard = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dashboard.vendor,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.DASHBOARD.VENDOR, { method: 'GET' }, true),
    ...options,
  });
};

export const useAdminDashboard = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: () =>
      apiCall(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN, { method: 'GET' }, true),
    ...options,
  });
};
