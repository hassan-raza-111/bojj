import { useParams, useNavigate } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useJobDetails } from '@/hooks/useJobDetails';
import { useBidActions } from '@/hooks/useBidActions';
import { MessageButton } from '@/components/shared/MessageButton';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  User,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const JobDetailsPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Debug URL and params
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 Pathname:', window.location.pathname);
  console.log('🔍 useParams result:', useParams());
  console.log('🔍 jobId from params:', jobId);
  console.log('🔍 user from auth:', user);

  // React Query hooks
  const {
    data: job,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobDetails(jobId, user?.id);
  const { acceptBid, rejectBid, isAccepting, isRejecting } = useBidActions(
    jobId,
    user?.id
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBidStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div
        className={`p-4 md:p-8 min-h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='max-w-6xl mx-auto'>
          <div className='mb-6'>
            <Skeleton className='h-8 w-48 mb-2' />
            <Skeleton className='h-4 w-32' />
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <Skeleton className='h-64 w-full mb-4' />
              <Skeleton className='h-32 w-full' />
            </div>
            <div>
              <Skeleton className='h-48 w-full' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div
        className={`p-4 md:p-8 min-h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='max-w-6xl mx-auto'>
          <div className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Job not found</h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              {error?.message ||
                "The job you're looking for doesn't exist or has been removed."}
            </p>
            <div className='flex gap-3'>
              <Button
                onClick={() => navigate('/customer/jobs')}
                variant='outline'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Jobs
              </Button>
              <Button onClick={() => refetch()} variant='outline'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 md:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <Button
            onClick={() => navigate('/customer/jobs')}
            variant='ghost'
            className='mb-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Jobs
          </Button>

          <div className='flex justify-between items-start'>
            <div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {job.title}
              </h1>
              <div className='flex items-center gap-4'>
                <Badge variant='outline' className={getStatusBadge(job.status)}>
                  {job.status.replace('_', ' ')}
                </Badge>
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>
            </div>

            <Button onClick={() => refetch()} variant='outline' size='sm'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            <Tabs defaultValue='details' className='w-full'>
              <TabsList
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <TabsTrigger value='details'>Job Details</TabsTrigger>
                <TabsTrigger value='bids'>Bids ({job.bids.length})</TabsTrigger>
              </TabsList>

              <TabsContent value='details' className='mt-4'>
                <Card className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                  <CardHeader>
                    <CardTitle
                      className={
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }
                    >
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`mb-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {job.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-4 w-4 text-green-500' />
                        <div>
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            Budget
                          </p>
                          <p
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {formatCurrency(job.budget)} ({job.budgetType})
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-blue-500' />
                        <div>
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            Location
                          </p>
                          <p
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {job.location}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-purple-500' />
                        <div>
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            Category
                          </p>
                          <p
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {job.category}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-orange-500' />
                        <div>
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='bids' className='mt-4'>
                {job.bids.length === 0 ? (
                  <Card
                    className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                  >
                    <CardContent className='text-center py-12'>
                      <div className='mb-4'>
                        <User className='h-12 w-12 mx-auto text-gray-400' />
                      </div>
                      <h3
                        className={`text-lg font-medium mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        No bids yet
                      </h3>
                      <p
                        className={`${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Vendors will start submitting bids soon. Check back
                        later!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className='space-y-4'>
                    {job.bids.map((bid) => (
                      <Card
                        key={bid.id}
                        className={
                          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex justify-between items-start'>
                            <div className='flex items-center gap-3'>
                              <div className='flex items-center gap-2'>
                                <User className='h-5 w-5 text-blue-500' />
                                <span
                                  className={`font-medium ${
                                    theme === 'dark'
                                      ? 'text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {bid.vendor.firstName} {bid.vendor.lastName}
                                </span>
                              </div>
                              <Badge
                                variant='outline'
                                className={getBidStatusBadge(bid.status)}
                              >
                                {bid.status}
                              </Badge>
                            </div>
                            <div className='text-right'>
                              <p
                                className={`text-2xl font-bold ${
                                  theme === 'dark'
                                    ? 'text-green-400'
                                    : 'text-green-600'
                                }`}
                              >
                                {formatCurrency(bid.amount)}
                              </p>
                              <p
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                Timeline: {bid.timeline}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                            <div className='flex items-center gap-2'>
                              <Star className='h-4 w-4 text-yellow-500' />
                              <div>
                                <p
                                  className={`text-sm ${
                                    theme === 'dark'
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Rating
                                </p>
                                <p
                                  className={`font-medium ${
                                    theme === 'dark'
                                      ? 'text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {bid.vendor.vendorProfile?.rating?.toFixed(
                                    1
                                  ) || 'N/A'}
                                  /5
                                </p>
                              </div>
                            </div>

                            <div className='flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4 text-green-500' />
                              <div>
                                <p
                                  className={`text-sm ${
                                    theme === 'dark'
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Jobs Completed
                                </p>
                                <p
                                  className={`font-medium ${
                                    theme === 'dark'
                                      ? 'text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {bid.vendor.vendorProfile?.completedJobs || 0}
                                </p>
                              </div>
                            </div>

                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-purple-500' />
                              <div>
                                <p
                                  className={`text-sm ${
                                    theme === 'dark'
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Experience
                                </p>
                                <p
                                  className={`font-medium ${
                                    theme === 'dark'
                                      ? 'text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {bid.vendor.vendorProfile?.experience || 0}{' '}
                                  years
                                </p>
                              </div>
                            </div>

                            <div className='flex items-center gap-2'>
                              <Clock className='h-4 w-4 text-blue-500' />
                              <div>
                                <p
                                  className={`text-sm ${
                                    theme === 'dark'
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  Bid Submitted
                                </p>
                                <p
                                  className={`font-medium ${
                                    theme === 'dark'
                                      ? 'text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {formatDate(bid.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className='mb-4'>
                            <p
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              } mb-2`}
                            >
                              Proposal:
                            </p>
                            <p
                              className={`${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {bid.description}
                            </p>
                          </div>

                          {bid.vendor.vendorProfile?.skills && (
                            <div className='mb-4'>
                              <p
                                className={`text-sm ${
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                } mb-2`}
                              >
                                Skills:
                              </p>
                              <div className='flex flex-wrap gap-2'>
                                {bid.vendor.vendorProfile.skills.map(
                                  (skill, index) => (
                                    <Badge
                                      key={index}
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div className='flex gap-3'>
                            {bid.status === 'PENDING' && (
                              <>
                                <Button
                                  onClick={() => acceptBid(bid.id)}
                                  className='flex-1 bg-green-600 hover:bg-green-700'
                                  disabled={isAccepting || isRejecting}
                                >
                                  {isAccepting ? (
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                  ) : (
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                  )}
                                  {isAccepting ? 'Accepting...' : 'Accept Bid'}
                                </Button>
                                <Button
                                  onClick={() => rejectBid(bid.id)}
                                  variant='outline'
                                  className='flex-1'
                                  disabled={isAccepting || isRejecting}
                                >
                                  {isRejecting ? (
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                  ) : (
                                    <XCircle className='mr-2 h-4 w-4' />
                                  )}
                                  {isRejecting ? 'Rejecting...' : 'Reject Bid'}
                                </Button>
                              </>
                            )}

                            <Button
                              onClick={() =>
                                navigate(`/vendor/public/${bid.vendor.id}`)
                              }
                              variant='outline'
                              className='flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20'
                            >
                              <User className='mr-2 h-4 w-4' />
                              View Profile
                            </Button>

                            <MessageButton
                              jobId={job.id}
                              vendorId={bid.vendor.id}
                              variant='outline'
                              className='flex-1'
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Job Summary */}
            <Card className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
              <CardHeader>
                <CardTitle
                  className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  Job Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span
                    className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Total Bids
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {job.bids.length}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span
                    className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Average Bid
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {job.bids.length > 0
                      ? formatCurrency(
                          job.bids.reduce((sum, bid) => sum + bid.amount, 0) /
                            job.bids.length
                        )
                      : 'N/A'}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span
                    className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Lowest Bid
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {job.bids.length > 0
                      ? formatCurrency(
                          Math.min(...job.bids.map((bid) => bid.amount))
                        )
                      : 'N/A'}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span
                    className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Highest Bid
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {job.bids.length > 0
                      ? formatCurrency(
                          Math.max(...job.bids.map((bid) => bid.amount))
                        )
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
              <CardHeader>
                <CardTitle
                  className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  Job Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-start gap-3'>
                    <CheckCircle className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
                    <div>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Review Bids Carefully
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Compare vendor ratings, experience, and proposals before
                        making a decision.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <MessageSquare className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0' />
                    <div>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Communicate Clearly
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Use the message feature to discuss project details with
                        vendors.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Clock className='h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0' />
                    <div>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Timeline Expectations
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Set realistic deadlines and communicate any urgent
                        requirements.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Star className='h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0' />
                    <div>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Quality Assurance
                      </p>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Check vendor profiles, reviews, and completed projects
                        for quality assurance.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`pt-3 border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <p
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    💡 Tip: Accept bids only when you're confident about the
                    vendor's capabilities and timeline.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
