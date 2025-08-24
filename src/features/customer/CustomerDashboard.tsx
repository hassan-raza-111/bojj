import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  MessageSquare,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Calendar,
  Star,
} from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { useAuth } from '@/hooks/useAuth';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { jobs, stats, loading, error, fetchDashboard } = useCustomer();
  const { user } = useAuth();

  // Get jobs by status
  const activeJobs = jobs.filter(
    (job) => job.status === 'OPEN' || job.status === 'IN_PROGRESS'
  );
  const completedJobs = jobs.filter((job) => job.status === 'COMPLETED');
  const allJobs = [...activeJobs, ...completedJobs];

  // Format budget for display
  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'DISPUTED':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Open for Bids';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'DISPUTED':
        return 'Disputed';
      default:
        return status;
    }
  };

  const dashboardContent = (
    <div className='space-y-8'>
      {/* Welcome Banner */}
      <Card className='border-0 shadow-lg bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50'>
        <CardContent className='p-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-center'>
            <div className='md:col-span-2'>
              <h2 className='text-2xl font-bold text-gray-900 mb-3'>
                🚀 Ready to get started?
              </h2>
              <p className='text-gray-600 text-base mb-6'>
                Post your first job and connect with qualified vendors in your
                area. Our platform makes it easy to find the right person for
                any task.
              </p>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Link to='/customer/jobs/new'>
                  <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Post Your First Job
                  </Button>
                </Link>
                <Link to='/customer/support'>
                  <Button
                    variant='outline'
                    className='hover:border-purple-300 hover:text-purple-600 transition-colors'
                  >
                    <AlertCircle className='mr-2 h-4 w-4' />
                    Get Help
                  </Button>
                </Link>
              </div>
            </div>
            <div className='flex justify-center md:justify-end'>
              <div className='relative'>
                <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center'>
                  <Briefcase className='w-12 h-12 sm:w-16 sm:h-16 text-purple-600' />
                </div>
                <div className='absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center'>
                  <CheckCircle className='w-5 h-5 text-white' />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-16'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4'></div>
            <p className='text-gray-600 text-lg'>Loading your dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100'>
                <AlertCircle className='h-5 w-5 text-red-600' />
              </div>
              <div className='flex-1'>
                <p className='font-medium text-red-800 text-base'>{error}</p>
                <p className='text-sm text-red-600 mt-1'>
                  There was an issue loading your dashboard data
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchDashboard}
                className='border-red-200 text-red-700 hover:bg-red-100'
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg'>
                <Briefcase className='h-6 w-6' />
              </div>
              <TrendingUp className='h-5 w-5 text-blue-600' />
            </div>
            <CardTitle className='text-lg font-semibold text-blue-900'>
              Total Jobs
            </CardTitle>
            <CardDescription className='text-blue-700'>
              All your posted jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-blue-900'>
              {stats?.totalJobs || jobs.length}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg'>
                <TrendingUp className='h-6 w-6' />
              </div>
              <Clock className='h-5 w-5 text-emerald-600' />
            </div>
            <CardTitle className='text-lg font-semibold text-emerald-900'>
              Active Jobs
            </CardTitle>
            <CardDescription className='text-emerald-700'>
              Currently open for bids
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-emerald-900'>
              {stats?.activeJobs || activeJobs.length}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg'>
                <Users className='h-6 w-6' />
              </div>
              <MessageSquare className='h-5 w-5 text-purple-600' />
            </div>
            <CardTitle className='text-lg font-semibold text-purple-900'>
              Total Bids
            </CardTitle>
            <CardDescription className='text-purple-700'>
              Across all your jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-purple-900'>
              {stats?.totalBids || 0}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg'>
                <CheckCircle className='h-6 w-6' />
              </div>
              <Star className='h-5 w-5 text-indigo-600' />
            </div>
            <CardTitle className='text-lg font-semibold text-indigo-900'>
              Completed Jobs
            </CardTitle>
            <CardDescription className='text-indigo-700'>
              Successfully finished
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold text-indigo-900'>
              {stats?.completedJobs || completedJobs.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List with Tabs */}
      <Tabs
        defaultValue='overview'
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100 p-1 rounded-xl'>
          <TabsTrigger
            value='overview'
            className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 px-4 py-2'
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value='active'
            className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 px-4 py-2'
          >
            Active Jobs
          </TabsTrigger>
          <TabsTrigger
            value='completed'
            className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 px-4 py-2'
          >
            Completed Jobs
          </TabsTrigger>
          <TabsTrigger
            value='all'
            className='data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 px-4 py-2'
          >
            All Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-6'>
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Left Column - Recent Active Jobs */}
            <div className='xl:col-span-2'>
              <Card className='border-0 shadow-lg h-full'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white'>
                      <Clock className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>
                        Recent Active Jobs
                      </CardTitle>
                      <CardDescription>
                        Your latest job postings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeJobs.length === 0 ? (
                    <div className='text-center py-8'>
                      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4'>
                        <Briefcase className='h-8 w-8 text-gray-400' />
                      </div>
                      <p className='text-gray-500 text-base mb-4'>
                        No active jobs found
                      </p>
                      <Link to='/customer/jobs/new'>
                        <Button
                          size='sm'
                          className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                        >
                          <PlusCircle className='mr-2 h-4 w-4' />
                          Post First Job
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {activeJobs.slice(0, 4).map((job) => (
                        <div
                          key={job.id}
                          className='group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-gray-50'
                        >
                          <div className='flex justify-between items-start mb-3'>
                            <h4 className='font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-base line-clamp-1'>
                              {job.title}
                            </h4>
                            <Badge
                              variant='outline'
                              className={`${getStatusBadge(
                                job.status
                              )} text-xs`}
                            >
                              {getStatusText(job.status)}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                            {job.description}
                          </p>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-900 font-medium'>
                              {formatBudget(job.budget)}
                            </span>
                            <span className='text-gray-500 flex items-center gap-1'>
                              <MessageSquare className='h-4 w-4' />
                              {job._count?.bids || 0} bids
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions & Stats */}
            <div className='space-y-6'>
              {/* Quick Actions */}
              <Card className='border-0 shadow-lg'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
                      <PlusCircle className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>Quick Actions</CardTitle>
                      <CardDescription>Get things done faster</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <Link to='/customer/jobs/new'>
                      <Button className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                        <PlusCircle className='mr-2 h-4 w-4' />
                        Post New Job
                      </Button>
                    </Link>
                    <Link to='/customer/messages'>
                      <Button
                        variant='outline'
                        className='w-full hover:border-purple-300 hover:text-purple-600 transition-colors'
                      >
                        <MessageSquare className='mr-2 h-4 w-4' />
                        View Messages
                      </Button>
                    </Link>
                    <Link to='/customer/payments'>
                      <Button
                        variant='outline'
                        className='w-full hover:border-purple-300 hover:text-purple-600 transition-colors'
                      >
                        <DollarSign className='mr-2 h-4 w-4' />
                        Payment History
                      </Button>
                    </Link>
                    <Link to='/customer/support'>
                      <Button
                        variant='outline'
                        className='w-full hover:border-purple-300 hover:text-purple-600 transition-colors'
                      >
                        <AlertCircle className='mr-2 h-4 w-4' />
                        Get Support
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card className='border-0 shadow-lg'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white'>
                      <TrendingUp className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>Performance</CardTitle>
                      <CardDescription>Your platform activity</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                        <span className='text-sm font-medium'>
                          Job Success Rate
                        </span>
                      </div>
                      <span className='text-lg font-bold text-blue-600'>
                        {completedJobs.length > 0
                          ? Math.round(
                              (completedJobs.length / allJobs.length) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-emerald-500'></div>
                        <span className='text-sm font-medium'>
                          Avg. Response Time
                        </span>
                      </div>
                      <span className='text-lg font-bold text-emerald-600'>
                        {activeJobs.length > 0 ? '2.4h' : 'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-3 rounded-lg bg-gray-50'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-purple-500'></div>
                        <span className='text-sm font-medium'>Total Spent</span>
                      </div>
                      <span className='text-lg font-bold text-purple-600'>
                        {formatBudget(
                          completedJobs.reduce(
                            (sum, job) => sum + job.budget,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Completed Jobs */}
              <Card className='border-0 shadow-lg'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white'>
                      <CheckCircle className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>
                        Recent Completed
                      </CardTitle>
                      <CardDescription>
                        Successfully finished projects
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {completedJobs.length === 0 ? (
                    <div className='text-center py-6'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3'>
                        <CheckCircle className='h-5 w-5 text-gray-400' />
                      </div>
                      <p className='text-gray-500 text-sm'>
                        No completed jobs yet
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {completedJobs.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          className='group p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-indigo-50'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1'>
                              {job.title}
                            </h4>
                            <Badge
                              variant='outline'
                              className='bg-indigo-50 text-indigo-700 border-indigo-200 text-xs'
                            >
                              Completed
                            </Badge>
                          </div>
                          <div className='flex justify-between items-center text-xs'>
                            <span className='text-gray-900 font-medium'>
                              {formatBudget(job.budget)}
                            </span>
                            <span className='text-gray-500'>
                              {formatDate(job.updatedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='active' className='mt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {activeJobs.length === 0 ? (
              <div className='col-span-1 md:col-span-2 text-center py-16'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-6'>
                  <Briefcase className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                  No Active Jobs
                </h3>
                <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                  You haven't posted any jobs yet. Start by creating your first
                  job posting to get bids from qualified vendors.
                </p>
                <Link to='/customer/jobs/new'>
                  <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                    <PlusCircle className='mr-2 h-5 w-5' />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              activeJobs.map((job) => (
                <Card
                  key={job.id}
                  className='border-0 shadow-lg group hover:shadow-xl transition-all duration-200'
                >
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-xl group-hover:text-purple-600 transition-colors line-clamp-2'>
                          {job.title}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-2 text-gray-500'>
                          <Calendar className='h-4 w-4' />
                          <span className='text-sm'>
                            Posted {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className={`${getStatusBadge(job.status)} text-xs`}
                      >
                        {getStatusText(job.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className='text-gray-600 mb-6 line-clamp-3'>
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4 mb-6'>
                      <div className='p-3 rounded-lg bg-gray-50'>
                        <p className='text-sm text-gray-500 mb-1'>Budget</p>
                        <p className='font-semibold text-emerald-600 text-base'>
                          {formatBudget(job.budget)}
                        </p>
                      </div>
                      <div className='p-3 rounded-lg bg-gray-50'>
                        <p className='text-sm text-gray-500 mb-1'>
                          Bids Received
                        </p>
                        <p className='font-semibold text-blue-600 text-base'>
                          {job._count?.bids || 0}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3'>
                      <Link to={`/customer/jobs/${job.id}`} className='flex-1'>
                        <Button
                          variant='outline'
                          className='w-full group-hover:border-purple-300 group-hover:text-purple-600 transition-colors'
                        >
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/customer/jobs/${job.id}/bids`}
                        className='flex-1'
                      >
                        <Button className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                          Review Bids ({job._count?.bids || 0})
                          <ArrowRight className='ml-2 h-4 w-4' />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='completed' className='mt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {completedJobs.length === 0 ? (
              <div className='col-span-1 md:col-span-2 text-center py-16'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-6'>
                  <CheckCircle className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                  No Completed Jobs
                </h3>
                <p className='text-gray-600 max-w-md mx-auto'>
                  Your completed jobs will appear here once you finish working
                  with vendors.
                </p>
              </div>
            ) : (
              completedJobs.map((job) => (
                <Card
                  key={job.id}
                  className='border-0 shadow-lg group hover:shadow-xl transition-all duration-200'
                >
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-xl group-hover:text-purple-600 transition-colors line-clamp-2'>
                          {job.title}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-2 text-gray-500'>
                          <Calendar className='h-4 w-4' />
                          <span className='text-sm'>
                            Completed {formatDate(job.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className={`${getStatusBadge(job.status)} text-xs`}
                      >
                        {getStatusText(job.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className='text-gray-600 mb-6 line-clamp-3'>
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4 mb-6'>
                      <div className='p-3 rounded-lg bg-gray-50'>
                        <p className='text-sm text-gray-500 mb-1'>Budget</p>
                        <p className='font-semibold text-emerald-600 text-base'>
                          {formatBudget(job.budget)}
                        </p>
                      </div>
                      {job.assignedVendor && (
                        <div className='p-3 rounded-lg bg-gray-50'>
                          <p className='text-sm text-gray-500 mb-1'>Vendor</p>
                          <p className='font-semibold text-blue-600 text-base'>
                            {job.assignedVendor.firstName}{' '}
                            {job.assignedVendor.lastName}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link to={`/customer/jobs/${job.id}`}>
                      <Button
                        variant='outline'
                        className='w-full group-hover:border-purple-300 group-hover:text-purple-600 transition-colors'
                      >
                        View Details
                        <ArrowRight className='ml-2 h-4 w-4' />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='all' className='mt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {allJobs.length === 0 ? (
              <div className='col-span-1 md:col-span-2 text-center py-16'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-6'>
                  <Briefcase className='h-10 w-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                  No Jobs Found
                </h3>
                <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                  Start by posting your first job to connect with qualified
                  vendors in your area.
                </p>
                <Link to='/customer/jobs/new'>
                  <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                    <PlusCircle className='mr-2 h-5 w-5' />
                    Post New Job
                  </Button>
                </Link>
              </div>
            ) : (
              allJobs.map((job) => (
                <Card
                  key={job.id}
                  className='border-0 shadow-lg group hover:shadow-xl transition-all duration-200'
                >
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-xl group-hover:text-purple-600 transition-colors line-clamp-2'>
                          {job.title}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-2 text-gray-500'>
                          <Calendar className='h-4 w-4' />
                          <span className='text-sm'>
                            {job.status === 'COMPLETED'
                              ? `Completed ${formatDate(job.updatedAt)}`
                              : `Posted ${formatDate(job.createdAt)}`}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className={`${getStatusBadge(job.status)} text-xs`}
                      >
                        {getStatusText(job.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className='text-gray-600 mb-6 line-clamp-3'>
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4 mb-6'>
                      <div className='p-3 rounded-lg bg-gray-50'>
                        <p className='text-sm text-gray-500 mb-1'>Budget</p>
                        <p className='font-semibold text-emerald-600 text-base'>
                          {formatBudget(job.budget)}
                        </p>
                      </div>
                      <div className='p-3 rounded-lg bg-gray-50'>
                        <p className='text-sm text-gray-500 mb-1'>Bids</p>
                        <p className='font-semibold text-blue-600 text-base'>
                          {job._count?.bids || 0}
                        </p>
                      </div>
                    </div>

                    <Link to={`/customer/jobs/${job.id}`}>
                      <Button
                        variant='outline'
                        className='w-full group-hover:border-purple-300 group-hover:text-purple-600 transition-colors'
                      >
                        View Details
                        <ArrowRight className='ml-2 h-4 w-4' />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity & Tips Section */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* Recent Activity */}
        <div className='xl:col-span-2'>
          <Card className='border-0 shadow-lg'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
                  <Clock className='h-5 w-5' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates on your jobs and bids
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 text-base'>No recent activity</p>
                </div>
              ) : (
                <ul className='space-y-4'>
                  {activeJobs.slice(0, 3).map((job) => (
                    <li
                      key={job.id}
                      className='flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 flex-shrink-0'>
                        <Briefcase className='h-5 w-5 text-purple-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-900 text-base'>
                          Job "{job.title}" is active
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                          {job._count?.bids || 0} bids received • Posted{' '}
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                  {completedJobs.slice(0, 2).map((job) => (
                    <li
                      key={job.id}
                      className='flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0'>
                        <CheckCircle className='h-5 w-5 text-emerald-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-900 text-base'>
                          Job "{job.title}" completed
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                          Completed on {formatDate(job.updatedAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips & Help Section */}
        <div>
          <Card className='border-0 shadow-lg'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white'>
                  <Star className='h-5 w-5' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Tips & Help</CardTitle>
                  <CardDescription>Make the most of BOJJ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='p-3 rounded-lg bg-amber-50 border border-amber-200'>
                  <h4 className='font-medium text-amber-800 text-sm mb-2'>
                    💡 Getting Started
                  </h4>
                  <p className='text-amber-700 text-xs'>
                    Post your first job with a clear description and budget to
                    attract quality vendors.
                  </p>
                </div>

                <div className='p-3 rounded-lg bg-blue-50 border border-blue-200'>
                  <h4 className='font-medium text-blue-800 text-sm mb-2'>
                    🎯 Best Practices
                  </h4>
                  <p className='text-blue-700 text-xs'>
                    Review vendor profiles and ratings before selecting.
                    Communication is key!
                  </p>
                </div>

                <div className='p-3 rounded-lg bg-emerald-50 border border-emerald-200'>
                  <h4 className='font-medium text-emerald-800 text-sm mb-2'>
                    🔒 Secure Payments
                  </h4>
                  <p className='text-emerald-700 text-xs'>
                    All payments are secured through our platform. Pay only when
                    satisfied.
                  </p>
                </div>

                <div className='p-3 rounded-lg bg-purple-50 border border-purple-200'>
                  <h4 className='font-medium text-purple-800 text-sm mb-2'>
                    📞 Need Help?
                  </h4>
                  <p className='text-purple-700 text-xs'>
                    Our support team is available 24/7. Don't hesitate to reach
                    out!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return dashboardContent;
};

export default CustomerDashboard;
