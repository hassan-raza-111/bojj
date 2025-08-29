import { useState } from 'react';
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
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
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
} from 'lucide-react';

const VendorBidsPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for vendor bids
  const allBids = [
    {
      id: 'bid-1',
      jobId: 'job-4',
      jobTitle: 'Basement Finishing',
      bidAmount: '$15,800',
      bidDate: '2023-04-20',
      status: 'Pending',
      customerName: 'Robert Johnson',
      customerRating: 4.8,
      notes:
        'Includes all materials and labor for complete basement finishing. Will complete within 3 weeks.',
      jobBudget: '$12,000 - $18,000',
      jobLocation: 'Chicago, IL',
      jobCategory: 'Home Renovation',
      lastUpdated: '2023-04-22',
      isFavorite: true,
    },
    {
      id: 'bid-2',
      jobId: 'job-5',
      jobTitle: 'Roof Repair',
      bidAmount: '$2,400',
      bidDate: '2023-04-18',
      status: 'Under Review',
      customerName: 'Jennifer Davis',
      customerRating: 4.6,
      notes:
        'Repair of damaged shingles and flashing around chimney. Can start next week.',
      jobBudget: '$2,000 - $3,000',
      jobLocation: 'Evanston, IL',
      jobCategory: 'Roofing',
      lastUpdated: '2023-04-21',
      isFavorite: false,
    },
    {
      id: 'bid-3',
      jobId: 'job-6',
      jobTitle: 'Kitchen Backsplash Installation',
      bidAmount: '$850',
      bidDate: '2023-04-15',
      status: 'Accepted',
      customerName: 'Michael Thompson',
      customerRating: 4.9,
      notes:
        'Installation of ceramic tile backsplash. Will provide all materials.',
      jobBudget: '$600 - $1,000',
      jobLocation: 'Oak Park, IL',
      jobCategory: 'Home Renovation',
      lastUpdated: '2023-04-19',
      isFavorite: true,
    },
    {
      id: 'bid-4',
      jobId: 'job-7',
      jobTitle: 'Deck Painting',
      bidAmount: '$1,200',
      bidDate: '2023-04-12',
      status: 'Rejected',
      customerName: 'Sarah Wilson',
      customerRating: 4.4,
      notes: 'Paint and seal wooden deck. Will use weather-resistant paint.',
      jobBudget: '$800 - $1,500',
      jobLocation: 'Arlington Heights, IL',
      jobCategory: 'Painting',
      lastUpdated: '2023-04-16',
      isFavorite: false,
    },
    {
      id: 'bid-5',
      jobId: 'job-8',
      jobTitle: 'Electrical Panel Upgrade',
      bidAmount: '$3,500',
      bidDate: '2023-04-10',
      status: 'Pending',
      customerName: 'David Brown',
      customerRating: 4.7,
      notes:
        'Upgrade electrical panel from 100A to 200A. Licensed electrician.',
      jobBudget: '$3,000 - $4,000',
      jobLocation: 'Naperville, IL',
      jobCategory: 'Electrical',
      lastUpdated: '2023-04-14',
      isFavorite: true,
    },
    {
      id: 'bid-6',
      jobId: 'job-9',
      jobTitle: 'Landscape Design',
      bidAmount: '$4,800',
      bidDate: '2023-04-08',
      status: 'Under Review',
      customerName: 'Lisa Garcia',
      customerRating: 4.5,
      notes:
        'Complete landscape design including plants, irrigation, and hardscaping.',
      jobBudget: '$4,000 - $6,000',
      jobLocation: 'Wheaton, IL',
      jobCategory: 'Landscaping',
      lastUpdated: '2023-04-12',
      isFavorite: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return theme === 'dark'
          ? 'bg-green-900/20 text-green-300 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected':
        return theme === 'dark'
          ? 'bg-red-900/20 text-red-300 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'Under Review':
        return theme === 'dark'
          ? 'bg-blue-900/20 text-blue-300 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
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
      case 'Accepted':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'Rejected':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'Under Review':
        return <Clock className='h-4 w-4 text-blue-500' />;
      case 'Pending':
        return <AlertCircle className='h-4 w-4 text-yellow-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const filteredBids =
    activeTab === 'all'
      ? allBids
      : allBids.filter(
          (bid) => bid.status.toLowerCase() === activeTab.toLowerCase()
        );

  const getStats = () => {
    const total = allBids.length;
    const accepted = allBids.filter((bid) => bid.status === 'Accepted').length;
    const pending = allBids.filter((bid) => bid.status === 'Pending').length;
    const underReview = allBids.filter(
      (bid) => bid.status === 'Under Review'
    ).length;
    const rejected = allBids.filter((bid) => bid.status === 'Rejected').length;

    return { total, accepted, pending, underReview, rejected };
  };

  const stats = getStats();

  return (
    <div
      className={`p-4 md:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className='mb-8'>
        <h1
          className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          My Bids
        </h1>
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Track and manage all your submitted bids
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className='p-4 text-center'>
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
          <CardContent className='p-4 text-center'>
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
          <CardContent className='p-4 text-center'>
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
          <CardContent className='p-4 text-center'>
            <p className={`text-2xl font-bold text-blue-600`}>
              {stats.underReview}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Under Review
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <CardContent className='p-4 text-center'>
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue='all' onValueChange={setActiveTab} className='mb-6'>
        <TabsList
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}
        >
          <TabsTrigger
            value='all'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            All Bids ({stats.total})
          </TabsTrigger>
          <TabsTrigger
            value='pending'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger
            value='under review'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Under Review ({stats.underReview})
          </TabsTrigger>
          <TabsTrigger
            value='accepted'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Accepted ({stats.accepted})
          </TabsTrigger>
          <TabsTrigger
            value='rejected'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Rejected ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className='mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {filteredBids.map((bid) => (
              <Card
                key={bid.id}
                className={`${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } hover:shadow-lg transition-shadow duration-200`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='min-w-0 flex-1'>
                      <CardTitle
                        className={`text-xl ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {bid.jobTitle}
                      </CardTitle>
                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {bid.jobLocation} • {bid.jobCategory}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className={getStatusColor(bid.status)}
                      >
                        {getStatusIcon(bid.status)}
                        <span className='ml-1'>{bid.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-1'>
                        <span
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Customer Rating:
                        </span>
                        <span
                          className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {bid.customerRating}/5
                        </span>
                      </div>
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Posted: {bid.bidDate}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4 text-green-500' />
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Your Bid
                        </p>
                        <p
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {bid.bidAmount}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4 text-blue-500' />
                      <div>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Job Budget
                        </p>
                        <p
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {bid.jobBudget}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='mb-4'>
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
                        {bid.customerName}
                      </span>
                    </p>
                  </div>

                  <p
                    className={`mb-4 line-clamp-3 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {bid.notes}
                  </p>

                  <div className='flex items-center justify-between'>
                    <span
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Last updated: {bid.lastUpdated}
                    </span>

                    <div className='flex space-x-2'>
                      <Link
                        to={`/vendor-dashboard/bids/${bid.id}/view`}
                        className='flex-1 min-w-0'
                      >
                        <Button variant='outline' size='sm'>
                          <Eye className='mr-1 h-3 w-3' />
                          View
                        </Button>
                      </Link>

                      {bid.status === 'Pending' && (
                        <>
                          <Button variant='outline' size='sm'>
                            <Edit className='mr-1 h-3 w-3' />
                            Edit
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 className='mr-1 h-3 w-3' />
                            Withdraw
                          </Button>
                        </>
                      )}

                      {bid.status === 'Accepted' && (
                        <Link
                          to={`/vendor-dashboard/messages?jobId=${
                            bid.jobId
                          }&client=${encodeURIComponent(bid.customerName)}`}
                        >
                          <Button size='sm'>
                            <MessageSquare className='mr-1 h-3 w-3' />
                            Message
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredBids.length === 0 && (
            <div className='text-center py-12'>
              <div className='mb-4'>
                <Clock className='h-12 w-12 mx-auto text-gray-400' />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorBidsPage;
