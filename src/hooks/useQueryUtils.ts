import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

// Utility hook for handling loading states
export const useQueryWithLoading = <TData, TError>(
  queryResult: UseQueryResult<TData, TError>
) => {
  const { data, error, isLoading, isError, isSuccess, isFetching } =
    queryResult;

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    // Convenience properties
    hasData: !!data,
    hasError: !!error,
    isIdle: !isLoading && !isError && !isSuccess,
  };
};

// Utility hook for pagination
export const usePaginatedQuery = <TData>(
  queryKey: any[],
  queryFn: (page: number, limit: number) => Promise<TData>,
  page: number = 1,
  limit: number = 10,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    keepPreviousData: true, // Keep previous data while fetching new page
    ...options,
  });
};

// Utility hook for infinite queries (for infinite scroll)
export const useInfiniteQuery = <TData>(
  queryKey: any[],
  queryFn: (pageParam: number) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKey, 'infinite'],
    queryFn: () => queryFn(1), // Start with page 1
    ...options,
  });
};

// Utility hook for conditional queries
export const useConditionalQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  enabled: boolean,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn' | 'enabled'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    ...options,
  });
};

// Utility hook for optimistic updates
export const useOptimisticQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  optimisticData: TData,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    initialData: optimisticData,
    ...options,
  });
};

// Utility hook for background refetching
export const useBackgroundQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...options,
  });
};

// Utility hook for real-time data (frequent refetching)
export const useRealTimeQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  refetchInterval: number = 5000, // 5 seconds
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval,
    refetchIntervalInBackground: true,
    ...options,
  });
};

// Utility hook for search queries with debouncing
export const useSearchQuery = <TData>(
  queryKey: any[],
  queryFn: (searchTerm: string) => Promise<TData>,
  searchTerm: string,
  debounceMs: number = 300,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKey, searchTerm],
    queryFn: () => queryFn(searchTerm),
    enabled: searchTerm.length > 0,
    ...options,
  });
};

// Utility hook for form data queries
export const useFormQuery = <TData>(
  queryKey: any[],
  queryFn: (formData: any) => Promise<TData>,
  formData: any,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKey, formData],
    queryFn: () => queryFn(formData),
    enabled: !!formData,
    ...options,
  });
};

// Utility hook for dependent queries
export const useDependentQuery = <TData, TDependency>(
  queryKey: any[],
  queryFn: (dependency: TDependency) => Promise<TData>,
  dependency: TDependency | null | undefined,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn' | 'enabled'>
) => {
  return useQuery({
    queryKey: [...queryKey, dependency],
    queryFn: () => queryFn(dependency!),
    enabled: !!dependency,
    ...options,
  });
};

// Utility hook for retry logic
export const useRetryQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  retryCount: number = 3,
  retryDelay: number = 1000,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    retry: retryCount,
    retryDelay,
    ...options,
  });
};

// Utility hook for stale time management
export const useStaleQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  staleTime: number = 5 * 60 * 1000, // 5 minutes
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime,
    ...options,
  });
};

// Utility hook for garbage collection management
export const useGarbageCollectedQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  gcTime: number = 10 * 60 * 1000, // 10 minutes
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey,
    queryFn,
    gcTime,
    ...options,
  });
};
