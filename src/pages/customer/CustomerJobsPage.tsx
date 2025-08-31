import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import customerAPI from '@/config/customerApi';
import { formatDistanceToNow, format } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  budgetType: string;
  location?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timeline?: string;
  date?: string;
  time?: string;
  additionalRequests?: string;
  contactPreference?: string;
  images: string[];
  tags: string[];
  requirements: string[];
  estimatedDuration?: string;
  urgency?: string;
  customerRating?: number;
  customerFeedback?: string;
  completionDate?: string;
  viewCount: number;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
  assignedVendor?: {
    id: string;
    firstName: string;
    lastName: string;
    vendorProfile?: {
      rating?: number;
      companyName?: string;
    };
  };
  bids?: Array<{
    id: string;
    amount: number;
    description: string;
    timeline: string;
    status: string;
    vendor: {
      id: string;
      firstName: string;
      lastName: string;
      vendorProfile?: {
        rating?: number;
        companyName?: string;
      };
    };
    createdAt: string;
  }>;
}

const CustomerJobsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch customer jobs
  const {
    data: jobsResponse = { success: false, data: [] },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customerJobs', user?.id],
    queryFn: () => customerAPI.getJobs(user?.id || ''),
    enabled: !!user?.id,
  });

  // Extract jobs array from response
  const jobs = jobsResponse?.data || [];

  // Debug logging
  console.log('🔍 Jobs Response:', jobsResponse);
  console.log('🔍 Jobs Array:', jobs);
  console.log('🔍 Is Array:', Array.isArray(jobs));

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => customerAPI.deleteJob(jobId),
    onSuccess: () => {
      toast({
        title: 'Job Deleted',
        description: 'Job has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['customerJobs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete job.',
        variant: 'destructive',
      });
    },
  });

  // Filter and sort jobs with additional safety checks
  const filteredJobs = Array.isArray(jobs)
    ? jobs
        .filter((job: Job) => {
          // Safety check for job object
          if (!job || typeof job !== 'object') return false;

          const matchesSearch =
            (job.title?.toLowerCase() || '').includes(
              searchTerm.toLowerCase()
            ) ||
            (job.description?.toLowerCase() || '').includes(
              searchTerm.toLowerCase()
            ) ||
            (job.category?.toLowerCase() || '').includes(
              searchTerm.toLowerCase()
            );

          const matchesStatus =
            statusFilter === 'ALL' || job.status === statusFilter;
          const matchesCategory =
            categoryFilter === 'ALL' || job.category === categoryFilter;

          return matchesSearch && matchesStatus && matchesCategory;
        })
        .sort((a: Job, b: Job) => {
          // Safety check for sort values
          if (!a || !b) return 0;

          let aValue: any = a[sortBy as keyof Job];
          let bValue: any = b[sortBy as keyof Job];

          if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aValue = new Date(aValue || 0).getTime();
            bValue = new Date(bValue || 0).getTime();
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        })
    : [];

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Error Loading Jobs</h2>
          <p className='text-gray-600 mb-4'>
            Failed to load your jobs. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Check if jobs data is in expected format
  if (!jobsResponse?.success || !Array.isArray(jobs)) {
    console.warn('⚠️ Jobs data format issue:', {
      success: jobsResponse?.success,
      isArray: Array.isArray(jobs),
      data: jobs,
    });
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>No Jobs Found</h2>
          <p className='text-gray-600 mb-4'>
            {jobsResponse?.message ||
              'No jobs available or API response format is unexpected.'}
          </p>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            My Jobs
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Manage and track all your posted jobs
          </p>
        </div>
        <Button
          onClick={() => navigate('/customer/jobs/post')}
          className='w-full sm:w-auto'
        >
          <Plus className='h-4 w-4 mr-2' />
          Post New Job
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search jobs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Statuses</SelectItem>
                <SelectItem value='OPEN'>Open</SelectItem>
                <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                <SelectItem value='DISPUTED'>Disputed</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Categories</SelectItem>
                <SelectItem value='Home Maintenance and Repairs'>
                  Home Maintenance
                </SelectItem>
                <SelectItem value='Cleaning Services'>
                  Cleaning Services
                </SelectItem>
                <SelectItem value='Landscaping and Outdoor Services'>
                  Landscaping
                </SelectItem>
                <SelectItem value='Other Services'>Other Services</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='createdAt'>Date Posted</SelectItem>
                <SelectItem value='budget'>Budget</SelectItem>
                <SelectItem value='title'>Title</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredJobs.map((job: Job) => (
          <Card key={job.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <CardTitle className='text-lg font-semibold line-clamp-2'>
                    {job.title}
                  </CardTitle>
                  <CardDescription className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                    {job.category}
                    {job.subcategory && ` • ${job.subcategory}`}
                  </CardDescription>
                </div>
                <div className='flex items-center space-x-2'>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(job.priority)}>
                    {job.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className='pb-3'>
              <p className='text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4'>
                {job.description}
              </p>

              <div className='space-y-2 text-sm'>
                {job.budget && (
                  <div className='flex items-center text-gray-600 dark:text-gray-400'>
                    <DollarSign className='h-4 w-4 mr-2' />
                    <span>${job.budget.toLocaleString()}</span>
                  </div>
                )}

                {job.location && (
                  <div className='flex items-center text-gray-600 dark:text-gray-400'>
                    <MapPin className='h-4 w-4 mr-2' />
                    <span className='line-clamp-1'>{job.location}</span>
                  </div>
                )}

                {job.timeline && (
                  <div className='flex items-center text-gray-600 dark:text-gray-400'>
                    <Clock className='h-4 w-4 mr-2' />
                    <span>{job.timeline}</span>
                  </div>
                )}

                <div className='flex items-center text-gray-600 dark:text-gray-400'>
                  <Calendar className='h-4 w-4 mr-2' />
                  <span>
                    Posted{' '}
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700'>
                <div className='flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='flex items-center'>
                    <Eye className='h-4 w-4 mr-1' />
                    <span>{job.viewCount}</span>
                  </div>
                  <div className='flex items-center'>
                    <MessageSquare className='h-4 w-4 mr-1' />
                    <span>{job.bidCount} bids</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className='pt-3'>
              <div className='flex w-full space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1'
                  onClick={() => navigate(`/customer/jobs/${job.id}`)}
                >
                  View Details
                </Button>

                {job.status === 'OPEN' && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => navigate(`/customer/jobs/${job.id}/edit`)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                )}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleDeleteJob(job.id)}
                  disabled={deleteJobMutation.isPending}
                >
                  {deleteJobMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2 className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className='text-center py-12'>
          <div className='mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
            <AlertCircle className='h-12 w-12 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            No jobs found
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'Try adjusting your filters or search terms.'
              : "You haven't posted any jobs yet. Get started by posting your first job!"}
          </p>
          {!searchTerm &&
            statusFilter === 'ALL' &&
            categoryFilter === 'ALL' && (
              <Button onClick={() => navigate('/customer/jobs/post')}>
                <Plus className='h-4 w-4 mr-2' />
                Post Your First Job
              </Button>
            )}
        </div>
      )}

      {/* Stats Summary */}
      {filteredJobs.length > 0 && (
        <Card className='mt-8'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
              <div>
                <div className='text-2xl font-bold text-blue-600'>
                  {filteredJobs.filter((j) => j.status === 'OPEN').length}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Open Jobs
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-yellow-600'>
                  {
                    filteredJobs.filter((j) => j.status === 'IN_PROGRESS')
                      .length
                  }
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  In Progress
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-green-600'>
                  {filteredJobs.filter((j) => j.status === 'COMPLETED').length}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Completed
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-600'>
                  {filteredJobs.reduce(
                    (sum, job) => sum + (job.bidCount || 0),
                    0
                  )}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Total Bids
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerJobsPage;
