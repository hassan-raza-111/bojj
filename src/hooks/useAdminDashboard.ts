import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats, getAdminNotifications } from '@/config/adminApi';

export const useAdminDashboard = () => {
  // Fetch admin dashboard statistics
  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getAdminDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Fetch admin notifications
  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: getAdminNotifications,
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Calculate total notification count
  const totalNotifications = notifications?.data
    ? notifications.data.pendingVendors.length +
      notifications.data.urgentTickets.length +
      notifications.data.systemIssues.length
    : 0;

  // Get urgent notifications (high priority)
  const urgentNotifications = notifications?.data
    ? [
        ...notifications.data.urgentTickets,
        ...notifications.data.systemIssues,
      ]
    : [];

  // Get pending vendor approvals
  const pendingVendors = notifications?.data?.pendingVendors || [];

  // Get support tickets
  const supportTickets = notifications?.data?.urgentTickets || [];

  // Get system issues
  const systemIssues = notifications?.data?.systemIssues || [];

  // Get recent payments
  const recentPayments = notifications?.data?.recentPayments || [];

  return {
    // Dashboard stats
    dashboardStats: dashboardStats?.data,
    isLoadingStats,
    statsError,
    refetchStats,

    // Notifications
    notifications: notifications?.data,
    isLoadingNotifications,
    notificationsError,
    refetchNotifications,

    // Calculated values
    totalNotifications,
    urgentNotifications,
    pendingVendors,
    supportTickets,
    systemIssues,
    recentPayments,

    // Quick access to overview stats
    overview: dashboardStats?.data?.overview,
    pendingActions: dashboardStats?.data?.pendingActions,
    recentActivities: dashboardStats?.data?.recentActivities,
    quickStats: dashboardStats?.data?.quickStats,

    // Loading states
    isLoading: isLoadingStats || isLoadingNotifications,
    hasError: statsError || notificationsError,

    // Refresh functions
    refreshAll: () => {
      refetchStats();
      refetchNotifications();
    },
  };
};
