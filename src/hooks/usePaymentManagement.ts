import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllPayments,
  getPaymentStats,
  updatePaymentStatus,
  exportPayments,
  Payment,
  PaymentStats,
} from '@/config/adminApi';

export interface PaymentFilters {
  status: string;
  type: string;
  search: string;
}

export const usePaymentManagement = () => {
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    type: 'all',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch payment statistics
  const {
    data: paymentStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['paymentStats'],
    queryFn: getPaymentStats,
  });

  // Fetch payments with filters and pagination
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ['payments', filters, page, limit],
    queryFn: () => getAllPayments(filters.status, filters.type, page, limit),
    keepPreviousData: true,
  });

  // Update payment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      paymentId,
      status,
      reason,
    }: {
      paymentId: string;
      status: string;
      reason?: string;
    }) => updatePaymentStatus(paymentId, status, reason),
    onSuccess: () => {
      toast.success('Payment status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStats'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update payment status');
    },
  });

  // Export payments mutation
  const exportMutation = useMutation({
    mutationFn: ({
      format,
      status,
      type,
    }: {
      format: 'csv' | 'json';
      status?: string;
      type?: string;
    }) => exportPayments(format, status, type),
    onSuccess: () => {
      toast.success('Payments exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export payments');
    },
  });

  // Update filters
  const updateFilters = (newFilters: Partial<PaymentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  // Update page
  const updatePage = (newPage: number) => {
    setPage(newPage);
  };

  // Toggle payment selection
  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  // Select all payments on current page
  const selectAllPayments = () => {
    if (paymentsData?.data?.payments) {
      const currentPagePaymentIds = paymentsData.data.payments.map((p) => p.id);
      setSelectedPayments((prev) => {
        const newSelection = [...prev];
        currentPagePaymentIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Deselect all payments on current page
  const deselectAllPayments = () => {
    if (paymentsData?.data?.payments) {
      const currentPagePaymentIds = paymentsData.data.payments.map((p) => p.id);
      setSelectedPayments((prev) =>
        prev.filter((id) => !currentPagePaymentIds.includes(id))
      );
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedPayments([]);
  };

  // Update payment status
  const updatePaymentStatus = async (
    paymentId: string,
    status: string,
    reason?: string
  ) => {
    updateStatusMutation.mutate({ paymentId, status, reason });
  };

  // Export payments
  const exportPaymentsData = async (format: 'csv' | 'json' = 'csv') => {
    exportMutation.mutate({
      format,
      status: filters.status !== 'all' ? filters.status : undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
    });
  };

  // Get filtered payments
  const filteredPayments = paymentsData?.data?.payments || [];
  const totalPayments = paymentsData?.data?.pagination?.total || 0;
  const totalPages = paymentsData?.data?.pagination?.totalPages || 0;

  return {
    // Data
    payments: filteredPayments,
    paymentStats,
    pagination: {
      page,
      limit,
      total: totalPayments,
      totalPages,
    },
    filters,
    selectedPayments,

    // Loading states
    isLoading: paymentsLoading || statsLoading,
    isUpdating: updateStatusMutation.isLoading,
    isExporting: exportMutation.isLoading,

    // Error states
    error: paymentsError || statsError,

    // Actions
    updateFilters,
    updatePage,
    togglePaymentSelection,
    selectAllPayments,
    deselectAllPayments,
    clearSelection,
    updatePaymentStatus,
    exportPaymentsData,

    // Computed values
    hasSelectedPayments: selectedPayments.length > 0,
    selectedPaymentsCount: selectedPayments.length,
  };
};
