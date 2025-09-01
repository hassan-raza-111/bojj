import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '@/config/customerApi';
import { toast } from 'sonner';

export const useBidActions = (jobId: string | undefined, customerId: string | undefined) => {
  const queryClient = useQueryClient();

  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      if (!jobId || !customerId) {
        throw new Error('Job ID and Customer ID are required');
      }
      return customerAPI.acceptBid(jobId, bidId, customerId);
    },
    onSuccess: () => {
      toast.success('Bid accepted successfully!');
      // Invalidate and refetch job details
      queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId, customerId] });
    },
    onError: (error: any) => {
      console.error('Error accepting bid:', error);
      toast.error('Failed to accept bid');
    },
  });

  const rejectBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      if (!jobId || !customerId) {
        throw new Error('Job ID and Customer ID are required');
      }
      return customerAPI.rejectBid(jobId, bidId, customerId);
    },
    onSuccess: () => {
      toast.success('Bid rejected');
      // Invalidate and refetch job details
      queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId, customerId] });
    },
    onError: (error: any) => {
      console.error('Error rejecting bid:', error);
      toast.error('Failed to reject bid');
    },
  });

  return {
    acceptBid: acceptBidMutation.mutate,
    rejectBid: rejectBidMutation.mutate,
    isAccepting: acceptBidMutation.isPending,
    isRejecting: rejectBidMutation.isPending,
  };
};

