import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users,
  Briefcase,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  Loader2,
} from 'lucide-react';
import {
  getDashboardStats,
  getSystemAnalytics,
  DashboardStats,
  SystemAnalytics,
  testBackendConnection,
} from '@/config/adminApi';
import { useToast } from '@/components/ui/use-toast';

const OverviewCard = ({
  icon,
  value,
  label,
  change,
  changeType = 'neutral',
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
}) => (
  <Card className='flex flex-col items-center justify-center py-6 px-2 sm:px-4 shadow hover:shadow-lg transition-shadow group w-full'>
    <CardHeader className='flex flex-col items-center p-0'>
      <div className='mb-2 text-primary group-hover:scale-110 transition-transform'>
        {icon}
      </div>
      <CardTitle className='text-2xl sm:text-3xl font-bold'>
        {value.toLocaleString()}
      </CardTitle>
      <CardDescription className='text-sm sm:text-base text-center'>
        {label}
      </CardDescription>
      {change !== undefined && (
        <div className='flex items-center mt-2'>
          <Badge
            variant={
              changeType === 'positive'
                ? 'default'
                : changeType === 'negative'
                ? 'destructive'
                : 'secondary'
            }
            className='text-xs'
          >
            {change > 0 ? '+' : ''}
            {change}%
          </Badge>
        </div>
      )}
    </CardHeader>
  </Card>
);

const RecentActivityItem = ({
  type,
  title,
  user,
  time,
  status,
}: {
  type: 'job' | 'payment';
  title: string;
  user: string;
  time: string;
  status: string;
}) => (
  <div className='flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'>
    <div
      className={`p-2 rounded-full ${
        type === 'job'
          ? 'bg-blue-100 text-blue-600'
          : 'bg-green-100 text-green-600'
      }`}
    >
      {type === 'job' ? (
        <Briefcase className='w-4 h-4' />
      ) : (
        <DollarSign className='w-4 h-4' />
      )}
    </div>
    <div className='flex-1 min-w-0'>
      <p className='text-sm font-medium text-foreground truncate'>{title}</p>
      <p className='text-xs text-muted-foreground'>by {user}</p>
    </div>
    <div className='text-right'>
      <p className='text-xs text-muted-foreground'>{time}</p>
      <Badge variant='outline' className='text-xs'>
        {status}
      </Badge>
    </div>
  </div>
);

const AnalyticsChart = ({ data, title }: { data: any[]; title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className='text-lg'>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className='space-y-3'>
        {data.map((item, index) => (
          <div key={index} className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              {item.category || item.date}
            </span>
            <div className='flex items-center space-x-2'>
              <div className='w-20 bg-muted rounded-full h-2'>
                <div
                  className='bg-primary h-2 rounded-full'
                  style={{
                    width: `${Math.min(
                      ((item._count?.id || item._count || 0) /
                        Math.max(
                          ...data.map((d) => d._count?.id || d._count || 0)
                        )) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className='text-sm font-medium'>
                {item._count?.id || item._count || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface DashboardOverviewProps {
  overviewStats: { label: string; value: number; icon: React.ReactNode }[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  overviewStats,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First test backend connection
        console.log('🧪 Testing backend connection...');
        const isBackendConnected = await testBackendConnection();
        setBackendStatus(isBackendConnected);
        console.log('🧪 Backend connected:', isBackendConnected);

        if (!isBackendConnected) {
          setError(
            'Backend server is not running. Please start the backend server.'
          );
          setLoading(false);
          return;
        }

        // If backend is connected, fetch data
        console.log('📊 Fetching dashboard stats...');
        const [statsData, analyticsData] = await Promise.all([
          getDashboardStats(),
          getSystemAnalytics(30),
        ]);

        console.log('📊 Stats data:', statsData);
        console.log('📊 Analytics data:', analyticsData);

        setStats(statsData);
        setAnalytics(analyticsData);
      } catch (err: any) {
        console.error('❌ Dashboard data fetch error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='animate-spin w-8 h-8 text-primary' />
        <span className='ml-2'>Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4'>
        <Card className='border-destructive'>
          <CardHeader>
            <CardTitle className='text-destructive'>Dashboard Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-destructive mb-4'>{error}</p>
            <div className='space-y-2'>
              <p>
                <strong>Backend Status:</strong>{' '}
                {backendStatus ? '✅ Connected' : '❌ Not Connected'}
              </p>
              <p>
                <strong>Backend URL:</strong>{' '}
                {process.env.VITE_BACKEND_URL || 'http://localhost:5000'}
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className='mt-4'>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats || !analytics) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>Failed to load dashboard data</p>
      </div>
    );
  }

  const enhancedStats = [
    {
      label: 'Total Vendors',
      value: stats.totalVendors,
      icon: <Users className='w-5 h-5' />,
      change: 12,
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: <Users className='w-5 h-5' />,
      change: 8,
    },
    {
      label: 'Active Jobs',
      value: stats.activeJobs,
      icon: <Briefcase className='w-5 h-5' />,
      change: 15,
    },
    {
      label: 'Total Revenue',
      value: stats.totalRevenue,
      icon: <DollarSign className='w-5 h-5' />,
      change: 23,
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingVendors,
      icon: <Clock className='w-5 h-5' />,
      change: -5,
    },
    {
      label: 'Completed Jobs',
      value: stats.completedJobs,
      icon: <CheckCircle className='w-5 h-5' />,
      change: 18,
    },
  ];

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='activity'>Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Overview Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
            {enhancedStats.map((stat) => (
              <OverviewCard
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                change={stat.change}
                changeType={
                  stat.change > 0
                    ? 'positive'
                    : stat.change < 0
                    ? 'negative'
                    : 'neutral'
                }
              />
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <Button variant='outline' className='h-20 flex-col'>
                  <Users className='w-6 h-6 mb-2' />
                  <span className='text-sm'>Review Vendors</span>
                </Button>
                <Button variant='outline' className='h-20 flex-col'>
                  <DollarSign className='w-6 h-6 mb-2' />
                  <span className='text-sm'>Payment Issues</span>
                </Button>
                <Button variant='outline' className='h-20 flex-col'>
                  <AlertCircle className='w-6 h-6 mb-2' />
                  <span className='text-sm'>Support Tickets</span>
                </Button>
                <Button variant='outline' className='h-20 flex-col'>
                  <Activity className='w-6 h-6 mb-2' />
                  <span className='text-sm'>System Health</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Top Categories */}
            <AnalyticsChart
              data={analytics.topCategories}
              title='Top Job Categories'
            />

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  User Growth (Last 30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      New Users
                    </span>
                    <span className='text-lg font-bold text-green-600'>
                      +{analytics.newUsers}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      New Jobs
                    </span>
                    <span className='text-lg font-bold text-blue-600'>
                      +{analytics.newJobs}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Completion Rate
                    </span>
                    <span className='text-lg font-bold text-purple-600'>
                      {analytics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Revenue Overview</CardTitle>
              <CardDescription>
                Last 30 days: ${analytics.totalRevenue.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-32 bg-muted rounded-lg flex items-center justify-center'>
                <span className='text-muted-foreground'>
                  Revenue Chart Visualization
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity' className='space-y-6'>
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {stats.recentActivity.recentJobs
                  .slice(0, 5)
                  .map((job, index) => (
                    <RecentActivityItem
                      key={index}
                      type='job'
                      title={job.title}
                      user={`${job.customer.firstName} ${job.customer.lastName}`}
                      time={new Date(job.createdAt).toLocaleDateString()}
                      status={job.status}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {stats.recentActivity.recentPayments
                  .slice(0, 5)
                  .map((payment, index) => (
                    <RecentActivityItem
                      key={index}
                      type='payment'
                      title={`$${payment.amount} - ${
                        payment.job?.title || 'Service Payment'
                      }`}
                      user={`${payment.customer.firstName} ${payment.customer.lastName}`}
                      time={new Date(payment.createdAt).toLocaleDateString()}
                      status={payment.status}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardOverview;
