import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  MapPin,
  Eye,
  MessageSquare,
  Star,
  Loader2,
  ArrowRight,
} from 'lucide-react';
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
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  location?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  bidCount: number;
  assignedVendor?: {
    id: string;
    firstName: string;
    lastName: string;
    vendorProfile?: {
      rating?: number;
      companyName?: string;
    };
  };
}

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalBids: number;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['customerDashboard', user?.id],
    queryFn: () => customerAPI.getDashboard(user?.id || ''),
    enabled: !!user?.id,
  });

  // Fetch customer jobs
  const {
    data: jobsResponse = { success: false, data: [] },
    isLoading: jobsLoading,
    error: jobsError,
  } = useQuery({
    queryKey: ['customerJobs', user?.id],
    queryFn: () => customerAPI.getJobs(user?.id || ''),
    enabled: !!user?.id,
  });

  // Extract jobs array from response
  // Handle different API response structures:
  // Dashboard API: {success: true, data: {jobs: [...]}}
  // Jobs API: {success: true, data: [...]}
  let jobs: Job[] = [];

  if (jobsResponse?.success && jobsResponse?.data) {
    if (Array.isArray(jobsResponse.data)) {
      // Direct array response from jobs API
      jobs = jobsResponse.data;
    } else if (
      jobsResponse.data.jobs &&
      Array.isArray(jobsResponse.data.jobs)
    ) {
      // Nested jobs array from dashboard API
      jobs = jobsResponse.data.jobs;
    } else if (jobsResponse.data.jobs === 0) {
      // Empty jobs array
      jobs = [];
    }
  }

  // Debug logging
  console.log('🔍 Dashboard Jobs Response:', jobsResponse);
  console.log('🔍 Dashboard Jobs Array:', jobs);
  console.log('🔍 Dashboard Is Array:', Array.isArray(jobs));
  console.log('🔍 Dashboard Data Structure:', {
    success: jobsResponse?.success,
    dataType: typeof jobsResponse?.data,
    dataKeys: jobsResponse?.data ? Object.keys(jobsResponse.data) : [],
    jobsType: typeof jobs,
    jobsValue: jobs,
  });

  const stats: DashboardStats = {
    totalJobs: Array.isArray(jobs) ? jobs.length : 0,
    activeJobs: Array.isArray(jobs)
      ? jobs.filter(
          (job: Job) => job.status === 'OPEN' || job.status === 'IN_PROGRESS'
        ).length
      : 0,
    completedJobs: Array.isArray(jobs)
      ? jobs.filter((job: Job) => job.status === 'COMPLETED').length
      : 0,
    totalBids: Array.isArray(jobs)
      ? jobs.reduce((sum: number, job: Job) => sum + (job.bidCount || 0), 0)
      : 0,
  };

  const recentJobs = Array.isArray(jobs) ? jobs.slice(0, 5) : [];
  const openJobs = Array.isArray(jobs)
    ? jobs.filter((job: Job) => job.status === 'OPEN')
    : [];
  const inProgressJobs = Array.isArray(jobs)
    ? jobs.filter((job: Job) => job.status === 'IN_PROGRESS')
    : [];

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

  if (dashboardLoading || jobsLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading dashboard...</span>
      </div>
    );
  }

  if (dashboardError || jobsError) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>
            Error Loading Dashboard
          </h2>
          <p className='text-gray-600 mb-4'>
            Failed to load your dashboard data. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Check if jobs data is in expected format
  if (!Array.isArray(jobs)) {
    console.warn('⚠️ Jobs data is not an array:', jobs);
  }

  // Additional safety check - ensure all derived arrays are safe
  if (
    !Array.isArray(recentJobs) ||
    !Array.isArray(openJobs) ||
    !Array.isArray(inProgressJobs)
  ) {
    console.error('❌ Derived job arrays are not properly initialized');
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Data Format Error</h2>
          <p className='text-gray-600 mb-4'>
            There was an issue with the data format. Please refresh the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
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
            Welcome back, {user?.firstName}!
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Here's what's happening with your jobs and projects
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

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                <Briefcase className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Total Jobs
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg'>
                <Clock className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Active Jobs
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.activeJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
                <CheckCircle className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Completed
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.completedJobs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
                <MessageSquare className='h-6 w-6 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Total Bids
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalBids}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='jobs'>My Jobs</TabsTrigger>
          <TabsTrigger value='bids'>Bids</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Button
                  variant='outline'
                  className='h-24 flex-col space-y-2'
                  onClick={() => navigate('/customer/jobs/post')}
                >
                  <Plus className='h-8 w-8' />
                  <span>Post New Job</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-24 flex-col space-y-2'
                  onClick={() => navigate('/customer/jobs')}
                >
                  <Briefcase className='h-8 w-8' />
                  <span>View All Jobs</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your latest job postings</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className='text-center py-8'>
                  <Briefcase className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium mb-2'>No jobs yet</h3>
                  <p className='text-gray-600 dark:text-gray-400 mb-4'>
                    Get started by posting your first job
                  </p>
                  <Button onClick={() => navigate('/customer/jobs/post')}>
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {recentJobs.map((job: Job) => (
                    <div
                      key={job.id}
                      className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer'
                      onClick={() =>
                        navigate(`/customer/jobs/${job.id}/details`)
                      }
                    >
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <h4 className='font-medium text-gray-900 dark:text-white'>
                            {job.title}
                          </h4>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                          {job.category}
                          {job.subcategory && ` • ${job.subcategory}`}
                        </p>
                        <div className='flex items-center space-x-4 text-xs text-gray-500'>
                          <span className='flex items-center'>
                            <Calendar className='h-3 w-3 mr-1' />
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className='flex items-center'>
                            <Eye className='h-3 w-3 mr-1' />
                            {job.viewCount} views
                          </span>
                          <span className='flex items-center'>
                            <MessageSquare className='h-3 w-3 mr-1' />
                            {job.bidCount} bids
                          </span>
                        </div>
                      </div>
                      <ArrowRight className='h-5 w-5 text-gray-400' />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Status Summary */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Open Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                  <span>Open Jobs</span>
                </CardTitle>
                <CardDescription>Jobs waiting for vendor bids</CardDescription>
              </CardHeader>
              <CardContent>
                {openJobs.length === 0 ? (
                  <p className='text-gray-500 text-center py-4'>No open jobs</p>
                ) : (
                  <div className='space-y-3'>
                    {openJobs.slice(0, 3).map((job: Job) => (
                      <div
                        key={job.id}
                        className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                      >
                        <div>
                          <p className='font-medium text-sm'>{job.title}</p>
                          <p className='text-xs text-gray-500'>
                            {job.bidCount} bids • Posted{' '}
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            navigate(`/customer/jobs/${job.id}/details`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {openJobs.length > 3 && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full'
                        onClick={() => navigate('/customer/jobs')}
                      >
                        View All {openJobs.length} Open Jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In Progress Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                  <span>In Progress</span>
                </CardTitle>
                <CardDescription>
                  Jobs currently being worked on
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressJobs.length === 0 ? (
                  <p className='text-gray-500 text-center py-4'>
                    No jobs in progress
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {inProgressJobs.slice(0, 3).map((job: Job) => (
                      <div
                        key={job.id}
                        className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                      >
                        <div>
                          <p className='font-medium text-sm'>{job.title}</p>
                          <p className='text-xs text-gray-500'>
                            {job.assignedVendor
                              ? `Assigned to ${job.assignedVendor.firstName} ${job.assignedVendor.lastName}`
                              : 'Vendor assignment pending'}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            navigate(`/customer/jobs/${job.id}/details`)
                          }
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {inProgressJobs.length > 3 && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full'
                        onClick={() => navigate('/customer/jobs')}
                      >
                        View All {inProgressJobs.length} In Progress Jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value='jobs' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <div>
                  <CardTitle>All Jobs</CardTitle>
                  <CardDescription>
                    Manage and track all your job postings
                  </CardDescription>
                </div>
                <Button onClick={() => navigate('/customer/jobs')}>
                  View All Jobs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Array.isArray(jobs) && jobs.length > 0 ? (
                  jobs.map((job: Job) => (
                    <div
                      key={job.id}
                      className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer'
                      onClick={() =>
                        navigate(`/customer/jobs/${job.id}/details`)
                      }
                    >
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <h4 className='font-medium text-gray-900 dark:text-white'>
                            {job.title}
                          </h4>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                          {job.category}
                          {job.subcategory && ` • ${job.subcategory}`}
                        </p>
                        <div className='flex items-center space-x-4 text-xs text-gray-500'>
                          <span className='flex items-center'>
                            <Calendar className='h-3 w-3 mr-1' />
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className='flex items-center'>
                            <Eye className='h-3 w-3 mr-1' />
                            {job.viewCount} views
                          </span>
                          <span className='flex items-center'>
                            <MessageSquare className='h-3 w-3 mr-1' />
                            {job.bidCount} bids
                          </span>
                          {job.budget && (
                            <span className='flex items-center'>
                              <DollarSign className='h-3 w-3 mr-1' />$
                              {job.budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className='h-5 w-5 text-gray-400' />
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium mb-2'>No Jobs Found</h3>
                    <p className='text-gray-600 dark:text-gray-400 mb-4'>
                      You haven't posted any jobs yet. Get started by posting
                      your first job!
                    </p>
                    <Button onClick={() => navigate('/customer/jobs/post')}>
                      <Plus className='h-4 w-4 mr-2' />
                      Post Your First Job
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bids Tab */}
        <TabsContent value='bids' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Bids</CardTitle>
              <CardDescription>Latest bids on your jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8'>
                <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>Bid Management</h3>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>
                  View and manage bids on your jobs
                </p>
                <Button onClick={() => navigate('/customer/jobs')}>
                  View Jobs with Bids
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
