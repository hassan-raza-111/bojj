import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCustomers,
  getCustomerStats,
  getCustomerDetails,
  toggleCustomerStatus,
  bulkUpdateCustomerStatus,
  bulkDeleteCustomers,
  getCustomersBySpending,
  exportCustomers,
  Customer,
  CustomerStats,
  CustomerDetails,
} from '@/config/adminApi';
import { useToast } from '@/hooks/use-toast';

export interface CustomerFilters {
  search: string;
  status: string;
  spending: string;
  page: number;
  limit: number;
}

export const useCustomerManagement = () => {
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    spending: 'all',
    page: 1,
    limit: 10,
  });

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Customer statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['customerStats'],
    queryFn: getCustomerStats,
  });

  // All customers with filters
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () =>
      getAllCustomers(
        filters.search,
        filters.status,
        filters.page,
        filters.limit
      ),
    enabled: filters.status !== 'high-value' && filters.spending === 'all',
  });

  // High value customers
  const {
    data: highValueCustomersData,
    isLoading: highValueLoading,
    error: highValueError,
  } = useQuery({
    queryKey: ['highValueCustomers', filters.page, filters.limit],
    queryFn: () => getCustomersBySpending('high', filters.page, filters.limit),
    enabled: filters.status === 'high-value',
  });

  // Active customers
  const {
    data: activeCustomersData,
    isLoading: activeLoading,
    error: activeError,
  } = useQuery({
    queryKey: ['activeCustomers', filters.page, filters.limit],
    queryFn: () => getAllCustomers('', 'ACTIVE', filters.page, filters.limit),
    enabled: filters.status === 'active',
  });

  // Suspended customers
  const {
    data: suspendedCustomersData,
    isLoading: suspendedLoading,
    error: suspendedError,
  } = useQuery({
    queryKey: ['suspendedCustomers', filters.page, filters.limit],
    queryFn: () =>
      getAllCustomers('', 'SUSPENDED', filters.page, filters.limit),
    enabled: filters.status === 'suspended',
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (filters.status) {
      case 'high-value':
        return highValueCustomersData;
      case 'active':
        return activeCustomersData;
      case 'suspended':
        return suspendedCustomersData;
      default:
        return customersData;
    }
  };

  const getCurrentLoading = () => {
    switch (filters.status) {
      case 'high-value':
        return highValueLoading;
      case 'active':
        return activeLoading;
      case 'suspended':
        return suspendedLoading;
      default:
        return customersLoading;
    }
  };

  const getCurrentError = () => {
    switch (filters.status) {
      case 'high-value':
        return highValueError;
      case 'active':
        return activeError;
      case 'suspended':
        return suspendedError;
      default:
        return customersError;
    }
  };

  // Toggle customer status
  const toggleStatusMutation = useMutation({
    mutationFn: ({
      customerId,
      status,
      reason,
    }: {
      customerId: string;
      status: string;
      reason?: string;
    }) => toggleCustomerStatus(customerId, status, reason),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Customer status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update customer status',
        variant: 'destructive',
      });
    },
  });

  // Bulk update customer status
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      customerIds,
      status,
      reason,
    }: {
      customerIds: string[];
      status: string;
      reason?: string;
    }) => bulkUpdateCustomerStatus(customerIds, status, reason),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Customer statuses updated successfully',
      });
      setSelectedCustomers([]);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update customer statuses',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete customers
  const bulkDeleteMutation = useMutation({
    mutationFn: ({
      customerIds,
      reason,
    }: {
      customerIds: string[];
      reason?: string;
    }) => bulkDeleteCustomers(customerIds, reason),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Customers deleted successfully',
      });
      setSelectedCustomers([]);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete customers',
        variant: 'destructive',
      });
    },
  });

  // Export customers
  const exportCustomersMutation = useMutation({
    mutationFn: ({
      format,
      status,
      spending,
      search,
    }: {
      format: 'csv' | 'json';
      status?: string;
      spending?: string;
      search?: string;
    }) => exportCustomers(format, status, spending, search),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.${
        variables.format
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Customers exported successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to export customers',
        variant: 'destructive',
      });
    },
  });

  // Update filters
  const updateFilters = (newFilters: Partial<CustomerFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle search
  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    updateFilters({ status });
  };

  // Handle spending filter
  const handleSpendingFilter = (spending: string) => {
    updateFilters({ spending });
  };

  // Toggle customer selection
  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Select all customers on current page
  const selectAllCustomers = () => {
    const currentData = getCurrentData();
    if (currentData?.data) {
      const allIds = currentData.data.map((customer) => customer.id);
      setSelectedCustomers(allIds);
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  // Get current customers and pagination
  const currentData = getCurrentData();
  const customers = currentData?.data || [];
  const pagination = currentData?.pagination;

  return {
    // Data
    customers,
    stats: stats?.data,
    pagination,

    // Loading states
    statsLoading,
    customersLoading: getCurrentLoading(),

    // Errors
    statsError,
    customersError: getCurrentError(),

    // Filters and state
    filters,
    selectedCustomers,

    // Actions
    updateFilters,
    handlePageChange,
    handleSearch,
    handleStatusFilter,
    handleSpendingFilter,
    toggleCustomerSelection,
    selectAllCustomers,
    clearSelection,

    // Mutations
    toggleStatusMutation,
    bulkUpdateStatusMutation,
    bulkDeleteMutation,
    exportCustomersMutation,
  };
};
