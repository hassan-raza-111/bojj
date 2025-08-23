import { useState, useEffect } from 'react';
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
  Loader2,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Star,
} from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { useAuth } from '@/hooks/useAuth';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { jobs, stats, loading, error, fetchDashboard, fetchJobs } =
    useCustomer();
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

  // Data is automatically fetched in CustomerContext when component mounts
  // No need for additional useEffect hooks here

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20'>
      {/* Header */}
      <div className='py-6 sm:py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex-1'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight'>
              Welcome back, {user?.firstName || 'Customer'}! 👋
            </h1>
            <p className='text-base sm:text-lg text-muted-foreground mt-2 sm:mt-3'>
              Here's what's happening with your jobs today
            </p>
          </div>
          <div className='flex-shrink-0'>
            <Link to='/customer/jobs/new'>
              <Button className='w-full sm:w-auto bg-gradient-to-r from-bojj-primary to-bojj-secondary hover:from-bojj-primary/90 hover:to-bojj-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3'>
                <PlusCircle className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-16 sm:py-20 lg:py-24'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-bojj-primary border-t-transparent mx-auto mb-4'></div>
            <p className='text-muted-foreground text-base sm:text-lg'>
              Loading your dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8'>
          <Card className='border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'>
            <CardContent className='pt-4 sm:pt-6'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 flex-shrink-0'>
                  <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-red-800 dark:text-red-200 text-sm sm:text-base'>
                    {error}
                  </p>
                  <p className='text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1'>
                    There was an issue loading your dashboard data
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={fetchDashboard}
                  className='border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 w-full sm:w-auto'
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Cards */}
      <div className='px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          <Card className='card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20'>
            <CardHeader className='pb-3 px-4 sm:px-6'>
              <div className='flex items-center justify-between'>
                <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'>
                  <Briefcase className='h-5 w-5 sm:h-6 sm:w-6' />
                </div>
                <TrendingUp className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <CardTitle className='text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100'>
                Total Jobs
              </CardTitle>
              <CardDescription className='text-sm text-blue-700 dark:text-blue-300'>
                All your posted jobs
              </CardDescription>
            </CardHeader>
            <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <p className='text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100'>
                {stats?.totalJobs || jobs.length}
              </p>
            </CardContent>
          </Card>

          <Card className='card-hover border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20'>
            <CardHeader className='pb-3 px-4 sm:px-6'>
              <div className='flex items-center justify-between'>
                <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg'>
                  <TrendingUp className='h-5 w-5 sm:h-6 sm:w-6' />
                </div>
                <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <CardTitle className='text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100'>
                Active Jobs
              </CardTitle>
              <CardDescription className='text-sm text-emerald-700 dark:text-emerald-300'>
                Currently open for bids
              </CardDescription>
            </CardHeader>
            <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <p className='text-2xl sm:text-3xl font-bold text-emerald-900 dark:text-emerald-100'>
                {stats?.activeJobs || activeJobs.length}
              </p>
            </CardContent>
          </Card>

          <Card className='card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20'>
            <CardHeader className='pb-3 px-4 sm:px-6'>
              <div className='flex items-center justify-between'>
                <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'>
                  <Users className='h-5 w-5 sm:h-6 sm:w-6' />
                </div>
                <MessageSquare className='h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <CardTitle className='text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100'>
                Total Bids
              </CardTitle>
              <CardDescription className='text-sm text-purple-700 dark:text-purple-300'>
                Across all your jobs
              </CardDescription>
            </CardHeader>
            <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <p className='text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100'>
                {stats?.totalBids || 0}
              </p>
            </CardContent>
          </Card>

          <Card className='card-hover border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20'>
            <CardHeader className='pb-3 px-4 sm:px-6'>
              <div className='flex items-center justify-between'>
                <div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg'>
                  <CheckCircle className='h-5 w-5 sm:h-6 sm:w-6' />
                </div>
                <Star className='h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400' />
              </div>
              <CardTitle className='text-base sm:text-lg font-semibold text-indigo-900 dark:text-indigo-100'>
                Completed Jobs
              </CardTitle>
              <CardDescription className='text-sm text-indigo-700 dark:text-indigo-300'>
                Successfully finished
              </CardDescription>
            </CardHeader>
            <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <p className='text-2xl sm:text-3xl font-bold text-indigo-900 dark:text-indigo-100'>
                {stats?.completedJobs || completedJobs.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Jobs List with Tabs */}
      <Tabs
        defaultValue='overview'
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50 p-1 rounded-xl mb-6 sm:mb-8'>
          <TabsTrigger
            value='overview'
            className='data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4 py-2'
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value='active'
            className='data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4 py-2'
          >
            Active Jobs
          </TabsTrigger>
          <TabsTrigger
            value='completed'
            className='data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4 py-2'
          >
            Completed Jobs
          </TabsTrigger>
          <TabsTrigger
            value='all'
            className='data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4 py-2'
          >
            All Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='mt-0'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
            {/* Recent Active Jobs */}
            <Card className='card-hover border-0 shadow-lg'>
              <CardHeader className='pb-4 px-4 sm:px-6'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'>
                    <Clock className='h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg sm:text-xl'>
                      Recent Active Jobs
                    </CardTitle>
                    <CardDescription className='text-sm'>
                      Your latest job postings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
                {activeJobs.length === 0 ? (
                  <div className='text-center py-8'>
                    <div className='flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4'>
                      <Briefcase className='h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground' />
                    </div>
                    <p className='text-muted-foreground text-sm sm:text-base'>
                      No active jobs found
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3 sm:space-y-4'>
                    {activeJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className='group p-3 sm:p-4 rounded-xl border border-border/50 hover:border-bojj-primary/30 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-muted/30 to-muted/10'
                      >
                        <div className='flex justify-between items-start mb-2 sm:mb-3'>
                          <h4 className='font-semibold text-foreground group-hover:text-bojj-primary transition-colors text-sm sm:text-base line-clamp-1'>
                            {job.title}
                          </h4>
                          <Badge
                            variant='outline'
                            className={`${getStatusBadge(job.status)} text-xs`}
                          >
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2'>
                          {job.description}
                        </p>
                        <div className='flex justify-between items-center text-xs sm:text-sm'>
                          <span className='text-foreground font-medium'>
                            {formatBudget(job.budget)}
                          </span>
                          <span className='text-muted-foreground flex items-center gap-1'>
                            <MessageSquare className='h-3 w-3 sm:h-4 sm:w-4' />
                            {job._count?.bids || 0} bids
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Completed Jobs */}
            <Card className='card-hover border-0 shadow-lg'>
              <CardHeader className='pb-4 px-4 sm:px-6'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'>
                    <CheckCircle className='h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg sm:text-xl'>
                      Recent Completed Jobs
                    </CardTitle>
                    <CardDescription className='text-sm'>
                      Successfully finished projects
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
                {completedJobs.length === 0 ? (
                  <div className='text-center py-8'>
                    <div className='flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4'>
                      <CheckCircle className='h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground' />
                    </div>
                    <p className='text-muted-foreground text-sm sm:text-base'>
                      No completed jobs found
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3 sm:space-y-4'>
                    {completedJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className='group p-3 sm:p-4 rounded-xl border border-border/50 hover:border-bojj-primary/30 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-muted/30 to-muted/10'
                      >
                        <div className='flex justify-between items-start mb-2 sm:mb-3'>
                          <h4 className='font-semibold text-foreground group-hover:text-bojj-primary transition-colors text-sm sm:text-base line-clamp-1'>
                            {job.title}
                          </h4>
                          <Badge
                            variant='outline'
                            className={`${getStatusBadge(job.status)} text-xs`}
                          >
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2'>
                          {job.description}
                        </p>
                        <div className='flex justify-between items-center text-xs sm:text-sm'>
                          <span className='text-foreground font-medium'>
                            {formatBudget(job.budget)}
                          </span>
                          {job.assignedVendor && (
                            <span className='text-muted-foreground flex items-center gap-1'>
                              <Users className='h-3 w-3 sm:h-4 sm:w-4' />
                              {job.assignedVendor.firstName}{' '}
                              {job.assignedVendor.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='active' className='mt-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
            {activeJobs.length === 0 ? (
              <div className='col-span-1 md:col-span-2 text-center py-12 sm:py-16'>
                <div className='flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted mx-auto mb-4 sm:mb-6'>
                  <Briefcase className='h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground' />
                </div>
                <h3 className='text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3'>
                  No Active Jobs
                </h3>
                <p className='text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base'>
                  You haven't posted any jobs yet. Start by creating your first
                  job posting to get bids from qualified vendors.
                </p>
                <Link to='/customer/jobs/new'>
                  <Button className='bg-gradient-to-r from-bojj-primary to-bojj-secondary hover:from-bojj-primary/90 hover:to-bojj-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5'>
                    <PlusCircle className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              activeJobs.map((job) => (
                <Card
                  key={job.id}
                  className='card-hover border-0 shadow-lg group'
                >
                  <CardHeader className='pb-4 px-4 sm:px-6'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-lg sm:text-xl group-hover:text-bojj-primary transition-colors line-clamp-2'>
                          {job.title}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-2 text-muted-foreground'>
                          <Calendar className='h-3 w-3 sm:h-4 sm:w-4' />
                          <span className='text-xs sm:text-sm'>
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

                  <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
                    <p className='text-muted-foreground mb-4 sm:mb-6 line-clamp-3 text-sm sm:text-base'>
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6'>
                      <div className='p-2 sm:p-3 rounded-lg bg-muted/50'>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                          Budget
                        </p>
                        <p className='font-semibold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base'>
                          {formatBudget(job.budget)}
                        </p>
                      </div>
                      <div className='p-2 sm:p-3 rounded-lg bg-muted/50'>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                          Bids Received
                        </p>
                        <p className='font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base'>
                          {job._count?.bids || 0}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                      <Link to={`/customer/jobs/${job.id}`} className='flex-1'>
                        <Button
                          variant='outline'
                          className='w-full group-hover:border-bojj-primary/30 group-hover:text-bojj-primary transition-colors text-sm'
                        >
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/customer/jobs/${job.id}/bids`}
                        className='flex-1'
                      >
                        <Button className='w-full bg-gradient-to-r from-bojj-primary to-bojj-secondary hover:from-bojj-primary/90 hover:to-bojj-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm'>
                          Review Bids ({job._count?.bids || 0})
                          <ArrowRight className='ml-2 h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='completed' className='mt-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
            {completedJobs.length === 0 ? (
              <div className='col-span-1 md:col-span-2 text-center py-12 sm:py-16'>
                <div className='flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted mx-auto mb-4 sm:mb-6'>
                  <CheckCircle className='h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground' />
                </div>
                <h3 className='text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3'>
                  No Completed Jobs
                </h3>
                <p className='text-muted-foreground max-w-md mx-auto text-sm sm:text-base'>
                  Your completed jobs will appear here once you finish working
                  with vendors.
                </p>
              </div>
            ) : (
              completedJobs.map((job) => (
                <Card
                  key={job.id}
                  className='card-hover border-0 shadow-lg group'
                >
                  <CardHeader className='pb-4 px-4 sm:px-6'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-lg sm:text-xl group-hover:text-bojj-primary transition-colors line-clamp-2'>
                          {job.title}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-2 text-muted-foreground'>
                          <Calendar className='h-3 w-3 sm:h-4 sm:w-4' />
                          <span className='text-xs sm:text-sm'>
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

                  <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
                    <p className='text-muted-foreground mb-4 sm:mb-6 line-clamp-3 text-sm sm:text-base'>
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6'>
                      <div className='p-2 sm:p-3 rounded-lg bg-muted/50'>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                          Budget
                        </p>
                        <p className='font-semibold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base'>
                          {formatBudget(job.budget)}
                        </p>
                      </div>
                      {job.assignedVendor && (
                        <div className='p-2 sm:p-3 rounded-lg bg-muted/50'>
                          <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                            Vendor
                          </p>
                          <p className='font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base'>
                            {job.assignedVendor.firstName}{' '}
                            {job.assignedVendor.lastName}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link to={`/customer/jobs/${job.id}`}>
                      <Button
                        variant='outline'
                        className='w-full group-hover:border-bojj-primary/30 group-hover:text-bojj-primary transition-colors text-sm'
                      >
                        View Details
                        <ArrowRight className='ml-2 h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='all' className='mt-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
            {allJobs.length === 0 ? (
              <div className='col-span-1 md:col-span-2 text-center py-12 sm:py-16'>
                <div className='flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted mx-auto mb-4 sm:mb-6'>
                  <Briefcase className='h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground' />
                </div>
                <h3 className='text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3'>
                  No Jobs Found
                </h3>
                <p className='text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base'>
                  Start by posting your first job to connect with qualified
                  vendors in your area.
                </p>
                <Link to='/customer/jobs/new'>
                  <Button className='bg-gradient-to-r from-bojj-primary to-bojj-secondary hover:from-bojj-primary/90 hover:to-bojj-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5'>
                    <PlusCircle className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                    Post New Job
                  </Button>
                </Link>
              </div>
            ) : (
              allJobs.map((job) => (
                <Card
                  key={job.id}
                  className='card-hover border-0 shadow-lg group'
                >
                  <CardHeader className='pb-4 px-4 sm:px-6'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-lg sm:text-xl group-hover:text-bojj-primary transition-colors line-clamp-2'>
                          {job.title}
                        </CardTitle>
                        <div className='flex items-center gap-2 mt-2 text-muted-foreground'>
                          <Calendar className='h-3 w-3 sm:h-4 sm:w-4' />
                          <span className='text-xs sm:text-sm'>
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

                  <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
                    <p className='text-muted-foreground mb-4 sm:mb-6 line-clamp-3 text-sm sm:text-base'>
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6'>
                      <div className='p-2 sm:p-3 rounded-lg bg-muted/50'>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                          Budget
                        </p>
                        <p className='font-semibold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base'>
                          {formatBudget(job.budget)}
                        </p>
                      </div>
                      <div className='p-2 sm:p-3 rounded-lg bg-muted/50'>
                        <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                          Bids
                        </p>
                        <p className='font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base'>
                          {job._count?.bids || 0}
                        </p>
                      </div>
                    </div>

                    <Link to={`/customer/jobs/${job.id}`}>
                      <Button
                        variant='outline'
                        className='w-full group-hover:border-bojj-primary/30 group-hover:text-bojj-primary transition-colors text-sm'
                      >
                        View Details
                        <ArrowRight className='ml-2 h-3 w-3 sm:h-4 sm:w-4' />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <div className='mt-8 sm:mt-12 px-4 sm:px-6 lg:px-8'>
        <Card className='border-0 shadow-lg'>
          <CardHeader className='px-4 sm:px-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bojj-primary to-bojj-secondary text-white'>
                <Clock className='h-4 w-4 sm:h-5 sm:w-5' />
              </div>
              <div>
                <CardTitle className='text-lg sm:text-xl'>
                  Recent Activity
                </CardTitle>
                <CardDescription className='text-sm'>
                  Latest updates on your jobs and bids
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='px-4 sm:px-6 pb-4 sm:pb-6'>
            {jobs.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-muted-foreground text-sm sm:text-base'>
                  No recent activity
                </p>
              </div>
            ) : (
              <ul className='space-y-3 sm:space-y-4'>
                {activeJobs.slice(0, 3).map((job) => (
                  <li
                    key={job.id}
                    className='flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-bojj-primary/20 to-bojj-secondary/20 flex-shrink-0'>
                      <Briefcase className='h-4 w-4 sm:h-5 sm:w-5 text-bojj-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-foreground text-sm sm:text-base'>
                        Job "{job.title}" is active
                      </p>
                      <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                        {job._count?.bids || 0} bids received • Posted{' '}
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
                {completedJobs.slice(0, 2).map((job) => (
                  <li
                    key={job.id}
                    className='flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 flex-shrink-0'>
                      <CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-foreground text-sm sm:text-base'>
                        Job "{job.title}" completed
                      </p>
                      <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
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
    </div>
  );
};

export default CustomerDashboard;
