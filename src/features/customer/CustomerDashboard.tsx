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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'DISPUTED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4 mb-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Customer Dashboard
            </h1>
            <p className='text-gray-600'>
              Welcome back, {user?.firstName || 'Customer'}!
            </p>
          </div>
          <Link to='/customer/jobs/new'>
            <Button className='bg-bojj-primary hover:bg-bojj-primary/90'>
              <PlusCircle className='mr-2 h-4 w-4' />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      <div className='px-6'>
        {/* Loading State */}
        {loading && (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-bojj-primary' />
            <span className='ml-2 text-gray-600'>Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-400 mr-2' />
              <p className='text-red-800'>{error}</p>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={fetchDashboard}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg font-medium flex items-center'>
                <Briefcase className='h-5 w-5 mr-2 text-blue-600' />
                Total Jobs
              </CardTitle>
              <CardDescription>All your posted jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-bold text-blue-600'>
                {stats?.totalJobs || jobs.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg font-medium flex items-center'>
                <TrendingUp className='h-5 w-5 mr-2 text-green-600' />
                Active Jobs
              </CardTitle>
              <CardDescription>Currently open for bids</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-bold text-green-600'>
                {stats?.activeJobs || activeJobs.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg font-medium flex items-center'>
                <Users className='h-5 w-5 mr-2 text-purple-600' />
                Total Bids
              </CardTitle>
              <CardDescription>Across all your jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-bold text-purple-600'>
                {stats?.totalBids || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg font-medium flex items-center'>
                <CheckCircle className='h-5 w-5 mr-2 text-indigo-600' />
                Completed Jobs
              </CardTitle>
              <CardDescription>Successfully finished</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-bold text-indigo-600'>
                {stats?.completedJobs || completedJobs.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List with Tabs */}
        <Tabs
          defaultValue='overview'
          onValueChange={setActiveTab}
          className='mt-6'
        >
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='active'>Active Jobs</TabsTrigger>
            <TabsTrigger value='completed'>Completed Jobs</TabsTrigger>
            <TabsTrigger value='all'>All Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Recent Active Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Clock className='h-5 w-5 mr-2 text-green-600' />
                    Recent Active Jobs
                  </CardTitle>
                  <CardDescription>Your latest job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeJobs.length === 0 ? (
                    <p className='text-gray-500 text-center py-4'>
                      No active jobs found
                    </p>
                  ) : (
                    <div className='space-y-4'>
                      {activeJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className='border rounded-lg p-3'>
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-medium'>{job.title}</h4>
                            <Badge
                              variant='outline'
                              className={getStatusBadge(job.status)}
                            >
                              {getStatusText(job.status)}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                            {job.description}
                          </p>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>
                              {formatBudget(job.budget)}
                            </span>
                            <span className='text-gray-500'>
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
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <CheckCircle className='h-5 w-5 mr-2 text-indigo-600' />
                    Recent Completed Jobs
                  </CardTitle>
                  <CardDescription>
                    Successfully finished projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedJobs.length === 0 ? (
                    <p className='text-gray-500 text-center py-4'>
                      No completed jobs found
                    </p>
                  ) : (
                    <div className='space-y-4'>
                      {completedJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className='border rounded-lg p-3'>
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-medium'>{job.title}</h4>
                            <Badge
                              variant='outline'
                              className={getStatusBadge(job.status)}
                            >
                              {getStatusText(job.status)}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                            {job.description}
                          </p>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-500'>
                              {formatBudget(job.budget)}
                            </span>
                            {job.assignedVendor && (
                              <span className='text-gray-500'>
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

          <TabsContent value='active' className='mt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {activeJobs.length === 0 ? (
                <div className='col-span-2 text-center py-8'>
                  <Briefcase className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No Active Jobs
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    You haven't posted any jobs yet.
                  </p>
                  <Link to='/customer/jobs/new'>
                    <Button className='bg-bojj-primary hover:bg-bojj-primary/90'>
                      <PlusCircle className='mr-2 h-4 w-4' />
                      Post Your First Job
                    </Button>
                  </Link>
                </div>
              ) : (
                activeJobs.map((job) => (
                  <Card
                    key={job.id}
                    className='hover:shadow-lg transition-shadow'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle className='text-lg'>{job.title}</CardTitle>
                          <CardDescription className='mt-1'>
                            Posted on {formatDate(job.createdAt)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant='outline'
                          className={getStatusBadge(job.status)}
                        >
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className='text-gray-600 mb-4 line-clamp-3'>
                        {job.description}
                      </p>

                      <div className='grid grid-cols-2 gap-4 mb-4'>
                        <div>
                          <p className='text-sm text-gray-500'>Budget</p>
                          <p className='font-medium text-green-600'>
                            {formatBudget(job.budget)}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-500'>Bids Received</p>
                          <p className='font-medium text-blue-600'>
                            {job._count?.bids || 0}
                          </p>
                        </div>
                      </div>

                      <div className='flex space-x-3 mt-4'>
                        <Link
                          to={`/customer/jobs/${job.id}`}
                          className='flex-1'
                        >
                          <Button variant='outline' className='w-full'>
                            View Details
                          </Button>
                        </Link>

                        <Link
                          to={`/customer/jobs/${job.id}/bids`}
                          className='flex-1'
                        >
                          <Button className='w-full bg-bojj-primary hover:bg-bojj-primary/90'>
                            Review Bids ({job._count?.bids || 0})
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
                <div className='col-span-2 text-center py-8'>
                  <CheckCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No Completed Jobs
                  </h3>
                  <p className='text-gray-500'>
                    Your completed jobs will appear here.
                  </p>
                </div>
              ) : (
                completedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className='hover:shadow-lg transition-shadow'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle className='text-lg'>{job.title}</CardTitle>
                          <CardDescription className='mt-1'>
                            Completed on {formatDate(job.updatedAt)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant='outline'
                          className={getStatusBadge(job.status)}
                        >
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className='text-gray-600 mb-4 line-clamp-3'>
                        {job.description}
                      </p>

                      <div className='grid grid-cols-2 gap-4 mb-4'>
                        <div>
                          <p className='text-sm text-gray-500'>Budget</p>
                          <p className='font-medium text-green-600'>
                            {formatBudget(job.budget)}
                          </p>
                        </div>
                        {job.assignedVendor && (
                          <div>
                            <p className='text-sm text-gray-500'>Vendor</p>
                            <p className='font-medium text-blue-600'>
                              {job.assignedVendor.firstName}{' '}
                              {job.assignedVendor.lastName}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className='flex space-x-3 mt-4'>
                        <Link
                          to={`/customer/jobs/${job.id}`}
                          className='flex-1'
                        >
                          <Button variant='outline' className='w-full'>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value='all' className='mt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {allJobs.length === 0 ? (
                <div className='col-span-2 text-center py-8'>
                  <Briefcase className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No Jobs Found
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    Start by posting your first job.
                  </p>
                  <Link to='/customer/jobs/new'>
                    <Button className='bg-bojj-primary hover:bg-bojj-primary/90'>
                      <PlusCircle className='mr-2 h-4 w-4' />
                      Post New Job
                    </Button>
                  </Link>
                </div>
              ) : (
                allJobs.map((job) => (
                  <Card
                    key={job.id}
                    className='hover:shadow-lg transition-shadow'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <CardTitle className='text-lg'>{job.title}</CardTitle>
                          <CardDescription className='mt-1'>
                            {job.status === 'COMPLETED'
                              ? `Completed on ${formatDate(job.updatedAt)}`
                              : `Posted on ${formatDate(job.createdAt)}`}
                          </CardDescription>
                        </div>
                        <Badge
                          variant='outline'
                          className={getStatusBadge(job.status)}
                        >
                          {getStatusText(job.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className='text-gray-600 mb-4 line-clamp-3'>
                        {job.description}
                      </p>

                      <div className='grid grid-cols-2 gap-4 mb-4'>
                        <div>
                          <p className='text-sm text-gray-500'>Budget</p>
                          <p className='font-medium text-green-600'>
                            {formatBudget(job.budget)}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-500'>Bids</p>
                          <p className='font-medium text-blue-600'>
                            {job._count?.bids || 0}
                          </p>
                        </div>
                      </div>

                      <Link to={`/customer/jobs/${job.id}`}>
                        <Button variant='outline' className='w-full'>
                          View Details
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
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Clock className='h-5 w-5 mr-2 text-bojj-primary' />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates on your jobs and bids
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className='text-gray-500 text-center py-4'>
                No recent activity
              </p>
            ) : (
              <ul className='space-y-4'>
                {activeJobs.slice(0, 3).map((job) => (
                  <li key={job.id} className='flex items-start gap-4'>
                    <div className='bg-bojj-primary/10 p-2 rounded-full'>
                      <Briefcase className='h-4 w-4 text-bojj-primary' />
                    </div>
                    <div>
                      <p className='font-medium'>Job "{job.title}" is active</p>
                      <p className='text-sm text-gray-500'>
                        {job._count?.bids || 0} bids received • Posted{' '}
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
                {completedJobs.slice(0, 2).map((job) => (
                  <li key={job.id} className='flex items-start gap-4'>
                    <div className='bg-green-100 p-2 rounded-full'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <p className='font-medium'>Job "{job.title}" completed</p>
                      <p className='text-sm text-gray-500'>
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
