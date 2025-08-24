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
// import { motion } from "framer-motion";
import { DollarSign, MessageSquare, Search, Star, Clock } from 'lucide-react';
import VendorLayout from '@/layouts/VendorLayout';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');

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

  const vendorDashboardContent = (
    <div className='p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Vendor Dashboard</h2>
        <Link to="/vendor-dashboard/jobs/search">
          <Button className="bg-bojj-primary hover:bg-bojj-primary/90">
            <Search className="mr-2 h-4 w-4" />
            Find Jobs
          </Button>
        </Link>
      </div> */}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
        <Card className='dark:bg-gray-950'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg font-medium'>
              Available Jobs
            </CardTitle>
            <CardDescription>Jobs matching your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{availableJobs.length}</p>
          </CardContent>
        </Card>

        <Card className='dark:bg-gray-950'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg font-medium'>Active Bids</CardTitle>
            <CardDescription>Submitted proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{activeBids.length}</p>
          </CardContent>
        </Card>

        <Card className='dark:bg-gray-950'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg font-medium'>Awarded Jobs</CardTitle>
            <CardDescription>Contracts in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{awardedJobs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Tabs */}
      <Tabs
        defaultValue='available'
        onValueChange={setActiveTab}
        className='mt-6'
      >
        <TabsList>
          <TabsTrigger value='available'>Available Jobs</TabsTrigger>
          <TabsTrigger value='bids'>My Bids</TabsTrigger>
          <TabsTrigger value='awarded'>Awarded Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value='available' className='mt-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
            {availableJobs.map((job) => (
              // <motion.div
              //   key={job.id}
              //   initial={{ opacity: 0, y: 10 }}
              //   animate={{ opacity: 1, y: 0 }}
              //   transition={{ duration: 0.3 }}
              // >
              <Card className='dark:bg-gray-950'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='min-w-0'>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className='mt-1'>
                        {job.location} • {job.distance}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className='bg-green-50 text-green-700 border-green-200'
                    >
                      {job.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className='text-gray-600 dark:text-gray-300 mb-4'>
                    {job.description}
                  </p>

                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div>
                      <p className='text-sm text-gray-500'>Budget</p>
                      <p className='font-medium'>{job.budget}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Posted On</p>
                      <p className='font-medium'>{job.postedDate}</p>
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
              // </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='bids' className='mt-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6'>
            {activeBids.map((bid) => (
              <Card key={bid.id} className='dark:bg-gray-950'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='min-w-0'>
                      <CardTitle>{bid.jobTitle}</CardTitle>
                      <CardDescription className='mt-1'>
                        Bid submitted on {bid.bidDate}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className={
                        bid.status === 'Under Review'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
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
                      <p className='text-sm text-gray-500'>Bid Amount</p>
                      <p className='font-medium'>{bid.bidAmount}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Customer</p>
                      <p className='font-medium'>{bid.customerName}</p>
                    </div>
                  </div>

                  <p className='text-gray-600 dark:text-gray-300 mb-4'>
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
              <Card key={job.id} className='dark:bg-gray-950'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='min-w-0'>
                      <CardTitle>{job.jobTitle}</CardTitle>
                      <CardDescription className='mt-1'>
                        Starting on {job.startDate}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className='bg-purple-50 text-purple-700 border-purple-200'
                    >
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div>
                      <p className='text-sm text-gray-500'>Contract Amount</p>
                      <p className='font-medium'>{job.bidAmount}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Customer</p>
                      <p className='font-medium'>{job.customerName}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Payment Status</p>
                      <p className='font-medium'>{job.paymentStatus}</p>
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
      <Card className='mt-8 dark:bg-gray-950'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Your financial summary</CardDescription>
          </div>
          <Link to='/vendor-dashboard/earnings'>
            <Button variant='ghost'>View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-green-100 p-3 rounded-full'>
                <DollarSign className='h-6 w-6 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>This Month</p>
                <p className='text-2xl font-bold'>$3,850</p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='bg-blue-100 p-3 rounded-full'>
                <Clock className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Pending</p>
                <p className='text-2xl font-bold'>$1,200</p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='bg-purple-100 p-3 rounded-full'>
                <Star className='h-6 w-6 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Rating</p>
                <p className='text-2xl font-bold'>4.8/5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return <VendorLayout>{vendorDashboardContent}</VendorLayout>;
};

export default VendorDashboard;
