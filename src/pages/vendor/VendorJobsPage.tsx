import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAvailableJobs, JobFilters } from '@/hooks/useAvailableJobs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import BidModal from '@/components/vendor/BidModal';
import { vendorApi } from '@/config/vendorApi';

const VendorJobsPage = () => {
  const { theme } = useTheme();

  // State for filters
  const [filters, setFilters] = useState<JobFilters>({
    category: 'all',
    location: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Bid modal state
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Debounced search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Use the custom hook
  const {
    jobs,
    pagination,
    filters: availableFilters,
    isLoading,
    isError,
    refreshJobs,
    refreshFilters,
  } = useAvailableJobs(filters);

  // Debug logging
  console.log('🔍 VendorJobsPage - jobs:', jobs);
  console.log('🔍 VendorJobsPage - isLoading:', isLoading);
  console.log('🔍 VendorJobsPage - isError:', isError);
  console.log('🔍 VendorJobsPage - pagination:', pagination);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when search changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearchTerm,
    }));
  }, [debouncedSearchTerm]);

  // Handle filter changes
  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

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

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return theme === 'dark'
          ? 'bg-red-900/20 text-red-300 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return theme === 'dark'
          ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return theme === 'dark'
          ? 'bg-green-900/20 text-green-300 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      default:
        return theme === 'dark'
          ? 'bg-gray-900/20 text-gray-300 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
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
      // Refresh jobs to update bid count
      refreshJobs();
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

  // Close bid modal
  const closeBidModal = () => {
    setIsBidModalOpen(false);
    setSelectedJob(null);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center mt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
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
        Failed to load available jobs. Please try again.
      </p>
      <Button onClick={refreshJobs} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );

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
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Available Jobs
        </h1>
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Find jobs that match your skills and start earning
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableFilters?.categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.location}
            onValueChange={(value) => handleFilterChange('location', value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {availableFilters?.locations?.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Sort by:
          </span>
          <div className="flex gap-2">
            {[
              { key: 'createdAt', label: 'Date Posted' },
              { key: 'budget', label: 'Budget' },
              { key: 'urgency', label: 'Urgency' },
            ].map((sortOption) => (
              <Button
                key={sortOption.key}
                variant={
                  filters.sortBy === sortOption.key ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => handleSortChange(sortOption.key)}
                className="text-xs"
              >
                {sortOption.label}
                {filters.sortBy === sortOption.key && (
                  <span className="ml-1">
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count and Refresh */}
      <div className="flex justify-between items-center mb-6">
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {isLoading
            ? 'Loading...'
            : `Showing ${jobs.length} of ${
                pagination?.total || 0
              } available jobs`}
        </p>
        <Button
          onClick={refreshJobs}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      {!isLoading && jobs.length > 0 && (
        <Card
          className={`mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
        >
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  {jobs.length}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Total Jobs
                </div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {jobs.filter((job) => job.budget && job.budget > 1000).length}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  High Budget Jobs
                </div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`}
                >
                  {jobs.filter((job) => job.priority === 'HIGH').length}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Urgent Jobs
                </div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}
                >
                  {jobs.reduce((total, job) => total + (job.totalBids || 0), 0)}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Total Bids
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <Search className="h-12 w-12 mx-auto text-gray-400" />
          </div>
          <h3
            className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            No jobs found
          </h3>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Try adjusting your search criteria or check back later for new
            opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } hover:shadow-lg transition-shadow duration-200`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle
                      className={`text-xl ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {job.city && job.state
                          ? `${job.city}, ${job.state}`
                          : job.location || 'Location not specified'}
                      </span>
                    </div>
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {job.customerRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {job.totalBids} bids
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={getUrgencyColor(job.urgency)}
                  >
                    {job.urgency || 'Medium'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p
                  className={`mb-4 line-clamp-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {job.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Budget
                      </p>
                      <p
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {getBudgetDisplay(job.budget, job.budgetType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Posted
                      </p>
                      <p
                        className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Job Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Customer Jobs
                    </p>
                    <p
                      className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {job.customerTotalJobs || 0} completed
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Avg Bid
                    </p>
                    <p
                      className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {job.averageBidAmount > 0
                        ? formatCurrency(job.averageBidAmount)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
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

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => {
              // Handle page change
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => {
              // Handle page change
            }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

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

export default VendorJobsPage;
