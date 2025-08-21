import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  Layers,
  LogOut,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Menu,
  FileText,
  Settings,
  BarChart3,
  Search,
  Bell,
  User,
  TrendingUp,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Wallet,
  Target,
  Award,
  Lightbulb,
  Rocket,
  Heart,
  Eye,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Info,
  ChevronDown,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Minus,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Clean, professional color scheme
const colors = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600',
  info: 'bg-blue-500',
};

// Clean stat card component
const StatCard = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  loading = false,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: keyof typeof colors;
  loading?: boolean;
}) => (
  <Card className='border border-gray-200 hover:shadow-md transition-shadow'>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600 mb-1'>{title}</p>
          {loading ? (
            <div className='h-8 w-20 bg-gray-200 rounded animate-pulse'></div>
          ) : (
            <p className='text-2xl font-bold text-gray-900'>{value}</p>
          )}
          {change && (
            <div className='flex items-center mt-2'>
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 ${colors[color]} rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Clean activity item component
const ActivityItem = ({
  type,
  title,
  description,
  time,
  status,
  user,
}: {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  time: string;
  status: string;
  user: string;
}) => {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  };

  const config = statusConfig[type];
  const IconComponent = config.icon;

  return (
    <div className='flex items-start space-x-3 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors'>
      <div className={`p-2 rounded-full ${config.bg}`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-900'>{title}</p>
        <p className='text-sm text-gray-600 mt-1'>{description}</p>
        <div className='flex items-center mt-2 space-x-2 text-xs text-gray-500'>
          <span>{user}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
      <Badge variant='outline' className='text-xs'>
        {status}
      </Badge>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalCustomers: 0,
    totalJobs: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    activeJobs: 0,
    completedJobs: 0,
    monthlyGrowth: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const { toast } = useToast();

  // Vendor management states
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');

  // Customer management states
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');

  // Filtered vendors based on search and status
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.firstName
        ?.toLowerCase()
        .includes(vendorSearchQuery.toLowerCase()) ||
      vendor.lastName
        ?.toLowerCase()
        .includes(vendorSearchQuery.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
      vendor.vendorProfile?.companyName
        ?.toLowerCase()
        .includes(vendorSearchQuery.toLowerCase());

    const matchesStatus =
      vendorStatusFilter === 'all' ||
      (vendorStatusFilter === 'pending' && vendor.status === 'PENDING') ||
      (vendorStatusFilter === 'active' && vendor.status === 'ACTIVE') ||
      (vendorStatusFilter === 'suspended' && vendor.status === 'SUSPENDED');

    return matchesSearch && matchesStatus;
  });

  // Filtered customers based on search and status
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName
        ?.toLowerCase()
        .includes(customerSearchQuery.toLowerCase()) ||
      customer.lastName
        ?.toLowerCase()
        .includes(customerSearchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase());

    const matchesStatus =
      customerStatusFilter === 'all' ||
      (customerStatusFilter === 'active' && customer.status === 'ACTIVE') ||
      (customerStatusFilter === 'suspended' && customer.status === 'SUSPENDED');

    return matchesSearch && matchesStatus;
  });

  // Fetch vendors
  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/vendors');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVendors(
            data.data.map((vendor) => ({ ...vendor, actionLoading: false }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Use mock data as fallback
      setVendors([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@techsolutions.com',
          status: 'PENDING',
          avatar: null,
          vendorProfile: {
            companyName: 'Tech Solutions Inc',
            businessType: 'Technology',
            experience: 5,
            skills: ['Web Development', 'Mobile Development'],
            verified: false,
          },
          actionLoading: false,
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Smith',
          email: 'sarah@webdesign.com',
          status: 'ACTIVE',
          avatar: null,
          vendorProfile: {
            companyName: 'Web Design Pro',
            businessType: 'Design',
            experience: 3,
            skills: ['UI/UX Design', 'Graphic Design'],
            verified: true,
          },
          actionLoading: false,
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike@mobileapps.com',
          status: 'SUSPENDED',
          avatar: null,
          vendorProfile: {
            companyName: 'Mobile Apps Co',
            businessType: 'Technology',
            experience: 7,
            skills: ['iOS Development', 'Android Development'],
            verified: true,
          },
          actionLoading: false,
        },
      ]);
    } finally {
      setVendorsLoading(false);
    }
  };

  // Vendor management functions
  const handleApproveVendor = async (vendorId) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, actionLoading: true } : v))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${vendorId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: '✅ Vendor Approved',
          description: 'Vendor has been successfully approved',
        });
        fetchVendors(); // Refresh the list
      } else {
        throw new Error('Failed to approve vendor');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to approve vendor',
        variant: 'destructive',
      });
    }
  };

  const handleRejectVendor = async (vendorId) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, actionLoading: true } : v))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${vendorId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: '✅ Vendor Rejected',
          description: 'Vendor has been successfully rejected',
        });
        fetchVendors(); // Refresh the list
      } else {
        throw new Error('Failed to reject vendor');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to reject vendor',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVendorStatus = async (vendorId, newStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, actionLoading: true } : v))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${vendorId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast({
          title: `✅ Vendor ${
            newStatus === 'ACTIVE' ? 'Activated' : 'Suspended'
          }`,
          description: `Vendor status has been updated to ${newStatus}`,
        });
        fetchVendors(); // Refresh the list
      } else {
        throw new Error('Failed to update vendor status');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update vendor status',
        variant: 'destructive',
      });
    }
  };

  const handleViewVendor = (vendorId) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      toast({
        title: '👁️ Vendor Details',
        description: `Viewing details for ${vendor.firstName} ${vendor.lastName}`,
      });
      // TODO: Implement vendor detail modal or navigation
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomers(
            data.data.map((customer) => ({ ...customer, actionLoading: false }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use mock data as fallback
      setCustomers([
        {
          id: '1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          status: 'ACTIVE',
          avatar: null,
          customerProfile: {
            preferredCategories: ['Web Development', 'Design'],
            budgetRange: '$1000-$5000',
            totalJobsPosted: 5,
            totalSpent: 3500,
          },
          actionLoading: false,
        },
        {
          id: '2',
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@business.com',
          status: 'ACTIVE',
          avatar: null,
          customerProfile: {
            preferredCategories: ['Mobile Development', 'Marketing'],
            budgetRange: '$2000-$10000',
            totalJobsPosted: 12,
            totalSpent: 8500,
          },
          actionLoading: false,
        },
        {
          id: '3',
          firstName: 'Alice',
          lastName: 'Brown',
          email: 'alice@startup.com',
          status: 'SUSPENDED',
          avatar: null,
          customerProfile: {
            preferredCategories: ['UI/UX Design', 'Content Writing'],
            budgetRange: '$500-$2000',
            totalJobsPosted: 3,
            totalSpent: 1200,
          },
          actionLoading: false,
        },
      ]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Customer management functions
  const handleToggleCustomerStatus = async (customerId, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, actionLoading: true } : c))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/customers/${customerId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast({
          title: `✅ Customer ${
            newStatus === 'ACTIVE' ? 'Activated' : 'Suspended'
          }`,
          description: `Customer status has been updated to ${newStatus}`,
        });
        fetchCustomers(); // Refresh the list
      } else {
        throw new Error('Failed to update customer status');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update customer status',
        variant: 'destructive',
      });
    }
  };

  const handleViewCustomer = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      toast({
        title: '👁️ Customer Details',
        description: `Viewing details for ${customer.firstName} ${customer.lastName}`,
      });
      // TODO: Implement customer detail modal or navigation
    }
  };

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        toast({
          title: '✅ Backend Connected',
          description: 'Backend server is running successfully!',
        });
      } else {
        toast({
          title: '❌ Backend Error',
          description: `Backend error: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Connection Failed',
        description: 'Backend server is not running',
        variant: 'destructive',
      });
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchVendors();
    fetchCustomers();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await fetch(
        'http://localhost:5000/api/admin/dashboard/stats'
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Fetch recent activities
      const activitiesResponse = await fetch(
        'http://localhost:5000/api/admin/dashboard/analytics?period=30'
      );
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        if (activitiesData.success) {
          setRecentActivities(activitiesData.data.recentActivity || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data as fallback
      setStats({
        totalVendors: 156,
        totalCustomers: 892,
        totalJobs: 324,
        totalRevenue: 45678,
        pendingVendors: 23,
        activeJobs: 89,
        completedJobs: 235,
        monthlyGrowth: 12.5,
      });
      setRecentActivities([
        {
          type: 'success',
          title: 'New Vendor Approved',
          description: 'Tech Solutions Inc. has been verified and approved',
          time: '2 hours ago',
          status: 'Completed',
          user: 'John Admin',
        },
        {
          type: 'info',
          title: 'Payment Released',
          description:
            'Payment of $2,500 released for Website Development project',
          time: '4 hours ago',
          status: 'Processed',
          user: 'Sarah Manager',
        },
        {
          type: 'warning',
          title: 'Support Ticket Created',
          description:
            'New high-priority ticket from customer regarding payment',
          time: '6 hours ago',
          status: 'Pending',
          user: 'Mike Support',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='md:hidden'
            >
              <Menu className='h-5 w-5' />
            </Button>

            {/* Logo and Title */}
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <Rocket className='w-5 h-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  BOJJ Admin
                </h1>
                <p className='text-xs text-gray-500'>Platform Management</p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className='flex items-center space-x-3'>
            {/* Search */}
            <div className='relative hidden md:block'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>

            {/* Notifications */}
            <Button variant='ghost' size='sm' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
            </Button>

            {/* Test Backend */}
            <Button
              onClick={testBackend}
              variant='outline'
              size='sm'
              className='text-xs'
            >
              🧪 Test Backend
            </Button>

            {/* User Menu */}
            <div className='flex items-center space-x-2'>
              <Avatar className='w-8 h-8'>
                <AvatarImage src='/admin-avatar.jpg' />
                <AvatarFallback className='bg-blue-600 text-white text-sm font-medium'>
                  AD
                </AvatarFallback>
              </Avatar>
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-gray-900'>Admin User</p>
                <p className='text-xs text-gray-500'>Super Admin</p>
              </div>
              <ChevronDown className='w-4 h-4 text-gray-400' />
            </div>

            {/* Logout */}
            <Button onClick={handleLogout} variant='ghost' size='sm'>
              <LogOut className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 shadow-sm
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <div className='p-4'>
            {/* Navigation */}
            <nav className='space-y-1'>
              {[
                { key: 'overview', label: 'Dashboard', icon: Home },
                { key: 'vendors', label: 'Vendors', icon: Users },
                { key: 'customers', label: 'Customers', icon: User },
                { key: 'jobs', label: 'Jobs', icon: Briefcase },
                { key: 'payments', label: 'Payments', icon: DollarSign },
                { key: 'categories', label: 'Categories', icon: Layers },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                { key: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={activeTab === item.key ? 'secondary' : 'ghost'}
                  className='w-full justify-start'
                  onClick={() => setActiveTab(item.key)}
                >
                  <item.icon className='h-4 w-4 mr-3' />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
              <h3 className='text-sm font-medium text-gray-700 mb-3'>
                Quick Stats
              </h3>
              <div className='space-y-2 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Online Users</span>
                  <span className='font-medium text-green-600'>1,234</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>System Load</span>
                  <span className='font-medium text-blue-600'>23%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Uptime</span>
                  <span className='font-medium text-green-600'>99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-6'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            {/* Overview Tab */}
            <TabsContent value='overview' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Dashboard Overview
                  </h1>
                  <p className='text-gray-600'>
                    Monitor your platform performance and activities
                  </p>
                </div>
                <Button onClick={fetchDashboardData} disabled={loading}>
                  {loading ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <RotateCcw className='w-4 h-4 mr-2' />
                  )}
                  Refresh
                </Button>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <StatCard
                  title='Total Vendors'
                  value={stats.totalVendors.toLocaleString()}
                  change='+12% this month'
                  icon={<Users className='w-6 h-6' />}
                  color='primary'
                  loading={loading}
                />
                <StatCard
                  title='Total Customers'
                  value={stats.totalCustomers.toLocaleString()}
                  change='+8% this month'
                  icon={<User className='w-6 h-6' />}
                  color='success'
                  loading={loading}
                />
                <StatCard
                  title='Active Jobs'
                  value={stats.activeJobs.toLocaleString()}
                  change='+15% this month'
                  icon={<Briefcase className='w-6 h-6' />}
                  color='warning'
                  loading={loading}
                />
                <StatCard
                  title='Total Revenue'
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  change='+23% this month'
                  icon={<DollarSign className='w-6 h-6' />}
                  color='info'
                  loading={loading}
                />
              </div>

              {/* Additional Stats */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Clock className='w-5 h-5 text-blue-600' />
                      Pending Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Vendor Approvals
                        </span>
                        <Badge
                          variant='secondary'
                          className='bg-yellow-100 text-yellow-800'
                        >
                          {stats.pendingVendors}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Support Tickets
                        </span>
                        <Badge
                          variant='secondary'
                          className='bg-red-100 text-red-800'
                        >
                          12
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Payment Reviews
                        </span>
                        <Badge
                          variant='secondary'
                          className='bg-blue-100 text-blue-800'
                        >
                          8
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <TrendingUp className='w-5 h-5 text-green-600' />
                      Growth Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Monthly Growth
                        </span>
                        <span className='text-sm font-semibold text-green-600'>
                          +{stats.monthlyGrowth}%
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          User Retention
                        </span>
                        <span className='text-sm font-semibold text-blue-600'>
                          94.2%
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Job Success Rate
                        </span>
                        <span className='text-sm font-semibold text-green-600'>
                          87.5%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Activity className='w-5 h-5 text-purple-600' />
                      Platform Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Server Status
                        </span>
                        <Badge
                          variant='default'
                          className='bg-green-100 text-green-800'
                        >
                          Healthy
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Database</span>
                        <Badge
                          variant='default'
                          className='bg-green-100 text-green-800'
                        >
                          Connected
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          API Status
                        </span>
                        <Badge
                          variant='default'
                          className='bg-green-100 text-green-800'
                        >
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl flex items-center gap-2'>
                    <Activity className='w-5 h-5 text-blue-600' />
                    Recent Activity
                  </CardTitle>
                  <p className='text-sm text-gray-600'>
                    Latest platform activities and updates
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <ActivityItem key={index} {...activity} />
                      ))
                    ) : (
                      <div className='text-center py-8 text-gray-500'>
                        No recent activities to display
                      </div>
                    )}
                  </div>
                  <div className='mt-6 text-center'>
                    <Button variant='outline' className='w-full'>
                      View All Activities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Tabs */}
            {['jobs', 'payments', 'categories', 'analytics', 'settings'].map(
              (tab) => (
                <TabsContent key={tab} value={tab}>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-xl capitalize'>
                        {tab} Management
                      </CardTitle>
                      <p className='text-sm text-gray-600'>
                        Manage and monitor {tab} on the platform
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className='text-center py-12'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                          {tab === 'jobs' && (
                            <Briefcase className='w-8 h-8 text-orange-600' />
                          )}
                          {tab === 'payments' && (
                            <DollarSign className='w-8 h-8 text-purple-600' />
                          )}
                          {tab === 'categories' && (
                            <Layers className='w-8 h-8 text-indigo-600' />
                          )}
                          {tab === 'analytics' && (
                            <BarChart3 className='w-8 h-8 text-cyan-600' />
                          )}
                          {tab === 'settings' && (
                            <Settings className='w-8 h-8 text-gray-600' />
                          )}
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2 capitalize'>
                          {tab} Management
                        </h3>
                        <p className='text-gray-600 max-w-md mx-auto'>
                          This section will contain comprehensive {tab}{' '}
                          management features including creation, editing,
                          monitoring, and analytics.
                        </p>
                        <Button className='mt-4' variant='outline'>
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            )}

            {/* Vendors Tab - Fully Dynamic */}
            <TabsContent value='vendors' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Vendor Management
                  </h1>
                  <p className='text-gray-600'>
                    Manage and monitor all platform vendors
                  </p>
                </div>
                <Button
                  onClick={() => setVendors([])}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add New Vendor
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className='p-4'>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='flex-1'>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                        <Input
                          placeholder='Search vendors by name, email, or company...'
                          value={vendorSearchQuery}
                          onChange={(e) => setVendorSearchQuery(e.target.value)}
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant={
                          vendorStatusFilter === 'all' ? 'default' : 'outline'
                        }
                        onClick={() => setVendorStatusFilter('all')}
                        size='sm'
                      >
                        All
                      </Button>
                      <Button
                        variant={
                          vendorStatusFilter === 'pending'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setVendorStatusFilter('pending')}
                        size='sm'
                      >
                        Pending
                      </Button>
                      <Button
                        variant={
                          vendorStatusFilter === 'active'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setVendorStatusFilter('active')}
                        size='sm'
                      >
                        Active
                      </Button>
                      <Button
                        variant={
                          vendorStatusFilter === 'suspended'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setVendorStatusFilter('suspended')}
                        size='sm'
                      >
                        Suspended
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendors List */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={fetchVendors}
                        disabled={vendorsLoading}
                      >
                        {vendorsLoading ? (
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        ) : (
                          <RotateCcw className='w-4 h-4 mr-2' />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {vendorsLoading ? (
                    <div className='space-y-4'>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className='flex items-center space-x-4 p-4 border rounded-lg'
                        >
                          <div className='w-12 h-12 bg-gray-200 rounded-full animate-pulse'></div>
                          <div className='flex-1 space-y-2'>
                            <div className='h-4 bg-gray-200 rounded w-1/4 animate-pulse'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2 animate-pulse'></div>
                          </div>
                          <div className='h-8 bg-gray-200 rounded w-20 animate-pulse'></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredVendors.length > 0 ? (
                    <div className='space-y-4'>
                      {filteredVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <Avatar className='w-12 h-12'>
                              <AvatarImage src={vendor.avatar} />
                              <AvatarFallback className='bg-blue-100 text-blue-600 font-semibold'>
                                {vendor.firstName.charAt(0)}
                                {vendor.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className='font-semibold text-gray-900'>
                                {vendor.firstName} {vendor.lastName}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {vendor.email}
                              </p>
                              {vendor.vendorProfile && (
                                <p className='text-sm text-gray-500'>
                                  {vendor.vendorProfile.companyName}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className='flex items-center space-x-3'>
                            <Badge
                              variant={
                                vendor.status === 'ACTIVE'
                                  ? 'default'
                                  : vendor.status === 'PENDING'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className={
                                vendor.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : vendor.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {vendor.status}
                            </Badge>

                            <div className='flex items-center space-x-2'>
                              {vendor.status === 'PENDING' && (
                                <>
                                  <Button
                                    size='sm'
                                    onClick={() =>
                                      handleApproveVendor(vendor.id)
                                    }
                                    disabled={vendor.actionLoading}
                                    className='bg-green-600 hover:bg-green-700 text-white'
                                  >
                                    {vendor.actionLoading ? (
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                      <Check className='w-4 h-4' />
                                    )}
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='destructive'
                                    onClick={() =>
                                      handleRejectVendor(vendor.id)
                                    }
                                    disabled={vendor.actionLoading}
                                  >
                                    {vendor.actionLoading ? (
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                      <X className='w-4 h-4' />
                                    )}
                                  </Button>
                                </>
                              )}

                              {vendor.status === 'ACTIVE' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleToggleVendorStatus(
                                      vendor.id,
                                      'SUSPENDED'
                                    )
                                  }
                                  disabled={vendor.actionLoading}
                                >
                                  Suspend
                                </Button>
                              )}

                              {vendor.status === 'SUSPENDED' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleToggleVendorStatus(
                                      vendor.id,
                                      'ACTIVE'
                                    )
                                  }
                                  disabled={vendor.actionLoading}
                                >
                                  Activate
                                </Button>
                              )}

                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleViewVendor(vendor.id)}
                              >
                                <Eye className='w-4 h-4' />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <Users className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No vendors found
                      </h3>
                      <p className='text-gray-600'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab - Fully Dynamic */}
            <TabsContent value='customers' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Customer Management
                  </h1>
                  <p className='text-gray-600'>
                    Manage and monitor all platform customers
                  </p>
                </div>
                <Button
                  onClick={() => setCustomers([])}
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add New Customer
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className='p-4'>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='flex-1'>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                        <Input
                          placeholder='Search customers by name, email, or preferences...'
                          value={customerSearchQuery}
                          onChange={(e) =>
                            setCustomerSearchQuery(e.target.value)
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant={
                          customerStatusFilter === 'all' ? 'default' : 'outline'
                        }
                        onClick={() => setCustomerStatusFilter('all')}
                        size='sm'
                      >
                        All
                      </Button>
                      <Button
                        variant={
                          customerStatusFilter === 'active'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setCustomerStatusFilter('active')}
                        size='sm'
                      >
                        Active
                      </Button>
                      <Button
                        variant={
                          customerStatusFilter === 'suspended'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setCustomerStatusFilter('suspended')}
                        size='sm'
                      >
                        Suspended
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customers List */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>
                      Customers ({filteredCustomers.length})
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={fetchCustomers}
                        disabled={customersLoading}
                      >
                        {customersLoading ? (
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        ) : (
                          <RotateCcw className='w-4 h-4 mr-2' />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {customersLoading ? (
                    <div className='space-y-4'>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className='flex items-center space-x-4 p-4 border rounded-lg'
                        >
                          <div className='w-12 h-12 bg-gray-200 rounded-full animate-pulse'></div>
                          <div className='flex-1 space-y-2'>
                            <div className='h-4 bg-gray-200 rounded w-1/4 animate-pulse'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2 animate-pulse'></div>
                          </div>
                          <div className='h-8 bg-gray-200 rounded w-20 animate-pulse'></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredCustomers.length > 0 ? (
                    <div className='space-y-4'>
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <Avatar className='w-12 h-12'>
                              <AvatarImage src={customer.avatar} />
                              <AvatarFallback className='bg-green-100 text-green-600 font-semibold'>
                                {customer.firstName.charAt(0)}
                                {customer.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className='font-semibold text-gray-900'>
                                {customer.firstName} {customer.lastName}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {customer.email}
                              </p>
                              {customer.customerProfile && (
                                <div className='flex items-center space-x-2 mt-1'>
                                  <span className='text-xs text-gray-500'>
                                    Budget:{' '}
                                    {customer.customerProfile.budgetRange}
                                  </span>
                                  <span className='text-xs text-gray-500'>
                                    •
                                  </span>
                                  <span className='text-xs text-gray-500'>
                                    Jobs:{' '}
                                    {customer.customerProfile.totalJobsPosted}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='flex items-center space-x-3'>
                            <Badge
                              variant={
                                customer.status === 'ACTIVE'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                customer.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {customer.status}
                            </Badge>

                            <div className='flex items-center space-x-2'>
                              {customer.status === 'ACTIVE' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleToggleCustomerStatus(
                                      customer.id,
                                      'SUSPENDED'
                                    )
                                  }
                                  disabled={customer.actionLoading}
                                >
                                  Suspend
                                </Button>
                              )}

                              {customer.status === 'SUSPENDED' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleToggleCustomerStatus(
                                      customer.id,
                                      'ACTIVE'
                                    )
                                  }
                                  disabled={customer.actionLoading}
                                >
                                  Activate
                                </Button>
                              )}

                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleViewCustomer(customer.id)}
                              >
                                <Eye className='w-4 h-4' />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <User className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No customers found
                      </h3>
                      <p className='text-gray-600'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
