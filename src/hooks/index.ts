// Main React Query hooks - Clean and organized
export * from './useApiHooks';
export * from './useVendorBids';

// Utility hooks for common patterns
export * from './useQueryUtils';

// Re-export React Query core hooks for convenience
export {
  useQueryClient,
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueries,
} from '@tanstack/react-query';

// Export API service for direct use if needed
export { apiService } from '../services/api';
