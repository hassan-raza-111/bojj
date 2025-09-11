import { useQuery } from '@tanstack/react-query';
import { customerAPI } from '@/config/customerApi';

interface Bid {
  id: string;
  amount: number;
  description: string;
  timeline: string;
  status: string;
  createdAt: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    vendorProfile?: {
      rating: number;
      completedJobs: number;
      experience: number;
      skills: string[];
    };
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: string;
  location: string;
  status: string;
  createdAt: string;
  bids: Bid[];
}

export const useJobDetails = (jobId: string | undefined, customerId: string | undefined) => {
  return useQuery({
    queryKey: ['jobDetails', jobId, customerId],
    queryFn: async (): Promise<Job> => {
      if (!jobId || !customerId) {
        throw new Error('Job ID and Customer ID are required');
      }

      console.log('🔍 useJobDetails: Fetching job details...');
      console.log('Job ID:', jobId);
      console.log('Customer ID:', customerId);

      const response = await customerAPI.getJobDetails(jobId, customerId);
      
      console.log('📥 useJobDetails: API Response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch job details');
      }

      return response.data.job;
    },
    enabled: !!jobId && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

