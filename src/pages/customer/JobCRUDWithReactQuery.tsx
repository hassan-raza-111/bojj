import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { useCustomerJobs, useDeleteJob } from '../../hooks/useApi';
import { useQueryWithLoading } from '../../hooks/useQueryUtils';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export interface JobData {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  budget: string;
  timeline: string;
  date: string;
  time: string;
  additionalRequests: string;
  contactPreference: string;
  status: string;
  postedDate: string;
  completedDate?: string;
  finalCost?: string;
  vendor?: string;
  bidsCount?: number;
  unreadMessages?: number;
  company?: string;
  serviceCategory: string;
  serviceType: string;
}

const JobCRUDWithReactQuery = () => {
  const [search, setSearch] = useState('');

  // React Query hooks
  const { data: jobs = [], isLoading, error, refetch } = useCustomerJobs();

  const deleteJob = useDeleteJob();

  // Utility hook for better loading state management
  const jobsWithLoading = useQueryWithLoading({
    data: jobs,
    isLoading,
    error,
    isError: !!error,
    isSuccess: true,
    isFetching: false,
  });

  // Handle job deletion
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJob.mutate(id, {
        onSuccess: () => {
          toast.success('Job deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete job: ${error.message}`);
        },
      });
    }
  };

  // Filter jobs based on search
  const filteredJobs = jobs.filter((job: JobData) => {
    const q = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.category.toLowerCase().includes(q) ||
      job.city.toLowerCase().includes(q) ||
      (job.company && job.company.toLowerCase().includes(q))
    );
  });

  // Loading state
  if (jobsWithLoading.isLoading) {
    return (
      <div className='w-full flex items-center justify-center py-12'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Loading jobs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (jobsWithLoading.isError) {
    return (
      <div className='w-full flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>Failed to load jobs</p>
          <p className='text-gray-600 mb-4'>{error?.message}</p>
          <Button onClick={() => refetch()} variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const jobContent = (
    <div className='w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Jobs</h2>
        <div className='flex gap-2'>
          <Button
            onClick={() => refetch()}
            variant='outline'
            disabled={jobsWithLoading.isLoading}
            className='flex items-center gap-2'
          >
            <RefreshCw
              className={`h-4 w-4 ${
                jobsWithLoading.isLoading ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
          <Link to='/customer/jobs/new'>
            <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-colors flex items-center gap-2'>
              <Plus className='h-4 w-4' /> Add a Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className='mb-4 flex items-center justify-between gap-2'>
        <input
          type='text'
          placeholder='Search jobs by title, type, location, or company...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full max-w-md px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bojj-primary'
        />
        <div className='text-sm text-gray-500'>
          {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Jobs Table */}
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service Category</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-center text-gray-500 py-8'
                >
                  {search
                    ? 'No jobs found matching your search.'
                    : 'No jobs found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job: JobData) => (
                <TableRow key={job.id}>
                  <TableCell className='font-medium'>{job.title}</TableCell>
                  <TableCell>{job.category}</TableCell>
                  <TableCell>
                    {job.city}, {job.state}
                  </TableCell>
                  <TableCell>{job.company || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === 'completed' ? 'default' : 'secondary'
                      }
                      className='capitalize'
                    >
                      {job.status === 'completed' ? 'Completed' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.status === 'completed'
                      ? job.completedDate
                      : job.postedDate}
                  </TableCell>
                  <TableCell>{job.serviceCategory}</TableCell>
                  <TableCell>{job.serviceType}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Link to={`/customer/jobs/${job.id}/edit`}>
                        <Button size='icon' variant='ghost' title='Edit'>
                          <Pencil className='h-4 w-4' />
                        </Button>
                      </Link>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteJob.isPending}
                        title='Delete'
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mutation Status */}
      {deleteJob.isPending && (
        <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
          <p className='text-blue-700 text-sm'>Deleting job...</p>
        </div>
      )}

      {deleteJob.isSuccess && (
        <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-md'>
          <p className='text-green-700 text-sm'>Job deleted successfully!</p>
        </div>
      )}

      {deleteJob.error && (
        <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700 text-sm'>
            Error: {deleteJob.error.message}
          </p>
        </div>
      )}
    </div>
  );

  return jobContent;
};

export default JobCRUDWithReactQuery;
