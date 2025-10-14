# React Query (TanStack Query) Implementation Guide

This guide explains how to use React Query in your venbid project for efficient API state management.

## Overview

React Query provides powerful tools for managing server state in React applications. It handles:

- Caching and background updates
- Loading and error states
- Optimistic updates
- Automatic refetching
- Synchronization across components

## Setup

The React Query provider is already configured in `src/main.tsx` with the following defaults:

- **Stale Time**: 5 minutes (data considered fresh for 5 minutes)
- **GC Time**: 10 minutes (cached data kept for 10 minutes)
- **Retry**: 1 attempt for failed requests
- **Refetch on Window Focus**: Disabled

## Available Hooks

### Authentication Hooks

```typescript
import {
  useAuthProfile,
  useLogin,
  useRegister,
  useUpdateProfile,
  useChangePassword,
  useLogout,
} from '../hooks/useApi';

// Get user profile
const { data: profile, isLoading, error } = useAuthProfile();

// Login
const login = useLogin();
login.mutate({ email: 'user@example.com', password: 'password' });

// Logout
const logout = useLogout();
logout.mutate();
```

### Jobs Hooks

```typescript
import {
  useJobs,
  useOpenJobs,
  useJobById,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  usePlaceBid,
  useAcceptBid,
  useRejectBid,
} from '../hooks/useApi';

// Get all jobs
const { data: jobs, isLoading, error } = useJobs();

// Get open jobs only
const { data: openJobs } = useOpenJobs();

// Get specific job
const { data: job } = useJobById(jobId);

// Create job
const createJob = useCreateJob();
createJob.mutate(jobData);

// Update job
const updateJob = useUpdateJob();
updateJob.mutate({ id: jobId, jobData: updates });

// Delete job
const deleteJob = useDeleteJob();
deleteJob.mutate(jobId);

// Place bid
const placeBid = usePlaceBid();
placeBid.mutate({ jobId, bidData });

// Accept/Reject bid
const acceptBid = useAcceptBid();
const rejectBid = useRejectBid();
```

### Users Hooks

```typescript
import {
  useUsers,
  useUserById,
  useUserStats,
  useUpdateUser,
  useDeleteUser,
} from '../hooks/useApi';

// Get all users
const { data: users } = useUsers();

// Get specific user
const { data: user } = useUserById(userId);

// Get user statistics
const { data: stats } = useUserStats(userId);
```

### Services Hooks

```typescript
import {
  useServices,
  useServiceById,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../hooks/useApi';

// Get all services
const { data: services } = useServices();

// Create service
const createService = useCreateService();
createService.mutate(serviceData);
```

### Payments Hooks

```typescript
import {
  usePayments,
  usePaymentById,
  useCreatePayment,
  useReleasePayment,
  useRefundPayment,
} from '../hooks/useApi';

// Get all payments
const { data: payments } = usePayments();

// Release payment
const releasePayment = useReleasePayment();
releasePayment.mutate(paymentId);
```

### Support Hooks

```typescript
import {
  useSupportTickets,
  useSupportTicketById,
  useCreateTicket,
  useUpdateTicket,
  useAdminTickets,
  useAdminStats,
} from '../hooks/useApi';

// Get support tickets
const { data: tickets } = useSupportTickets();

// Create ticket
const createTicket = useCreateTicket();
createTicket.mutate(ticketData);
```

### Dashboard Hooks

```typescript
import {
  useCustomerDashboard,
  useVendorDashboard,
  useAdminDashboard,
} from '../hooks/useApi';

// Get dashboard data based on user role
const { data: dashboardData } = useCustomerDashboard();
const { data: vendorData } = useVendorDashboard();
const { data: adminData } = useAdminDashboard();
```

## Utility Hooks

### Loading State Management

```typescript
import { useQueryWithLoading } from '../hooks/useQueryUtils';

const jobs = useJobs();
const jobsWithLoading = useQueryWithLoading(jobs);

// Now you have convenient properties:
// jobsWithLoading.isLoading, jobsWithLoading.hasData, jobsWithLoading.isIdle
```

### Pagination

```typescript
import { usePaginatedQuery } from '../hooks/useQueryUtils';

const { data, isLoading } = usePaginatedQuery(
  ['jobs', 'paginated'],
  (page, limit) => fetchJobs(page, limit),
  1, // current page
  10 // items per page
);
```

### Conditional Queries

```typescript
import { useConditionalQuery } from '../hooks/useQueryUtils';

const { data } = useConditionalQuery(
  ['user', userId],
  () => fetchUser(userId),
  !!userId // only run when userId exists
);
```

### Real-time Updates

```typescript
import { useRealTimeQuery } from '../hooks/useQueryUtils';

const { data } = useRealTimeQuery(
  ['jobs', 'realtime'],
  fetchJobs,
  5000 // refetch every 5 seconds
);
```

## Query Keys

Query keys are used for cache management and invalidation:

```typescript
import { queryKeys } from '../hooks/useApi';

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.byId(jobId) });

// Invalidate related queries
queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
```

## Best Practices

### 1. Use Query Keys Consistently

```typescript
// Good: Consistent structure
queryKeys.jobs.byId(jobId);
queryKeys.users.byId(userId)[
  // Bad: Inconsistent structure
  ('jobs', jobId)
][('user', userId)];
```

### 2. Handle Loading and Error States

```typescript
const { data, isLoading, error, isError } = useJobs();

if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error.message}</div>;
if (!data) return <div>No data</div>;

return <div>{/* Render data */}</div>;
```

### 3. Use Mutations with Success Callbacks

```typescript
const createJob = useCreateJob();

createJob.mutate(jobData, {
  onSuccess: (data) => {
    // Handle success
    toast.success('Job created successfully!');
    // Navigate or update UI
  },
  onError: (error) => {
    // Handle error
    toast.error('Failed to create job');
  },
});
```

### 4. Optimize with Stale Time

```typescript
// For data that doesn't change frequently
const { data } = useQuery({
  queryKey: ['user', 'profile'],
  queryFn: fetchUserProfile,
  staleTime: 10 * 60 * 1000, // 10 minutes
});
```

### 5. Use Background Refetching

```typescript
// For real-time data
const { data } = useQuery({
  queryKey: ['jobs', 'realtime'],
  queryFn: fetchJobs,
  refetchInterval: 30000, // 30 seconds
  refetchIntervalInBackground: true,
});
```

## Error Handling

React Query provides built-in error handling:

```typescript
const { data, error, isError } = useJobs();

if (isError) {
  return (
    <div className="error-container">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={() => refetch()}>Try again</button>
    </div>
  );
}
```

## Cache Management

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Clear all cache
queryClient.clear();

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: ['jobs'] });

// Set query data manually
queryClient.setQueryData(['jobs', jobId], updatedJob);
```

## Performance Tips

1. **Use `enabled` option** for dependent queries
2. **Implement proper error boundaries** for error handling
3. **Use `keepPreviousData`** for pagination to avoid loading states
4. **Implement optimistic updates** for better UX
5. **Use `refetchOnWindowFocus: false`** for less critical data

## Example Component

See `src/components/examples/ReactQueryExample.tsx` for a complete example of how to use React Query in your components.

## Troubleshooting

### Common Issues

1. **Queries not refetching**: Check if `enabled` is set correctly
2. **Cache not updating**: Ensure query keys are consistent
3. **Infinite loops**: Check for circular dependencies in query keys
4. **Memory leaks**: Use proper `gcTime` settings

### Debug Tools

React Query DevTools are enabled in development mode. Use them to:

- Inspect cache state
- Monitor query performance
- Debug query keys
- Test query invalidation

## Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query Examples](https://tanstack.com/query/latest/docs/react/examples/react-basic)
- [Query Key Factory](https://tanstack.com/query/latest/docs/react/guides/query-key-factory)
