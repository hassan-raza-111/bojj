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
import { useTheme } from '@/contexts/ThemeContext';
import {
  DollarSign,
  MessageSquare,
  Search,
  Star,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const { theme } = useTheme();

  const {
    dashboardSummary,
    availableJobs,
    activeBids,
    awardedJobs,
    earnings,
    submitBid,
    submitBidLoading,
    refreshAll,
    isLoading,
    isError,
  } = useVendorDashboard();

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
          <CardHeader>
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-3/4 mb-4' />
            <div className='flex space-x-3'>
              <Skeleton className='h-10 flex-1' />
              <Skeleton className='h-10 flex-1' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div className='flex flex-col items-center justify-center py-12'>
      <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
      <h3 className='text-lg font-semibold mb-2'>Something went wrong</h3>
      <p className='text-gray-600 dark:text-gray-400 mb-4'>
        Failed to load dashboard data. Please try again.
      </p>
      <Button onClick={refreshAll} variant='outline'>
        <RefreshCw className='mr-2 h-4 w-4' />
        Retry
      </Button>
    </div>
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get budget display text
  const getBudgetDisplay = (budget?: number, budgetType?: string) => {
    if (!budget) return 'Negotiable';
    return `${formatCurrency(budget)} (${budgetType || 'Fixed'})`;
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isError) {
    return <ErrorComponent />;
  }

  return (
    <div
      className={`p-4 md:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Vendor Dashboard</h2>
        <div className='flex space-x-3'>
          <Button onClick={refreshAll} variant='outline' disabled={isLoading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Link to='/vendor-dashboard/jobs/search'>
            <Button className='bg-bojj-primary hover:bg-bojj-primary/90'>
              <Search className='mr-2 h-4 w-4' />
              Find Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className='pb-2'>
            <CardTitle
              className={`text-lg font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Available Jobs
            </CardTitle>
            <CardDescription
              className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            >
              Jobs matching your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardSummary.isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <p
                className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                {dashboardSummary.data?.availableJobs || 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className='pb-2'>
            <CardTitle
              className={`text-lg font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Active Bids
            </CardTitle>
            <CardDescription
              className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            >
              Submitted proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardSummary.isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <p
                className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {dashboardSummary.data?.activeBids || 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className='pb-2'>
            <CardTitle
              className={`text-lg font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Awarded Jobs
            </CardTitle>
            <CardDescription
              className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            >
              Contracts in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardSummary.isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <p
                className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}
              >
                {dashboardSummary.data?.awardedJobs || 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jobs Tabs */}
      <Tabs
        defaultValue='available'
        onValueChange={setActiveTab}
        className='mt-6'
      >
        <TabsList
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <TabsTrigger
            value='available'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Available Jobs
          </TabsTrigger>
          <TabsTrigger
            value='bids'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            My Bids
          </TabsTrigger>
          <TabsTrigger
            value='awarded'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Awarded Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value='available' className='mt-4'>
          {availableJobs.isLoading ? (
            <LoadingSkeleton />
          ) : availableJobs.data?.jobs?.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 dark:text-gray-400'>
                No available jobs found.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
              {availableJobs.data?.jobs?.map((job) => (
                <Card
                  key={job.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div className='min-w-0'>
                        <CardTitle
                          className={
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }
                        >
                          {job.title}
                        </CardTitle>
                        <CardDescription
                          className={`mt-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {job.city && job.state
                            ? `${job.city}, ${job.state}`
                            : job.location || 'Location not specified'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant='outline'
                        className={`${
                          theme === 'dark'
                            ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {job.category}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p
                      className={`mb-4 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Budget
                        </p>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {getBudgetDisplay(job.budget, job.budgetType)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Posted
                        </p>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className='flex space-x-3 mt-4'>
                      <Link
                        to={`/vendor-dashboard/jobs/${job.id}/details`}
                        className='flex-1 min-w-0'
                      >
                        <Button variant='outline' className='w-full'>
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/vendor-dashboard/jobs/${job.id}/bid`}
                        className='flex-1 min-w-0'
                      >
                        <Button className='w-full bg-bojj-primary hover:bg-bojj-primary/90'>
                          Submit Bid
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='bids' className='mt-4'>
          {activeBids.isLoading ? (
            <LoadingSkeleton />
          ) : activeBids.data?.bids?.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 dark:text-gray-400'>
                No active bids found.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
              {activeBids.data?.bids?.map((bid) => (
                <Card
                  key={bid.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div className='min-w-0'>
                        <CardTitle
                          className={
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }
                        >
                          {bid.job.title}
                        </CardTitle>
                        <CardDescription
                          className={`mt-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Bid submitted {formatDate(bid.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant='outline'
                        className={getStatusBadge(bid.status)}
                      >
                        {bid.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Bid Amount
                        </p>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(bid.amount)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Customer
                        </p>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {bid.job.customer.firstName}{' '}
                          {bid.job.customer.lastName}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`mb-4 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {bid.description}
                    </p>

                    <div className='flex space-x-3 mt-4'>
                      <Link
                        to={`/vendor-dashboard/bids/${bid.id}/view`}
                        className='flex-1 min-w-0'
                      >
                        <Button variant='outline' className='w-full'>
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/vendor-dashboard/messages?jobId=${
                          bid.job.id
                        }&client=${encodeURIComponent(
                          `${bid.job.customer.firstName} ${bid.job.customer.lastName}`
                        )}`}
                        className='flex-1 min-w-0'
                      >
                        <Button className='w-full'>
                          <MessageSquare className='mr-2 h-4 w-4' />
                          Message Client
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='awarded' className='mt-4'>
          {awardedJobs.isLoading ? (
            <LoadingSkeleton />
          ) : awardedJobs.data?.jobs?.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 dark:text-gray-400'>
                No awarded jobs found.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
              {awardedJobs.data?.jobs?.map((job) => (
                <Card
                  key={job.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div className='min-w-0'>
                        <CardTitle
                          className={
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }
                        >
                          {job.title}
                        </CardTitle>
                        <CardDescription
                          className={`mt-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Started {formatDate(job.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant='outline'
                        className={getStatusBadge(job.status)}
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Status
                        </p>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {job.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Customer
                        </p>
                        <p
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {job.customer.firstName} {job.customer.lastName}
                        </p>
                      </div>
                    </div>

                    <div className='flex space-x-3 mt-4'>
                      <Link
                        to={`/vendor-dashboard/jobs/${job.id}/details`}
                        className='flex-1 min-w-0'
                      >
                        <Button variant='outline' className='w-full'>
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/vendor-dashboard/messages?jobId=${
                          job.id
                        }&client=${encodeURIComponent(
                          `${job.customer.firstName} ${job.customer.lastName}`
                        )}`}
                        className='flex-1 min-w-0'
                      >
                        <Button className='w-full'>
                          <MessageSquare className='mr-2 h-4 w-4' />
                          Message Client
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Earnings Overview */}
      <Card className={`mt-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle
              className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
            >
              Earnings Overview
            </CardTitle>
            <CardDescription
              className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            >
              Your financial summary
            </CardDescription>
          </div>
          <Link to='/vendor-dashboard/earnings'>
            <Button
              variant='ghost'
              className={
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            >
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {earnings.isLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center gap-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div>
                    <Skeleton className='h-4 w-20 mb-2' />
                    <Skeleton className='h-8 w-24' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
              <div className='flex items-center gap-4'>
                <div
                  className={`p-3 rounded-full ${
                    theme === 'dark' ? 'bg-emerald-900/40' : 'bg-emerald-100'
                  }`}
                >
                  <DollarSign className='h-6 w-6 text-emerald-600' />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    This Month
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(earnings.data?.totalEarnings || 0)}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <div
                  className={`p-3 rounded-full ${
                    theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100'
                  }`}
                >
                  <Clock className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Pending
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {formatCurrency(earnings.data?.pendingPayments || 0)}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <div
                  className={`p-3 rounded-full ${
                    theme === 'dark' ? 'bg-purple-900/40' : 'bg-purple-100'
                  }`}
                >
                  <Star className='h-6 w-6 text-purple-600' />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Rating
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    {dashboardSummary.data?.rating?.toFixed(1) || '0.0'}/5
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
