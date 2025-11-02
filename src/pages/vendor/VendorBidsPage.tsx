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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useVendorBids } from '@/hooks/useVendorBids';
import { VendorBid, vendorApi } from '@/config/vendorApi';
import { useAuth } from '@/hooks/useAuth';
import BidEditModal from '@/components/vendor/BidEditModal';
import BidDetailsModal from '@/components/vendor/BidDetailsModal';
import { MessageButton } from '@/components/shared/MessageButton';
import {
  DollarSign,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const VendorBidsPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBid, setSelectedBid] = useState<VendorBid | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    getAllBids,
    updateBid,
    withdrawBid,
    updateBidLoading,
    withdrawBidLoading,
    refreshBids,
  } = useVendorBids();

  // Get bids based on current filters
  const {
    data: bidsData,
    isLoading,
    error,
    refetch,
  } = getAllBids({
    page: currentPage,
    limit: 20,
    status: activeTab === 'all' ? undefined : activeTab,
    search: searchTerm || undefined,
  });

  const bids = bidsData?.bids || [];
  const pagination = bidsData?.pagination;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return theme === 'dark'
          ? 'bg-green-900/20 text-green-300 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return theme === 'dark'
          ? 'bg-red-900/20 text-red-300 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'WITHDRAWN':
        return theme === 'dark'
          ? 'bg-gray-900/20 text-gray-300 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
      case 'PENDING':
        return theme === 'dark'
          ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return theme === 'dark'
          ? 'bg-gray-900/20 text-gray-300 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WITHDRAWN':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStats = () => {
    if (!bidsData?.bids)
      return { total: 0, accepted: 0, pending: 0, rejected: 0, withdrawn: 0 };

    const allBids = bidsData.bids;
    const total = allBids.length;
    const accepted = allBids.filter((bid) => bid.status === 'ACCEPTED').length;
    const pending = allBids.filter((bid) => bid.status === 'PENDING').length;
    const rejected = allBids.filter((bid) => bid.status === 'REJECTED').length;
    const withdrawn = allBids.filter(
      (bid) => bid.status === 'WITHDRAWN'
    ).length;

    return { total, accepted, pending, rejected, withdrawn };
  };

  const stats = getStats();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewBid = (bid: VendorBid) => {
    setSelectedBid(bid);
    setIsDetailsModalOpen(true);
  };

  const handleEditBid = (bid: VendorBid) => {
    setSelectedBid(bid);
    setIsEditModalOpen(true);
  };

  const handleUpdateBid = (bidData: {
    amount?: number;
    description?: string;
    timeline?: string;
    notes?: string;
    milestones?: any;
  }) => {
    if (selectedBid) {
      updateBid({
        bidId: selectedBid.id,
        bidData,
      });
      setIsEditModalOpen(false);
      setSelectedBid(null);
    }
  };

  const handleWithdrawBid = (bid: VendorBid) => {
    if (
      confirm(
        'Are you sure you want to withdraw this bid? This action cannot be undone.'
      )
    ) {
      withdrawBid(bid.id);
    }
  };

  // Handle accepting counter offer
  const handleAcceptCounter = async (bidId: string, counterAmount: number) => {
    try {
      await vendorApi.acceptCounterOffer(bidId, user?.id);
      toast.success('Counter offer accepted successfully!');
      refetch(); // Refresh data
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
      await vendorApi.declineCounterOffer(bidId, user?.id);
      toast.success('Counter offer declined');
      refetch(); // Refresh data
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

  const handleRefresh = () => {
    refetch();
    refreshBids();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div
        className={`p-4 md:p-8 min-h-screen ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="text-center py-12">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
          </div>
          <h3
            className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Error loading bids
          </h3>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {error.message || 'Failed to load your bids. Please try again.'}
          </p>
          <Button onClick={handleRefresh} className="mt-4">
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
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              My Bids
            </h1>
            <p
              className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Track and manage all your submitted bids
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs by title or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`pl-10 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4 text-center">
            <p
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {stats.total}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Total Bids
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold text-green-600`}>
              {stats.accepted}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Accepted
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold text-yellow-600`}>
              {stats.pending}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Pending
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold text-red-600`}>
              {stats.rejected}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Rejected
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold text-gray-600`}>
              {stats.withdrawn}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Withdrawn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={handleTabChange} className="mb-6">
        <TabsList
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <TabsTrigger
            value="all"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            All Bids ({stats.total})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Accepted ({stats.accepted})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger
            value="withdrawn"
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Withdrawn ({stats.withdrawn})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <RefreshCw className="h-12 w-12 mx-auto text-gray-400 animate-spin" />
              </div>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Loading your bids...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bids.map((bid) => (
                  <Card
                    key={bid.id}
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
                            {bid.job.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}
                            >
                              {bid.job.location ||
                                `${bid.job.city || ''} ${
                                  bid.job.state || ''
                                }`.trim()}{' '}
                              • {bid.job.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(bid.status)}
                          >
                            {getStatusIcon(bid.status)}
                            <span className="ml-1">{bid.status}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          >
                            Posted: {formatDate(bid.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <div>
                            <p
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              Your Bid
                            </p>
                            <p
                              className={`font-semibold ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {formatCurrency(bid.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <div>
                            <p
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              Timeline
                            </p>
                            <p
                              className={`font-semibold ${
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {bid.timeline}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Customer:{' '}
                          <span
                            className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {bid.job.customer.firstName}{' '}
                            {bid.job.customer.lastName}
                          </span>
                        </p>
                      </div>

                      <p
                        className={`mb-4 line-clamp-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {bid.description}
                      </p>

                      {/* Counter Bid Information */}
                      {bid.counterOffers &&
                        bid.counterOffers.length > 0 &&
                        bid.status !== 'ACCEPTED' && (
                          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              <h4
                                className={`font-semibold ${
                                  theme === 'dark'
                                    ? 'text-blue-300'
                                    : 'text-blue-900'
                                }`}
                              >
                                Counter Offers
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {bid.counterOffers.map(
                                (offer: any, index: number) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-white dark:bg-gray-800 rounded border"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <span
                                        className={`font-medium ${
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
                                        className={`text-sm ${
                                          theme === 'dark'
                                            ? 'text-gray-300'
                                            : 'text-gray-600'
                                        }`}
                                      >
                                        "{offer.message}"
                                      </p>
                                    )}
                                    <div className="mt-2 flex gap-2">
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() =>
                                          handleAcceptCounter(
                                            bid.id,
                                            offer.amount
                                          )
                                        }
                                      >
                                        Accept Counter
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                          handleDeclineCounter(bid.id)
                                        }
                                      >
                                        Decline
                                      </Button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {bid.notes && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-600'
                            }`}
                          >
                            <strong>Notes:</strong> {bid.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Last updated: {formatDate(bid.updatedAt)}
                        </span>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBid(bid)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>

                          {bid.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBid(bid)}
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleWithdrawBid(bid)}
                                disabled={withdrawBidLoading}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Withdraw
                              </Button>
                            </>
                          )}

                          {bid.status === 'ACCEPTED' && user && (
                            <MessageButton
                              jobId={bid.job.id}
                              vendorId={bid.job.customer.id}
                              variant="outline"
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <span
                    className={`px-3 py-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Page {currentPage} of {pagination.pages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.pages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* No Results */}
              {bids.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Clock className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <h3
                    className={`text-lg font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    No bids found
                  </h3>
                  <p
                    className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {activeTab === 'all'
                      ? "You haven't submitted any bids yet. Start bidding on available jobs to see them here."
                      : `No ${activeTab.toLowerCase()} bids found.`}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <BidEditModal
        bid={selectedBid}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBid(null);
        }}
        onSave={handleUpdateBid}
        isLoading={updateBidLoading}
      />

      <BidDetailsModal
        bid={selectedBid}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBid(null);
        }}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setIsEditModalOpen(true);
        }}
        onWithdraw={() => {
          if (selectedBid) {
            handleWithdrawBid(selectedBid);
            setIsDetailsModalOpen(false);
            setSelectedBid(null);
          }
        }}
      />
    </div>
  );
};

export default VendorBidsPage;
