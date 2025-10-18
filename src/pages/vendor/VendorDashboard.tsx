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
  User,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import BidModal from '@/components/vendor/BidModal';
import { vendorApi } from '@/config/vendorApi';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const { theme } = useTheme();
  const { user } = useAuth();

  // Bid modal state
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex space-x-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Failed to load dashboard data. Please try again.
      </p>
      <Button onClick={refreshAll} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
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

  // Handle bid submission
  const handleSubmitBid = async (bidData: {
    jobId: string;
    amount: number;
    description: string;
    timeline: string;
    milestones?: string;
  }) => {
    try {
      await vendorApi.submitBid(bidData);
      toast.success('Bid submitted successfully!');
      // Refresh dashboard data
      refreshAll();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid. Please try again.');
      throw error;
    }
  };

  // Open bid modal
  const openBidModal = (job: any) => {
    setSelectedJob(job);
    setIsBidModalOpen(true);
  };

  // Handle accepting counter offer
  const handleAcceptCounter = async (bidId: string, counterAmount: number) => {
    try {
      console.log('🔍 Accepting counter offer for bid:', bidId);
      await vendorApi.acceptCounterOffer(bidId, user?.id);
      console.log('✅ Counter offer accepted, refreshing data...');
      toast.success('Counter offer accepted successfully!');
      refreshAll(); // Refresh dashboard data
    } catch (error) {
      console.error('Error accepting counter offer:', error);
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to accept counter offer',
      });
    }
  };

  // Handle declining counter offer
  const handleDeclineCounter = async (bidId: string) => {
    try {
      console.log('🔍 Declining counter offer for bid:', bidId);
      await vendorApi.declineCounterOffer(bidId, user?.id);
      console.log('✅ Counter offer declined, refreshing data...');
      toast.success('Counter offer declined');
      refreshAll(); // Refresh dashboard data
    } catch (error) {
      console.error('Error declining counter offer:', error);
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to decline counter offer',
      });
    }
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    const vendorProfile = (user as any)?.vendorProfile;
    return !!(
      vendorProfile?.companyName &&
      vendorProfile?.businessType &&
      vendorProfile?.skills?.length > 0 &&
      vendorProfile?.experience &&
      vendorProfile.experience > 0 &&
      vendorProfile?.description &&
      user?.phone &&
      user?.location
    );
  };

  const profileCompletionPercentage = () => {
    const vendorProfile = (user as any)?.vendorProfile;
    let completed = 0;

    // Only check fields that are actually used in profile setup
    const requiredFields = [
      { name: 'companyName', value: !!vendorProfile?.companyName },
      { name: 'businessType', value: !!vendorProfile?.businessType },
      { name: 'phone', value: !!user?.phone },
      { name: 'location', value: !!user?.location },
      { name: 'description', value: !!vendorProfile?.description },
      {
        name: 'experience',
        value: vendorProfile?.experience && vendorProfile.experience > 0,
      },
      { name: 'skills', value: vendorProfile?.skills?.length > 0 },
    ];

    // Count completed fields
    requiredFields.forEach((field) => {
      if (field.value) completed++;
    });

    const total = requiredFields.length;

    return Math.round((completed / total) * 100);
  };

  // Close bid modal
  const closeBidModal = () => {
    setIsBidModalOpen(false);
    setSelectedJob(null);
  };

  // Simple error handling
  if (isError) {
    console.error('❌ VendorDashboard Error:', isError);
    return (
      <div className="p-4 md:p-8 min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">Please check console for details</p>
          <Button onClick={refreshAll} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Vendor Dashboard</h2>
        <div className="flex space-x-3">
          <Button onClick={refreshAll} variant="outline" disabled={isLoading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Link to="/vendor/jobs/search">
            <Button className="bg-venbid-primary hover:bg-venbid-primary/90">
              <Search className="mr-2 h-4 w-4" />
              Find Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!isProfileComplete() && (
        <Card
          className={`mb-6 ${
            theme === 'dark'
              ? 'bg-yellow-900/20 border-yellow-700'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your profile is {profileCompletionPercentage()}% complete.
                    Complete it to get more job opportunities.
                  </p>
                </div>
              </div>
              <Link to="/vendor/profile/setup">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <User className="mr-2 h-4 w-4" />
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader className="pb-2">
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
              <Skeleton className="h-8 w-16" />
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
          <CardHeader className="pb-2">
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
              <Skeleton className="h-8 w-16" />
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
          <CardHeader className="pb-2">
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
              <Skeleton className="h-8 w-16" />
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
        defaultValue="available"
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <TabsTrigger
            value="available"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Available Jobs
          </TabsTrigger>
          <TabsTrigger
            value="bids"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            My Bids
          </TabsTrigger>
          <TabsTrigger
            value="awarded"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Awarded Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          {availableJobs.isLoading ? (
            <LoadingSkeleton />
          ) : availableJobs.data?.data?.jobs?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No available jobs found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
              {availableJobs.data?.data?.jobs?.map((job) => (
                <Card
                  key={job.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
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
                        variant="outline"
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

                    <div className="grid grid-cols-2 gap-4 mb-4">
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

                    <div className="flex space-x-3 mt-4">
                      <Link
                        to={`/vendor/jobs/${job.id}`}
                        className="flex-1 min-w-0"
                      >
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      <Button
                        onClick={() => openBidModal(job)}
                        className="flex-1 bg-venbid-primary hover:bg-venbid-primary/90"
                      >
                        Submit Bid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bids" className="mt-4">
          {activeBids.isLoading ? (
            <LoadingSkeleton />
          ) : activeBids.data?.bids?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No active bids found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
              {activeBids.data?.bids?.map((bid) => (
                <Card
                  key={bid.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
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
                        variant="outline"
                        className={getStatusBadge(bid.status)}
                      >
                        {bid.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
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

                    {/* Counter Bid Information */}
                    {console.log('🔍 Bid data for counter offers:', {
                      bidId: bid.id,
                      counterOffers: bid.counterOffers,
                      lastCounteredBy: bid.lastCounteredBy,
                      negotiationStatus: bid.negotiationStatus,
                      status: bid.status,
                      amount: bid.amount,
                      currentAmount: bid.currentAmount,
                    })}
                    {bid.counterOffers &&
                      bid.counterOffers.length > 0 &&
                      bid.status !== 'ACCEPTED' && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <h4
                              className={`font-semibold text-sm ${
                                theme === 'dark'
                                  ? 'text-blue-300'
                                  : 'text-blue-900'
                              }`}
                            >
                              Counter Offers ({bid.counterOffers.length})
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {bid.counterOffers
                              .slice(0, 2)
                              .map((offer: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-2 bg-white dark:bg-gray-800 rounded border"
                                >
                                  <div className="flex justify-between items-center">
                                    <span
                                      className={`font-medium text-sm ${
                                        theme === 'dark'
                                          ? 'text-white'
                                          : 'text-gray-900'
                                      }`}
                                    >
                                      ${offer.amount.toLocaleString()}
                                    </span>
                                    <span
                                      className={`text-xs ${
                                        theme === 'dark'
                                          ? 'text-gray-400'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {new Date(
                                        offer.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {offer.message && (
                                    <p
                                      className={`text-xs mt-1 ${
                                        theme === 'dark'
                                          ? 'text-gray-300'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      "{offer.message}"
                                    </p>
                                  )}
                                  <div className="mt-2 flex gap-1">
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                                      onClick={() =>
                                        handleAcceptCounter(
                                          bid.id,
                                          offer.amount
                                        )
                                      }
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs px-2 py-1"
                                      onClick={() =>
                                        handleDeclineCounter(bid.id)
                                      }
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            {bid.counterOffers.length > 2 && (
                              <p
                                className={`text-xs ${
                                  theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                }`}
                              >
                                +{bid.counterOffers.length - 2} more offers
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex space-x-3 mt-4">
                      <Link
                        to={`/vendor/bids/${bid.id}`}
                        className="flex-1 min-w-0"
                      >
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/vendor/messages?jobId=${
                          bid.job.id
                        }&client=${encodeURIComponent(
                          `${bid.job.customer.firstName} ${bid.job.customer.lastName}`
                        )}`}
                        className="flex-1 min-w-0"
                      >
                        <Button className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
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

        <TabsContent value="awarded" className="mt-4">
          {awardedJobs.isLoading ? (
            <LoadingSkeleton />
          ) : awardedJobs.data?.jobs?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No awarded jobs found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
              {awardedJobs.data?.jobs?.map((job) => (
                <Card
                  key={job.id}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
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
                        variant="outline"
                        className={getStatusBadge(job.status)}
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
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

                    <div className="flex space-x-3 mt-4">
                      <Link
                        to={`/vendor/jobs/${job.id}`}
                        className="flex-1 min-w-0"
                      >
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      <Link
                        to={`/vendor/messages?jobId=${
                          job.id
                        }&client=${encodeURIComponent(
                          `${job.customer.firstName} ${job.customer.lastName}`
                        )}`}
                        className="flex-1 min-w-0"
                      >
                        <Button className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
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

      {/* Payment Tracking Overview */}
      <Card className={`mt-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle
              className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
            >
              Payment Tracking
            </CardTitle>
            <CardDescription
              className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            >
              Track your manual payments (Cash, Venmo, Zelle)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  theme === 'dark' ? 'bg-emerald-900/40' : 'bg-emerald-100'
                }`}
              >
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Completed Jobs
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  {awardedJobs?.data?.jobs?.filter(
                    (job) => job.status === 'COMPLETED'
                  ).length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100'
                }`}
              >
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Pending Approval
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {awardedJobs?.data?.jobs?.filter(
                    (job) => job.status === 'PENDING_APPROVAL'
                  ).length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  theme === 'dark' ? 'bg-orange-900/40' : 'bg-orange-100'
                }`}
              >
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  In Progress
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  }`}
                >
                  {awardedJobs?.data?.jobs?.filter(
                    (job) => job.status === 'IN_PROGRESS'
                  ).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Manual Payment System
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  All payments are handled manually between you and the customer
                  using Cash, Venmo, or Zelle. When completing a job, you'll
                  need to specify which payment method was used.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={closeBidModal}
        job={selectedJob}
        onSubmitBid={handleSubmitBid}
      />
    </div>
  );
};

export default VendorDashboard;
