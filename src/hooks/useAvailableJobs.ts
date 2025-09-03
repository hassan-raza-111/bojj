import { useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorApi, AvailableJob } from '../config/vendorApi';

export interface JobFilters {
  category: string;
  location: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  budgetMin?: number;
  budgetMax?: number;
}

export interface JobFiltersData {
  categories: string[];
  locations: string[];
  budgetRanges: {
    min: number;
    max: number;
    ranges: Array<{
      label: string;
      min: number;
      max: number;
    }>;
  };
}

export const useAvailableJobs = (filters: JobFilters) => {
  const queryClient = useQueryClient();

  // Get available jobs with filters
  const availableJobs = useQuery({
    queryKey: ['vendor', 'jobs', 'available', filters],
    queryFn: async () => {
      console.log('🔍 Fetching available jobs with filters:', filters);

      // Build params object and filter out undefined values
      const params: any = {
        page: 1,
        limit: 20,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      // Only add filters if they have valid values
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.location && filters.location !== 'all') {
        params.location = filters.location;
      }
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.budgetMin && !isNaN(filters.budgetMin)) {
        params.budgetMin = filters.budgetMin;
      }
      if (filters.budgetMax && !isNaN(filters.budgetMax)) {
        params.budgetMax = filters.budgetMax;
      }

      console.log('🔍 Sending params to API:', params);
      const response = await vendorApi.getAvailableJobs(params);
      console.log('🔍 Available jobs response:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get available filters
  const availableFilters = useQuery({
    queryKey: ['vendor', 'jobs', 'filters'],
    queryFn: vendorApi.getAvailableFilters,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Refresh jobs data
  const refreshJobs = () => {
    queryClient.invalidateQueries({
      queryKey: ['vendor', 'jobs', 'available'],
    });
  };

  // Refresh filters data
  const refreshFilters = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor', 'jobs', 'filters'] });
  };

  return {
    // Queries
    availableJobs,
    availableFilters,

    // Functions
    refreshJobs,
    refreshFilters,

    // Loading states
    isLoading: availableJobs.isLoading || availableFilters.isLoading,
    isError: availableJobs.isError || availableFilters.isError,

    // Data
    jobs: availableJobs.data?.data?.jobs || [],
    pagination: availableJobs.data?.data?.pagination,
    filters: availableFilters.data?.data,
  };
};
