import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Briefcase,
  Star,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Eye,
  BarChart,
  LineChart,
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  activeUsers: number;
  userGrowth: number;
  completedJobs: number;
  jobSuccessRate: number;
  platformHealth: number;
  uptime: number;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
    growth: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    timestamp: string;
    status: string;
  }>;
  monthlyStats: Array<{
    month: string;
    revenue: number;
    jobs: number;
    users: number;
  }>;
}

const AnalyticsReports: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    revenueGrowth: 0,
    activeUsers: 0,
    userGrowth: 0,
    completedJobs: 0,
    jobSuccessRate: 0,
    platformHealth: 0,
    uptime: 0,
    topCategories: [],
    recentActivity: [],
    monthlyStats: [],
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState('revenue');

  // Mock data for fallback
  const mockAnalyticsData: AnalyticsData = {
    totalRevenue: 1250000,
    revenueGrowth: 12.5,
    activeUsers: 2847,
    userGrowth: 8.3,
    completedJobs: 1247,
    jobSuccessRate: 94.2,
    platformHealth: 98.5,
    uptime: 99.9,
    topCategories: [
      { name: 'Web Development', count: 156, revenue: 450000, growth: 15.2 },
      { name: 'Mobile Development', count: 98, revenue: 320000, growth: 22.1 },
      { name: 'Graphic Design', count: 134, revenue: 280000, growth: 8.7 },
      { name: 'Content Writing', count: 87, revenue: 120000, growth: 12.3 },
      { name: 'Digital Marketing', count: 76, revenue: 180000, growth: 18.9 },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'payment',
        description: 'Payment released for E-commerce Website',
        amount: 45000,
        timestamp: '2024-01-21T10:30:00Z',
        status: 'completed',
      },
      {
        id: '2',
        type: 'job',
        description: 'New job posted: Mobile App Development',
        amount: 35000,
        timestamp: '2024-01-21T09:15:00Z',
        status: 'active',
      },
      {
        id: '3',
        type: 'user',
        description: 'New vendor registered: Ahmed Khan',
        timestamp: '2024-01-21T08:45:00Z',
        status: 'pending',
      },
      {
        id: '4',
        type: 'payment',
        description: 'Payment approved for Logo Design',
        amount: 18000,
        timestamp: '2024-01-21T08:00:00Z',
        status: 'in_escrow',
      },
      {
        id: '5',
        type: 'job',
        description: 'Job completed: Content Writing Project',
        amount: 12000,
        timestamp: '2024-01-21T07:30:00Z',
        status: 'completed',
      },
    ],
    monthlyStats: [
      { month: 'Jan 2024', revenue: 125000, jobs: 156, users: 2847 },
      { month: 'Dec 2023', revenue: 118000, jobs: 142, users: 2689 },
      { month: 'Nov 2023', revenue: 112000, jobs: 138, users: 2547 },
      { month: 'Oct 2023', revenue: 108000, jobs: 134, users: 2412 },
      { month: 'Sep 2023', revenue: 102000, jobs: 128, users: 2289 },
      { month: 'Aug 2023', revenue: 98000, jobs: 122, users: 2178 },
    ],
  };

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/analytics?period=${analyticsPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data as fallback
      setAnalyticsData(mockAnalyticsData);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load analytics on component mount and when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [analyticsPeriod]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className='h-4 w-4' />;
      case 'job':
        return <Briefcase className='h-4 w-4' />;
      case 'user':
        return <Users className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'active':
        return 'secondary';
      case 'pending':
        return 'secondary';
      case 'in_escrow':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Analytics & Reports
          </h3>
          <p className='text-sm text-gray-600'>
            View detailed reports and platform analytics
          </p>
        </div>
        <div className='flex gap-2'>
          <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7'>Last 7 days</SelectItem>
              <SelectItem value='30'>Last 30 days</SelectItem>
              <SelectItem value='90'>Last 90 days</SelectItem>
              <SelectItem value='365'>Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='sm' onClick={fetchAnalyticsData}>
            <RotateCcw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Revenue */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Total Revenue
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {analyticsLoading ? (
                    <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                  ) : (
                    formatCurrency(analyticsData.totalRevenue)
                  )}
                </p>
                <div className='flex items-center mt-2'>
                  {analyticsData.revenueGrowth > 0 ? (
                    <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
                  )}
                  <span
                    className={`text-sm ${
                      analyticsData.revenueGrowth > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(analyticsData.revenueGrowth)}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <DollarSign className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Active Users
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {analyticsLoading ? (
                    <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                  ) : (
                    analyticsData.activeUsers.toLocaleString()
                  )}
                </p>
                <div className='flex items-center mt-2'>
                  {analyticsData.userGrowth > 0 ? (
                    <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
                  )}
                  <span
                    className={`text-sm ${
                      analyticsData.userGrowth > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(analyticsData.userGrowth)}
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <Users className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Jobs */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Completed Jobs
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {analyticsLoading ? (
                    <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                  ) : (
                    analyticsData.completedJobs.toLocaleString()
                  )}
                </p>
                <div className='flex items-center mt-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600'>
                    {analyticsData.jobSuccessRate}% Success Rate
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Briefcase className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Platform Health
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {analyticsLoading ? (
                    <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                  ) : (
                    `${analyticsData.platformHealth}%`
                  )}
                </p>
                <div className='flex items-center mt-2'>
                  <Target className='h-4 w-4 text-blue-500 mr-1' />
                  <span className='text-sm text-blue-600'>
                    {analyticsData.uptime}% Uptime
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                <Award className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Revenue Trend</span>
              <div className='flex gap-2'>
                <Button
                  variant={selectedChart === 'revenue' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedChart('revenue')}
                >
                  <BarChart className='h-4 w-4 mr-2' />
                  Bar
                </Button>
                <Button
                  variant={selectedChart === 'revenue' ? 'outline' : 'default'}
                  size='sm'
                  onClick={() => setSelectedChart('revenue')}
                >
                  <LineChart className='h-4 w-4 mr-2' />
                  Line
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
              <div className='text-center'>
                <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-2' />
                <p className='text-gray-600'>Revenue Chart</p>
                <p className='text-sm text-gray-500'>
                  Chart visualization will be implemented here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {analyticsData.topCategories.map((category, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <span className='text-sm font-bold text-blue-600'>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {category.name}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {category.count} services
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-gray-900'>
                      {formatCurrency(category.revenue)}
                    </p>
                    <div className='flex items-center'>
                      {category.growth > 0 ? (
                        <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                      ) : (
                        <TrendingDown className='h-3 w-3 text-red-500 mr-1' />
                      )}
                      <span
                        className={`text-xs ${
                          category.growth > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(category.growth)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Recent Activity</span>
            <Button variant='outline' size='sm'>
              <Eye className='h-4 w-4 mr-2' />
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {analyticsData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className='flex items-center space-x-4 p-4 border border-gray-200 rounded-lg'
              >
                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                  {getActivityIcon(activity.type)}
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>
                    {activity.description}
                  </p>
                  <div className='flex items-center space-x-4 mt-1'>
                    <span className='text-sm text-gray-500'>
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    {activity.amount && (
                      <span className='text-sm font-medium text-gray-900'>
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(activity.status)}>
                  {activity.status.charAt(0).toUpperCase() +
                    activity.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Month
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Revenue
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Jobs
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Users
                  </th>
                  <th className='text-left py-3 px-4 font-medium text-gray-900'>
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyStats.map((stat, index) => {
                  const prevMonth = analyticsData.monthlyStats[index + 1];
                  const revenueGrowth = prevMonth
                    ? ((stat.revenue - prevMonth.revenue) / prevMonth.revenue) *
                      100
                    : 0;

                  return (
                    <tr key={index} className='border-b border-gray-100'>
                      <td className='py-3 px-4 font-medium text-gray-900'>
                        {stat.month}
                      </td>
                      <td className='py-3 px-4 text-gray-900'>
                        {formatCurrency(stat.revenue)}
                      </td>
                      <td className='py-3 px-4 text-gray-900'>{stat.jobs}</td>
                      <td className='py-3 px-4 text-gray-900'>
                        {stat.users.toLocaleString()}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center'>
                          {revenueGrowth > 0 ? (
                            <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                          ) : (
                            <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
                          )}
                          <span
                            className={`text-sm ${
                              revenueGrowth > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatPercentage(revenueGrowth)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsReports;
