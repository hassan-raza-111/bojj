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
import { DollarSign, MessageSquare, Search, Star, Clock } from 'lucide-react';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const { theme } = useTheme();

  // Mock data for available jobs
  const availableJobs = [
    {
      id: 'job-1',
      title: 'Kitchen Renovation',
      description:
        'Complete renovation of kitchen including cabinets, countertops, and appliances.',
      location: 'Chicago, IL',
      postedDate: '2023-04-25',
      budget: '$8,000 - $12,000',
      category: 'Home Renovation',
      distance: '3.2 miles away',
    },
    {
      id: 'job-2',
      title: 'Bathroom Remodel',
      description: 'Full bathroom remodel with new fixtures, tile, and vanity.',
      location: 'Evanston, IL',
      postedDate: '2023-04-23',
      budget: '$5,000 - $7,500',
      category: 'Home Renovation',
      distance: '5.1 miles away',
    },
    {
      id: 'job-3',
      title: 'Deck Construction',
      description: "Build a 12' x 14' wooden deck in the backyard.",
      location: 'Oak Park, IL',
      postedDate: '2023-04-21',
      budget: '$3,000 - $4,500',
      category: 'Carpentry',
      distance: '4.3 miles away',
    },
  ];

  // Mock data for active bids
  const activeBids = [
    {
      id: 'bid-1',
      jobId: 'job-4',
      jobTitle: 'Basement Finishing',
      bidAmount: '$15,800',
      bidDate: '2023-04-20',
      status: 'Pending',
      customerName: 'Robert Johnson',
      notes:
        'Includes all materials and labor for complete basement finishing.',
    },
    {
      id: 'bid-2',
      jobId: 'job-5',
      jobTitle: 'Roof Repair',
      bidAmount: '$2,400',
      bidDate: '2023-04-18',
      status: 'Under Review',
      customerName: 'Jennifer Davis',
      notes: 'Repair of damaged shingles and flashing around chimney.',
    },
  ];

  // Mock data for awarded jobs
  const awardedJobs = [
    {
      id: 'awarded-1',
      jobId: 'job-6',
      jobTitle: 'Kitchen Backsplash Installation',
      bidAmount: '$850',
      startDate: '2023-05-02',
      customerName: 'Michael Thompson',
      status: 'In Progress',
      paymentStatus: 'Deposit Received',
    },
  ];

  return (
    <div
      className={`p-4 md:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Vendor Dashboard</h2>
        <Link to='/vendor-dashboard/jobs/search'>
          <Button className='bg-bojj-primary hover:bg-bojj-primary/90'>
            <Search className='mr-2 h-4 w-4' />
            Find Jobs
          </Button>
        </Link>
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
            <p
              className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {availableJobs.length}
            </p>
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
            <p
              className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {activeBids.length}
            </p>
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
            <p
              className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              {awardedJobs.length}
            </p>
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
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
            {availableJobs.map((job) => (
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
                        {job.location} • {job.distance}
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
                        {job.budget}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Posted On
                      </p>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {job.postedDate}
                      </p>
                    </div>
                  </div>

                  <div className='flex space-x-3 mt-4'>
                    <Link
                      to={`/vendor-dashboard/bids/${job.id}/view`}
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
        </TabsContent>

        <TabsContent value='bids' className='mt-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
            {activeBids.map((bid) => (
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
                        {bid.jobTitle}
                      </CardTitle>
                      <CardDescription
                        className={`mt-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Bid submitted on {bid.bidDate}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className={
                        bid.status === 'Under Review'
                          ? theme === 'dark'
                            ? 'bg-blue-900/20 text-blue-300 border-blue-700'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                          : theme === 'dark'
                          ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
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
                        {bid.bidAmount}
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
                        {bid.customerName}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mb-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {bid.notes}
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
                        bid.jobId
                      }&client=${encodeURIComponent(bid.customerName)}`}
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
        </TabsContent>

        <TabsContent value='awarded' className='mt-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
            {awardedJobs.map((job) => (
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
                        {job.jobTitle}
                      </CardTitle>
                      <CardDescription
                        className={`mt-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Starting on {job.startDate}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className={`${
                        theme === 'dark'
                          ? 'bg-purple-900/20 text-purple-300 border-purple-700'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {job.status}
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
                        Contract Amount
                      </p>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {job.bidAmount}
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
                        {job.customerName}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Payment Status
                      </p>
                      <p
                        className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {job.paymentStatus}
                      </p>
                    </div>
                  </div>

                  <div className='flex space-x-3 mt-4'>
                    <Link
                      to={`/vendor-dashboard/bids/${job.id}/view`}
                      className='flex-1 min-w-0'
                    >
                      <Button variant='outline' className='w-full'>
                        View Details
                      </Button>
                    </Link>

                    <Link
                      to={`/vendor-dashboard/messages?jobId=${
                        job.jobId
                      }&client=${encodeURIComponent(job.customerName)}`}
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
                  $3,850
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
                  $1,200
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
                  4.8/5
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
