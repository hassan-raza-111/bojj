import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import customerAPI from '@/config/customerApi';
import { useToast } from '@/components/ui/use-toast';

// Types
interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: number;
  location?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  customerId: string;
  assignedVendorId?: string;
  createdAt: string;
  updatedAt: string;
  bids?: Bid[];
  _count?: { bids: number };
  assignedVendor?: {
    id: string;
    firstName: string;
    lastName: string;
    vendorProfile?: {
      rating?: number;
      companyName?: string;
    };
  };
  analytics?: {
    timeToFirstBid?: number;
    totalBidCount?: number;
    averageBidAmount?: number;
    uniqueViewers?: number;
  };
  estimatedDuration?: string;
  urgency?: string;
  customerRating?: number;
  customerFeedback?: string;
  completionDate?: string;
}

interface Bid {
  id: string;
  amount: number;
  description: string;
  timeline: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  vendorId: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  createdAt: string;
}

interface CustomerStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalBids: number;
  totalSpent: number;
  pendingPayments: number;
}

interface PerformanceMetrics {
  averageResponseTime: string;
  jobSuccessRate: number;
  averageJobRating: number;
  budgetEfficiency: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  status: string;
  updatedAt: string;
  bids: number;
  payments: number;
}

interface TopCategory {
  category: string;
  count: number;
}

interface BudgetUtilization {
  totalBudget: number;
  averageBudget: number;
  spentPercentage: number;
}

interface JobAnalytics {
  bidStats: {
    total: number;
    average: number;
    lowest: number;
    highest: number;
    accepted: number;
    pending: number;
  };
  engagementMetrics: {
    viewCount: number;
    savedCount: number;
    shareCount: number;
    responseTime: string;
  };
  performanceMetrics: {
    timeToCompletion: string;
    customerSatisfaction: number;
    rehireLikelihood: number;
    budgetEfficiency: number;
  };
}

interface CustomerContextType {
  // State
  jobs: Job[];
  stats: CustomerStats | null;
  performance: PerformanceMetrics | null;
  recentActivity: RecentActivity[];
  topCategories: TopCategory[];
  budgetUtilization: BudgetUtilization | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  createJob: (jobData: any) => Promise<Job | null>;
  updateJob: (jobId: string, jobData: any) => Promise<Job | null>;
  deleteJob: (jobId: string) => Promise<boolean>;
  fetchJobBids: (jobId: string) => Promise<Bid[]>;
  acceptBid: (jobId: string, bidId: string) => Promise<boolean>;
  rejectBid: (jobId: string, bidId: string) => Promise<boolean>;
  fetchJobAnalytics: (jobId: string) => Promise<JobAnalytics | null>;

  // Utilities
  getJobById: (jobId: string) => Job | undefined;
  getActiveJobs: () => Job[];
  getCompletedJobs: () => Job[];
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(
    null
  );
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [budgetUtilization, setBudgetUtilization] =
    useState<BudgetUtilization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id) {
      console.log('User not authenticated or not customer:', {
        isAuthenticated,
        role: user?.role,
        userId: user?.id,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching dashboard for customer:', user.id);
      const response = await customerAPI.getDashboard(user.id);

      if (response.success) {
        console.log('Dashboard response:', response);
        setStats(response.data.stats);
        setJobs(response.data.recentJobs || []);
        setPerformance(response.data.performance || null);
        setRecentActivity(response.data.recentActivity || []);
        setTopCategories(response.data.topCategories || []);
        setBudgetUtilization(response.data.budgetUtilization || null);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      const errorMessage = err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.role]);

  // Fetch all customer jobs
  const fetchJobs = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id) {
      console.log('User not authenticated or not customer:', {
        isAuthenticated,
        role: user?.role,
        userId: user?.id,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching jobs for customer:', user.id);
      const response = await customerAPI.getJobs(user.id);

      if (response.success) {
        console.log('Jobs response:', response);
        setJobs(response.data.jobs || []);
      } else {
        throw new Error(response.message || 'Failed to fetch jobs');
      }
    } catch (err: any) {
      console.error('Jobs fetch error:', err);
      const errorMessage = err.message || 'Failed to fetch jobs';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.role]);

  // Create new job
  const createJob = async (jobData: any): Promise<Job | null> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await customerAPI.createJob({
        ...jobData,
        customerId: user.id,
      });

      if (response.success) {
        const newJob = response.data.job;
        setJobs((prev) => [newJob, ...prev]);

        toast({
          title: 'Success',
          description: 'Job posted successfully!',
        });

        return newJob;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create job',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update job
  const updateJob = async (
    jobId: string,
    jobData: any
  ): Promise<Job | null> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await customerAPI.updateJob(jobId, jobData);

      if (response.success) {
        const updatedJob = response.data.job;
        setJobs((prev) =>
          prev.map((job) => (job.id === jobId ? updatedJob : job))
        );

        toast({
          title: 'Success',
          description: 'Job updated successfully!',
        });

        return updatedJob;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to update job');
      toast({
        title: 'Error',
        description: err.message || 'Failed to update job',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete job
  const deleteJob = async (jobId: string): Promise<boolean> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id)
      return false;

    try {
      setLoading(true);
      setError(null);

      const response = await customerAPI.deleteJob(jobId);

      if (response.success) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));

        toast({
          title: 'Success',
          description: 'Job deleted successfully!',
        });

        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete job',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch job bids
  const fetchJobBids = async (jobId: string): Promise<Bid[]> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id) return [];

    try {
      const response = await customerAPI.getJobBids(jobId);
      if (response.success) {
        return response.data.bids || [];
      }
      return [];
    } catch (err: any) {
      console.error('Failed to fetch job bids:', err);
      return [];
    }
  };

  // Accept bid
  const acceptBid = async (jobId: string, bidId: string): Promise<boolean> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id)
      return false;

    try {
      const response = await customerAPI.acceptBid(jobId, bidId);

      if (response.success) {
        // Update job status and assigned vendor
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'IN_PROGRESS',
                  assignedVendorId: response.data.vendorId,
                }
              : job
          )
        );

        toast({
          title: 'Success',
          description: 'Bid accepted successfully!',
        });

        return true;
      }
      return false;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept bid',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Reject bid
  const rejectBid = async (jobId: string, bidId: string): Promise<boolean> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id)
      return false;

    try {
      const response = await customerAPI.rejectBid(jobId, bidId);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Bid rejected successfully!',
        });

        return true;
      }
      return false;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to reject bid',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Utility functions
  const getJobById = (jobId: string): Job | undefined => {
    return jobs.find((job) => job.id === jobId);
  };

  const getActiveJobs = (): Job[] => {
    return jobs.filter(
      (job) => job.status === 'OPEN' || job.status === 'IN_PROGRESS'
    );
  };

  const getCompletedJobs = (): Job[] => {
    return jobs.filter((job) => job.status === 'COMPLETED');
  };

  // Fetch job analytics
  const fetchJobAnalytics = async (
    jobId: string
  ): Promise<JobAnalytics | null> => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER' || !user?.id) return null;

    try {
      const response = await customerAPI.getJobAnalytics(jobId);

      if (response.success) {
        return response.data.analytics;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching job analytics:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch job analytics',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Auto-fetch dashboard when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER' && user?.id) {
      console.log('Auto-fetching dashboard for user:', user.id);
      fetchDashboard();
    }
  }, [isAuthenticated, user?.id, user?.role, fetchDashboard]);

  const value: CustomerContextType = {
    // State
    jobs,
    stats,
    performance,
    recentActivity,
    topCategories,
    budgetUtilization,
    loading,
    error,

    // Actions
    fetchDashboard,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    fetchJobBids,
    acceptBid,
    rejectBid,
    fetchJobAnalytics,

    // Utilities
    getJobById,
    getActiveJobs,
    getCompletedJobs,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerProvider;
