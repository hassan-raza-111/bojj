import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi, VendorBid } from '../config/vendorApi';
import { toast } from 'sonner';

export const useVendorBids = () => {
  const queryClient = useQueryClient();

  // Get all bids with filtering
  const getAllBids = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    return useQuery({
      queryKey: ['vendor', 'bids', 'all', params],
      queryFn: () => vendorApi.getAllBids(params),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get bid details
  const getBidDetails = (bidId: string) => {
    return useQuery({
      queryKey: ['vendor', 'bid', bidId],
      queryFn: () => vendorApi.getBidDetails(bidId),
      enabled: !!bidId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Update bid mutation
  const updateBidMutation = useMutation({
    mutationFn: ({
      bidId,
      bidData,
    }: {
      bidId: string;
      bidData: {
        amount?: number;
        description?: string;
        timeline?: string;
        notes?: string;
        milestones?: any;
      };
    }) => vendorApi.updateBid(bidId, bidData),
    onSuccess: () => {
      toast.success('Bid updated successfully!');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendor', 'bids'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update bid');
    },
  });

  // Withdraw bid mutation
  const withdrawBidMutation = useMutation({
    mutationFn: (bidId: string) => vendorApi.withdrawBid(bidId),
    onSuccess: () => {
      toast.success('Bid withdrawn successfully!');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendor', 'bids'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to withdraw bid');
    },
  });

  // Refresh all bid data
  const refreshBids = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor', 'bids'] });
  };

  return {
    // Queries
    getAllBids,
    getBidDetails,

    // Mutations
    updateBid: updateBidMutation.mutate,
    updateBidLoading: updateBidMutation.isPending,
    withdrawBid: withdrawBidMutation.mutate,
    withdrawBidLoading: withdrawBidMutation.isPending,

    // Functions
    refreshBids,

    // Loading states
    isLoading: updateBidMutation.isPending || withdrawBidMutation.isPending,
    isError: updateBidMutation.isError || withdrawBidMutation.isError,
  };
};
