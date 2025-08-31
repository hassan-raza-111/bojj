import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  BarChart3,
  UserCheck,
  UserPlus,
  CreditCard,
  HeadphonesIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  getDashboardStats,
  getSystemAnalytics,
  getAllVendors,
  getAllCustomers,
  getAllJobs,
  getAllPayments,
  getAllSupportTickets,
  DashboardStats,
  SystemAnalytics,
  Vendor,
  Customer,
  Job,
  Payment,
  SupportTicket,
  formatCurrency,
  formatDate,
} from '@/config/adminApi';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData] = await Promise.all([
        getDashboardStats(),
        getSystemAnalytics(30),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab: string) => {
    try {
      switch (tab) {
        case 'users':
          const [vendorsData, customersData] = await Promise.all([
            getAllVendors('', '', 1, 5),
            getAllCustomers('', '', 1, 5),
          ]);
          setVendors(vendorsData.data.vendors || []);
          setCustomers(customersData.data.customers || []);
          break;
        case 'jobs':
          const jobsData = await getAllJobs({ page: 1, limit: 5 });
          setJobs(jobsData.data.jobs || []);
          break;
        case 'payments':
          const paymentsData = await getAllPayments('', '', 1, 5);
          setPayments(paymentsData.data.jobs || []);
          break;
        case 'system':
          const ticketsData = await getAllSupportTickets('', '', '', 1, 5);
          setTickets(ticketsData.data.jobs || []);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
      toast({
        title: 'Error',
        description: `Failed to fetch ${tab} data`,
        variant: 'destructive',
      });
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
    // Fetch initial tab data for the default tab
    fetchTabData('users');
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'verified':
        return <Badge className='bg-blue-100 text-blue-800'>Verified</Badge>;
      case 'suspended':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      case 'completed':
        return <Badge className='bg-green-100 text-green-800'>Completed</Badge>;
      case 'in_progress':
        return <Badge className='bg-blue-100 text-blue-800'>In Progress</Badge>;
      case 'open':
        return <Badge className='bg-orange-100 text-orange-800'>Open</Badge>;
      case 'closed':
        return <Badge className='bg-gray-100 text-gray-800'>Closed</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return (
          <Badge className='bg-purple-100 text-purple-800'>Customer</Badge>
        );
      case 'VENDOR':
        return (
          <Badge className='bg-emerald-100 text-emerald-800'>Vendor</Badge>
        );
      case 'ADMIN':
        return <Badge className='bg-blue-100 text-blue-800'>Admin</Badge>;
      default:
        return <Badge variant='outline'>{role}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className='h-4 w-4 text-yellow-600' />;
      case 'info':
        return <Activity className='h-4 w-4 text-blue-600' />;
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return <Activity className='h-4 w-4 text-gray-600' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='text-lg'>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold mb-2'>
              Welcome to Admin Dashboard
            </h1>
            <p className='text-blue-100'>
              Monitor and manage your platform. Here's what's happening today.
            </p>
          </div>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant='secondary'
            size='sm'
            className='bg-white/20 hover:bg-white/30 text-white border-white/30'
          >
            {refreshing ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <RefreshCw className='h-4 w-4 mr-2' />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total Users
              </CardTitle>
              <div className='p-2 rounded-lg bg-blue-50'>
                <Users className='h-4 w-4 text-blue-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(
                  (stats.totalVendors || 0) + (stats.totalCustomers || 0)
                ).toLocaleString()}
              </div>
              <p className='text-xs text-green-600'>+0% from last month</p>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Active Jobs
              </CardTitle>
              <div className='p-2 rounded-lg bg-green-50'>
                <Briefcase className='h-4 w-4 text-green-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(stats.activeJobs || 0).toLocaleString()}
              </div>
              <p className='text-xs text-green-600'>+0% from last month</p>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total Revenue
              </CardTitle>
              <div className='p-2 rounded-lg bg-purple-50'>
                <DollarSign className='h-4 w-4 text-purple-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.totalRevenue && stats.totalRevenue > 0
                  ? formatCurrency(stats.totalRevenue)
                  : '$0.00'}
              </div>
              <p className='text-xs text-green-600'>+0% from last month</p>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Pending Vendors
              </CardTitle>
              <div className='p-2 rounded-lg bg-orange-50'>
                <Clock className='h-4 w-4 text-orange-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(stats.pendingVendors || 0).toLocaleString()}
              </div>
              <p className='text-xs text-orange-600'>Need verification</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fallback Stats if no data */}
      {!stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total Users
              </CardTitle>
              <div className='p-2 rounded-lg bg-blue-50'>
                <Users className='h-4 w-4 text-blue-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-gray-500'>No data available</p>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Active Jobs
              </CardTitle>
              <div className='p-2 rounded-lg bg-green-50'>
                <Briefcase className='h-4 w-4 text-green-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-gray-500'>No data available</p>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total Revenue
              </CardTitle>
              <div className='p-2 rounded-lg bg-purple-50'>
                <DollarSign className='h-4 w-4 text-purple-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>$0.00</div>
              <p className='text-xs text-gray-500'>No data available</p>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Pending Vendors
              </CardTitle>
              <div className='p-2 rounded-lg bg-orange-50'>
                <Clock className='h-4 w-4 text-orange-600' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-gray-500'>No data available</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        defaultValue='overview'
        className='space-y-4'
        onValueChange={fetchTabData}
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='jobs'>Jobs</TabsTrigger>
          <TabsTrigger value='payments'>Payments</TabsTrigger>
          <TabsTrigger value='system'>System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Recent Users
                </CardTitle>
                <CardDescription>
                  Latest user registrations and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {(vendors && vendors.length > 0) ||
                  (customers && customers.length > 0) ? (
                    [
                      ...(vendors || []).slice(0, 2),
                      ...(customers || []).slice(0, 2),
                    ].map((user, index) => (
                      <div
                        key={user.id || index}
                        className='flex items-center justify-between p-3 rounded-lg border'
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                            <span className='text-sm font-medium text-gray-600'>
                              {user.firstName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className='text-sm font-medium'>
                              {user.firstName} {user.lastName}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            className={
                              (vendors || []).includes(user)
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }
                          >
                            {(vendors || []).includes(user)
                              ? 'Vendor'
                              : 'Customer'}
                          </Badge>
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-4 text-gray-500'>
                      No recent users available
                    </div>
                  )}
                </div>
                <Button className='w-full mt-4' variant='outline'>
                  View All Users
                </Button>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Briefcase className='h-5 w-5' />
                  Recent Jobs
                </CardTitle>
                <CardDescription>
                  Latest job postings and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {jobs && jobs.length > 0 ? (
                    (jobs || []).slice(0, 4).map((job) => (
                      <div
                        key={job.id}
                        className='flex items-center justify-between p-3 rounded-lg border'
                      >
                        <div className='flex-1'>
                          <p className='text-sm font-medium'>{job.title}</p>
                          <p className='text-xs text-gray-500'>
                            {job.customer.firstName} {job.customer.lastName}
                          </p>
                          <div className='flex items-center space-x-2 mt-1'>
                            <Badge variant='outline' className='text-xs'>
                              {job.budget
                                ? formatCurrency(job.budget)
                                : 'Negotiable'}
                            </Badge>
                            <Badge variant='outline' className='text-xs'>
                              {job.bids?.length || 0} bids
                            </Badge>
                          </div>
                        </div>
                        <div className='ml-4'>{getStatusBadge(job.status)}</div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-4 text-gray-500'>
                      No recent jobs available
                    </div>
                  )}
                </div>
                <Button className='w-full mt-4' variant='outline'>
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value='users' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                User Management
              </CardTitle>
              <CardDescription>
                Manage all platform users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <UserPlus className='h-4 w-4' />
                  Add New User
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <UserCheck className='h-4 w-4' />
                  Verify Users
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  User Analytics
                </Button>
              </div>

              {/* Recent Users Table */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Recent Users</h3>
                <div className='space-y-2'>
                  {(vendors || []).slice(0, 3).map((vendor) => (
                    <div
                      key={vendor.id}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center'>
                          <span className='text-sm font-medium text-emerald-600'>
                            {vendor.firstName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium'>
                            {vendor.firstName} {vendor.lastName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {vendor.email}
                          </p>
                          <p className='text-xs text-gray-400'>
                            {vendor.vendorProfile?.companyName || 'No company'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {getRoleBadge('VENDOR')}
                        {getStatusBadge(vendor.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value='jobs' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Briefcase className='h-5 w-5' />
                Job Management
              </CardTitle>
              <CardDescription>
                Monitor and manage all platform jobs and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Activity className='h-4 w-4' />
                  Monitor Jobs
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Resolve Disputes
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Job Analytics
                </Button>
              </div>

              {/* Recent Jobs Table */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Recent Jobs</h3>
                <div className='space-y-2'>
                  {(jobs || []).slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>{job.title}</p>
                        <p className='text-sm text-gray-500'>
                          {job.customer.firstName} {job.customer.lastName}
                        </p>
                        <div className='flex items-center space-x-2 mt-1'>
                          <Badge variant='outline' className='text-xs'>
                            {job.category}
                          </Badge>
                          <Badge variant='outline' className='text-xs'>
                            {job.budget
                              ? formatCurrency(job.budget)
                              : 'Negotiable'}
                          </Badge>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {getStatusBadge(job.status)}
                        <Badge variant='outline' className='text-xs'>
                          {job.bids?.length || 0} bids
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value='payments' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Payment Management
              </CardTitle>
              <CardDescription>
                Monitor and manage all platform payments and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Activity className='h-4 w-4' />
                  Monitor Payments
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Resolve Issues
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Payment Analytics
                </Button>
              </div>

              {/* Recent Payments Table */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Recent Payments</h3>
                <div className='space-y-2'>
                  {payments && payments.length > 0 ? (
                    (payments || []).slice(0, 3).map((payment) => (
                      <div
                        key={payment.id}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div className='flex-1'>
                          <p className='font-medium'>
                            {payment.job?.title || 'General Payment'}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {payment.customer.firstName}{' '}
                            {payment.customer.lastName} →{' '}
                            {payment.vendor.firstName} {payment.vendor.lastName}
                          </p>
                          <div className='flex items-center space-x-2 mt-1'>
                            <Badge variant='outline' className='text-xs'>
                              {formatCurrency(payment.amount)}
                            </Badge>
                            <Badge variant='outline' className='text-xs'>
                              {payment.method}
                            </Badge>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(payment.status)}
                          <Badge variant='outline' className='text-xs'>
                            {formatDate(payment.createdAt)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500 text-center py-8'>
                      No payments data available
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value='system' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5' />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Current system status and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {stats?.recentActivity?.recentPayments
                    ?.slice(0, 4)
                    .map((payment: any) => (
                      <div
                        key={payment.id}
                        className='flex items-center space-x-3 p-3 rounded-lg border'
                      >
                        {getAlertIcon(payment.type || 'info')}
                        <div className='flex-1'>
                          <p className='text-sm'>
                            {payment.message || 'Payment processed'}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {payment.time || 'Just now'}
                          </p>
                        </div>
                      </div>
                    )) || (
                    <div className='text-center py-4 text-gray-500'>
                      No system alerts available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <CreditCard className='h-4 w-4' />
                    Payments
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <HeadphonesIcon className='h-4 w-4' />
                    Support
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <BarChart3 className='h-4 w-4' />
                    Analytics
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <Star className='h-4 w-4' />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
