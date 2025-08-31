import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi, VendorDashboardSummary, AvailableJob, ActiveBid, AwardedJob, VendorEarnings, BidSubmission } from '../config/vendorApi';
import { toast } from 'sonner';

export const useVendorDashboard = () => {
  const queryClient = useQueryClient();

  // Dashboard summary
  const dashboardSummary = useQuery({
    queryKey: ['vendor', 'dashboard', 'summary'],
    queryFn: vendorApi.getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Available jobs
  const availableJobs = useQuery({
    queryKey: ['vendor', 'jobs', 'available'],
    queryFn: () => vendorApi.getAvailableJobs(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Active bids
  const activeBids = useQuery({
    queryKey: ['vendor', 'bids', 'active'],
    queryFn: () => vendorApi.getActiveBids(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Awarded jobs
  const awardedJobs = useQuery({
    queryKey: ['vendor', 'jobs', 'awarded'],
    queryFn: () => vendorApi.getAwardedJobs(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Earnings
  const earnings = useQuery({
    queryKey: ['vendor', 'earnings'],
    queryFn: () => vendorApi.getEarnings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit bid mutation
  const submitBidMutation = useMutation({
    mutationFn: vendorApi.submitBid,
    onSuccess: () => {
      toast.success('Bid submitted successfully!');
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendor', 'bids', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'jobs', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'dashboard', 'summary'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit bid');
    },
  });

  // Get job details
  const getJobDetails = (jobId: string) => {
    return useQuery({
      queryKey: ['vendor', 'job', jobId],
      queryFn: () => vendorApi.getJobDetails(jobId),
      enabled: !!jobId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Refresh all data
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor'] });
  };

  return {
    // Queries
    dashboardSummary,
    availableJobs,
    activeBids,
    awardedJobs,
    earnings,
    
    // Mutations
    submitBid: submitBidMutation.mutate,
    submitBidLoading: submitBidMutation.isPending,
    
    // Functions
    getJobDetails,
    refreshAll,
    
    // Loading states
    isLoading: dashboardSummary.isLoading || availableJobs.isLoading || activeBids.isLoading || awardedJobs.isLoading,
    isError: dashboardSummary.isError || availableJobs.isError || activeBids.isError || awardedJobs.isError,
  };
};
