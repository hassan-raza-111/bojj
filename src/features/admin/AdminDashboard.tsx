import React from 'react';
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
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Users',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Jobs',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: '$12.5K',
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Growth Rate',
      value: '18.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'CUSTOMER',
      status: 'active',
      date: '2 hours ago',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'VENDOR',
      status: 'pending',
      date: '4 hours ago',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'CUSTOMER',
      status: 'active',
      date: '6 hours ago',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'VENDOR',
      status: 'verified',
      date: '8 hours ago',
    },
  ];

  const recentJobs = [
    {
      id: 1,
      title: 'Website Development',
      customer: 'Tech Corp',
      budget: '$5,000',
      status: 'active',
      bids: 12,
    },
    {
      id: 2,
      title: 'Logo Design',
      customer: 'StartUp Inc',
      budget: '$800',
      status: 'completed',
      bids: 8,
    },
    {
      id: 3,
      title: 'Mobile App',
      customer: 'App Studio',
      budget: '$15,000',
      status: 'active',
      bids: 25,
    },
    {
      id: 4,
      title: 'Content Writing',
      customer: 'Blog Hub',
      budget: '$300',
      status: 'pending',
      bids: 5,
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High server load detected',
      time: '5 min ago',
    },
    {
      id: 2,
      type: 'info',
      message: 'Database backup completed',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'success',
      message: 'New user registration system updated',
      time: '2 hours ago',
    },
    {
      id: 4,
      type: 'error',
      message: 'Payment gateway timeout',
      time: '3 hours ago',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'verified':
        return <Badge className='bg-blue-100 text-blue-800'>Verified</Badge>;
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

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Welcome to Admin Dashboard</h1>
        <p className='text-blue-100'>
          Monitor and manage your platform. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='jobs'>Jobs</TabsTrigger>
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
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center justify-between p-3 rounded-lg border'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                          <span className='text-sm font-medium text-gray-600'>
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className='text-sm font-medium'>{user.name}</p>
                          <p className='text-xs text-gray-500'>{user.email}</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                  ))}
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
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className='flex items-center justify-between p-3 rounded-lg border'
                    >
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{job.title}</p>
                        <p className='text-xs text-gray-500'>{job.customer}</p>
                        <div className='flex items-center space-x-2 mt-1'>
                          <Badge variant='outline' className='text-xs'>
                            {job.budget}
                          </Badge>
                          <Badge variant='outline' className='text-xs'>
                            {job.bids} bids
                          </Badge>
                        </div>
                      </div>
                      <div className='ml-4'>{getStatusBadge(job.status)}</div>
                    </div>
                  ))}
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
              <p className='text-gray-500 text-center py-8'>
                User management interface will be implemented here
              </p>
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
              <p className='text-gray-500 text-center py-8'>
                Job management interface will be implemented here
              </p>
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
                  {systemAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className='flex items-center space-x-3 p-3 rounded-lg border'
                    >
                      {getAlertIcon(alert.type)}
                      <div className='flex-1'>
                        <p className='text-sm'>{alert.message}</p>
                        <p className='text-xs text-gray-500'>{alert.time}</p>
                      </div>
                    </div>
                  ))}
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
