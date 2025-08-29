import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Briefcase,
  Activity,
  Calendar,
  MapPin,
  Star,
  Eye,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  BarChart,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for demonstration
  const analyticsData = {
    overview: {
      totalUsers: 1247,
      totalJobs: 1089,
      totalRevenue: 1250000,
      successRate: 94.2,
      growthRate: 18.2,
      activeUsers: 1089,
      pendingJobs: 89,
      completedJobs: 856,
      failedJobs: 23,
    },
    trends: {
      users: [
        { month: 'Jan', value: 1200, growth: 5.2 },
        { month: 'Feb', value: 1250, growth: 4.2 },
        { month: 'Mar', value: 1300, growth: 4.0 },
        { month: 'Apr', value: 1350, growth: 3.8 },
        { month: 'May', value: 1400, growth: 3.7 },
        { month: 'Jun', value: 1450, growth: 3.6 },
      ],
      revenue: [
        { month: 'Jan', value: 100000, growth: 8.5 },
        { month: 'Feb', value: 110000, growth: 10.0 },
        { month: 'Mar', value: 115000, growth: 4.5 },
        { month: 'Apr', value: 120000, growth: 4.3 },
        { month: 'May', value: 122000, growth: 1.7 },
        { month: 'Jun', value: 125000, growth: 2.5 },
      ],
      jobs: [
        { month: 'Jan', value: 950, growth: 6.7 },
        { month: 'Feb', value: 980, growth: 3.2 },
        { month: 'Mar', value: 1020, growth: 4.1 },
        { month: 'Apr', value: 1050, growth: 2.9 },
        { month: 'May', value: 1070, growth: 1.9 },
        { month: 'Jun', value: 1089, growth: 1.8 },
      ],
    },
    categories: [
      { name: 'Web Development', jobs: 245, revenue: 450000, growth: 12.5 },
      { name: 'Mobile Development', jobs: 189, revenue: 380000, growth: 8.7 },
      { name: 'Design', jobs: 156, revenue: 180000, growth: 15.2 },
      { name: 'Content Writing', jobs: 134, revenue: 95000, growth: 6.8 },
      { name: 'Marketing', jobs: 98, revenue: 85000, growth: 11.3 },
      { name: 'Other', jobs: 267, revenue: 70000, growth: 4.2 },
    ],
    topPerformers: [
      { name: 'Tech Solutions Inc', revenue: 125000, jobs: 45, rating: 4.9 },
      { name: 'Design Studio Pro', revenue: 98000, jobs: 38, rating: 4.8 },
      { name: 'Mobile Apps Pro', revenue: 87000, jobs: 32, rating: 4.7 },
      { name: 'Content Creators', revenue: 65000, jobs: 28, rating: 4.6 },
      { name: 'Web Masters', revenue: 58000, jobs: 25, rating: 4.5 },
    ],
    userEngagement: {
      dailyActive: 456,
      weeklyActive: 892,
      monthlyActive: 1089,
      retentionRate: 87.3,
      avgSessionTime: '12m 34s',
      bounceRate: 23.1,
    },
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className='h-4 w-4 text-green-600' />;
    } else {
      return <ArrowDownRight className='h-4 w-4 text-red-600' />;
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'failed':
        return <XCircle className='h-4 w-4 text-red-600' />;
      default:
        return <Activity className='h-4 w-4 text-gray-600' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Analytics & Reports</h1>
        <p className='text-blue-100'>
          Comprehensive insights into platform performance and user behavior
        </p>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Time Range' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7d'>Last 7 Days</SelectItem>
                  <SelectItem value='30d'>Last 30 Days</SelectItem>
                  <SelectItem value='90d'>Last 90 Days</SelectItem>
                  <SelectItem value='1y'>Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  <SelectItem value='web'>Web Development</SelectItem>
                  <SelectItem value='mobile'>Mobile Development</SelectItem>
                  <SelectItem value='design'>Design</SelectItem>
                  <SelectItem value='content'>Content Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' className='flex items-center gap-2'>
                <Download className='h-4 w-4' />
                Export Report
              </Button>
              <Button className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
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
              {analyticsData.overview.totalUsers.toLocaleString()}
            </div>
            <div className='flex items-center gap-1 text-xs text-green-600'>
              <ArrowUpRight className='h-3 w-3' />+
              {analyticsData.overview.growthRate}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Revenue
            </CardTitle>
            <div className='p-2 rounded-lg bg-green-50'>
              <DollarSign className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(analyticsData.overview.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className='flex items-center gap-1 text-xs text-green-600'>
              <ArrowUpRight className='h-3 w-3' />
              +25% from last month
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Active Jobs
            </CardTitle>
            <div className='p-2 rounded-lg bg-purple-50'>
              <Briefcase className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analyticsData.overview.totalJobs.toLocaleString()}
            </div>
            <div className='flex items-center gap-1 text-xs text-green-600'>
              <ArrowUpRight className='h-3 w-3' />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Success Rate
            </CardTitle>
            <div className='p-2 rounded-lg bg-orange-50'>
              <Target className='h-4 w-4 text-orange-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analyticsData.overview.successRate}%
            </div>
            <div className='flex items-center gap-1 text-xs text-green-600'>
              <ArrowUpRight className='h-3 w-3' />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='engagement'>Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Job Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Job Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status of all platform jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-green-50'>
                    <div className='flex items-center gap-3'>
                      <CheckCircle className='h-5 w-5 text-green-600' />
                      <span className='font-medium'>Completed</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-bold'>
                        {analyticsData.overview.completedJobs}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {(
                          (analyticsData.overview.completedJobs /
                            analyticsData.overview.totalJobs) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-blue-50'>
                    <div className='flex items-center gap-3'>
                      <Activity className='h-5 w-5 text-blue-600' />
                      <span className='font-medium'>Active</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-bold'>
                        {analyticsData.overview.pendingJobs}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {(
                          (analyticsData.overview.pendingJobs /
                            analyticsData.overview.totalJobs) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-red-50'>
                    <div className='flex items-center gap-3'>
                      <XCircle className='h-5 w-5 text-red-600' />
                      <span className='font-medium'>Failed</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-bold'>
                        {analyticsData.overview.failedJobs}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {(
                          (analyticsData.overview.failedJobs /
                            analyticsData.overview.totalJobs) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Activity Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  User Activity Metrics
                </CardTitle>
                <CardDescription>
                  Platform engagement and retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-3 rounded-lg bg-blue-50'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {analyticsData.userEngagement.dailyActive}
                      </div>
                      <div className='text-sm text-gray-600'>Daily Active</div>
                    </div>
                    <div className='text-center p-3 rounded-lg bg-green-50'>
                      <div className='text-2xl font-bold text-green-600'>
                        {analyticsData.userEngagement.weeklyActive}
                      </div>
                      <div className='text-sm text-gray-600'>Weekly Active</div>
                    </div>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-purple-50'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {analyticsData.userEngagement.retentionRate}%
                    </div>
                    <div className='text-sm text-gray-600'>Retention Rate</div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-3 rounded-lg bg-orange-50'>
                      <div className='text-lg font-bold text-orange-600'>
                        {analyticsData.userEngagement.avgSessionTime}
                      </div>
                      <div className='text-sm text-gray-600'>Avg Session</div>
                    </div>
                    <div className='text-center p-3 rounded-lg bg-red-50'>
                      <div className='text-lg font-bold text-red-600'>
                        {analyticsData.userEngagement.bounceRate}%
                      </div>
                      <div className='text-sm text-gray-600'>Bounce Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Users Trend */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Users Growth
                </CardTitle>
                <CardDescription>
                  Monthly user registration trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {analyticsData.trends.users.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <span className='text-sm font-medium'>{item.month}</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold'>
                          {item.value.toLocaleString()}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-xs ${getGrowthColor(
                            item.growth
                          )}`}
                        >
                          {getGrowthIcon(item.growth)}
                          {item.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Revenue Growth
                </CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {analyticsData.trends.revenue.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <span className='text-sm font-medium'>{item.month}</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold'>
                          ${(item.value / 1000).toFixed(0)}K
                        </span>
                        <div
                          className={`flex items-center gap-1 text-xs ${getGrowthColor(
                            item.growth
                          )}`}
                        >
                          {getGrowthIcon(item.growth)}
                          {item.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Jobs Trend */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Briefcase className='h-5 w-5' />
                  Jobs Growth
                </CardTitle>
                <CardDescription>Monthly job posting trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {analyticsData.trends.jobs.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <span className='text-sm font-medium'>{item.month}</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold'>
                          {item.value.toLocaleString()}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-xs ${getGrowthColor(
                            item.growth
                          )}`}
                        >
                          {getGrowthIcon(item.growth)}
                          {item.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='categories' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart className='h-5 w-5' />
                Category Performance
              </CardTitle>
              <CardDescription>
                Job categories by volume, revenue, and growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {analyticsData.categories.map((category, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 rounded-lg border'
                  >
                    <div className='flex-1'>
                      <div className='font-medium'>{category.name}</div>
                      <div className='text-sm text-gray-500'>
                        {category.jobs} jobs • $
                        {(category.revenue / 1000).toFixed(0)}K revenue
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <div className='font-bold'>{category.jobs}</div>
                        <div className='text-sm text-gray-500'>Jobs</div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold'>
                          ${(category.revenue / 1000).toFixed(0)}K
                        </div>
                        <div className='text-sm text-gray-500'>Revenue</div>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm ${getGrowthColor(
                          category.growth
                        )}`}
                      >
                        {getGrowthIcon(category.growth)}
                        {category.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='performance' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Award className='h-5 w-5' />
                Top Performing Vendors
              </CardTitle>
              <CardDescription>
                Vendors with highest revenue and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {analyticsData.topPerformers.map((vendor, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 rounded-lg border'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold'>
                        {index + 1}
                      </div>
                      <div>
                        <div className='font-medium'>{vendor.name}</div>
                        <div className='text-sm text-gray-500'>
                          {vendor.jobs} jobs completed
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-6'>
                      <div className='text-right'>
                        <div className='font-bold'>
                          ${(vendor.revenue / 1000).toFixed(0)}K
                        </div>
                        <div className='text-sm text-gray-500'>Revenue</div>
                      </div>
                      <div className='text-right'>
                        <div className='flex items-center gap-1'>
                          <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                          <span className='font-bold'>{vendor.rating}</span>
                        </div>
                        <div className='text-sm text-gray-500'>Rating</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='engagement' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* User Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <LineChart className='h-5 w-5' />
                  User Engagement Trends
                </CardTitle>
                <CardDescription>
                  Daily, weekly, and monthly active users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50'>
                    <div className='text-3xl font-bold text-blue-600'>
                      {analyticsData.userEngagement.monthlyActive}
                    </div>
                    <div className='text-lg text-blue-600'>
                      Monthly Active Users
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-4 rounded-lg bg-green-50'>
                      <div className='text-xl font-bold text-green-600'>
                        {analyticsData.userEngagement.weeklyActive}
                      </div>
                      <div className='text-sm text-green-600'>
                        Weekly Active
                      </div>
                    </div>
                    <div className='text-center p-4 rounded-lg bg-purple-50'>
                      <div className='text-xl font-bold text-purple-600'>
                        {analyticsData.userEngagement.dailyActive}
                      </div>
                      <div className='text-sm text-purple-600'>
                        Daily Active
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-green-50'>
                    <span className='font-medium'>Retention Rate</span>
                    <span className='font-bold text-green-600'>
                      {analyticsData.userEngagement.retentionRate}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-blue-50'>
                    <span className='font-medium'>Avg Session Time</span>
                    <span className='font-bold text-blue-600'>
                      {analyticsData.userEngagement.avgSessionTime}
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-red-50'>
                    <span className='font-medium'>Bounce Rate</span>
                    <span className='font-bold text-red-600'>
                      {analyticsData.userEngagement.bounceRate}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-purple-50'>
                    <span className='font-medium'>Success Rate</span>
                    <span className='font-bold text-purple-600'>
                      {analyticsData.overview.successRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
