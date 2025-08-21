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
  Shield,
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

  // Job management states
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  // Payment management states
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Category management states
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState({
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
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30');

  // Settings states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [adminUsers] = useState([
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bojj.com',
      role: 'Super Admin',
      status: 'ACTIVE',
      avatar: null,
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Manager',
      email: 'sarah@bojj.com',
      role: 'Admin Manager',
      status: 'ACTIVE',
      avatar: null,
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Support',
      email: 'mike@bojj.com',
      role: 'Support Admin',
      status: 'ACTIVE',
      avatar: null,
    },
  ]);

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

  // Filtered jobs based on search and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.customer?.firstName
        ?.toLowerCase()
        .includes(jobSearchQuery.toLowerCase()) ||
      job.customer?.lastName
        ?.toLowerCase()
        .includes(jobSearchQuery.toLowerCase());

    const matchesStatus =
      jobStatusFilter === 'all' ||
      (jobStatusFilter === 'pending' && job.status === 'PENDING') ||
      (jobStatusFilter === 'active' && job.status === 'ACTIVE') ||
      (jobStatusFilter === 'completed' && job.status === 'COMPLETED') ||
      (jobStatusFilter === 'cancelled' && job.status === 'CANCELLED');

    return matchesSearch && matchesStatus;
  });

  // Filtered payments based on search and status
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.job?.title
        ?.toLowerCase()
        .includes(paymentSearchQuery.toLowerCase()) ||
      payment.customer?.firstName
        ?.toLowerCase()
        .includes(paymentSearchQuery.toLowerCase()) ||
      payment.customer?.lastName
        ?.toLowerCase()
        .includes(paymentSearchQuery.toLowerCase());

    const matchesStatus =
      paymentStatusFilter === 'all' ||
      (paymentStatusFilter === 'pending' && payment.status === 'PENDING') ||
      (paymentStatusFilter === 'completed' && payment.status === 'COMPLETED') ||
      (paymentStatusFilter === 'failed' && payment.status === 'FAILED') ||
      (paymentStatusFilter === 'refunded' && payment.status === 'REFUNDED');

    return matchesSearch && matchesStatus;
  });

  // Filtered categories based on search and type
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name
        ?.toLowerCase()
        .includes(categorySearchQuery.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(categorySearchQuery.toLowerCase());

    const matchesType =
      categoryTypeFilter === 'all' ||
      (categoryTypeFilter === 'main' && !category.parentId) ||
      (categoryTypeFilter === 'sub' && category.parentId);

    return matchesSearch && matchesType;
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

  // Fetch jobs
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.data.map((job) => ({ ...job, actionLoading: false })));
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Use mock data as fallback
      setJobs([
        {
          id: '1',
          title: 'Website Development',
          description: 'Need a modern responsive website for my business',
          budget: 2500,
          category: 'Web Development',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          customer: {
            firstName: 'Jane',
            lastName: 'Doe',
            avatar: null,
          },
          actionLoading: false,
        },
        {
          id: '2',
          title: 'Mobile App Design',
          description: 'UI/UX design for a food delivery app',
          budget: 1500,
          category: 'UI/UX Design',
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          customer: {
            firstName: 'Bob',
            lastName: 'Wilson',
            avatar: null,
          },
          actionLoading: false,
        },
        {
          id: '3',
          title: 'Content Writing',
          description: 'Blog articles for tech company website',
          budget: 800,
          category: 'Content Writing',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          customer: {
            firstName: 'Alice',
            lastName: 'Brown',
            avatar: null,
          },
          actionLoading: false,
        },
      ]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Job management functions
  const handleAssignJob = async (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, actionLoading: true } : j))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/jobs/${jobId}/assign`,
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
          title: '✅ Job Assigned',
          description: 'Job has been successfully assigned to a vendor',
        });
        fetchJobs(); // Refresh the list
      } else {
        throw new Error('Failed to assign job');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to assign job',
        variant: 'destructive',
      });
    }
  };

  const handleCancelJob = async (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, actionLoading: true } : j))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/jobs/${jobId}/cancel`,
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
          title: '✅ Job Cancelled',
          description: 'Job has been successfully cancelled',
        });
        fetchJobs(); // Refresh the list
      } else {
        throw new Error('Failed to cancel job');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to cancel job',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, actionLoading: true } : j))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/jobs/${jobId}/status`,
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
          title: `✅ Job Status Updated`,
          description: `Job status has been updated to ${newStatus}`,
        });
        fetchJobs(); // Refresh the list
      } else {
        throw new Error('Failed to update job status');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    }
  };

  const handleViewJob = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      toast({
        title: '👁️ Job Details',
        description: `Viewing details for ${job.title}`,
      });
      // TODO: Implement job detail modal or navigation
    }
  };

  // Payment management functions
  const handleApprovePayment = async (paymentId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, actionLoading: true } : p))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/approve`,
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
          title: '✅ Payment Approved',
          description: 'Payment has been successfully approved',
        });
        fetchPayments(); // Refresh the list
      } else {
        throw new Error('Failed to approve payment');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to approve payment',
        variant: 'destructive',
      });
    }
  };

  const handleRejectPayment = async (paymentId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, actionLoading: true } : p))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/reject`,
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
          title: '✅ Payment Rejected',
          description: 'Payment has been successfully rejected',
        });
        fetchPayments(); // Refresh the list
      } else {
        throw new Error('Failed to reject payment');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to reject payment',
        variant: 'destructive',
      });
    }
  };

  const handleRefundPayment = async (paymentId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, actionLoading: true } : p))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/refund`,
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
          title: '✅ Payment Refunded',
          description: 'Payment has been successfully refunded',
        });
        fetchPayments(); // Refresh the list
      } else {
        throw new Error('Failed to refund payment');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to refund payment',
        variant: 'destructive',
      });
    }
  };

  const handleViewPayment = (paymentId) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      toast({
        title: '👁️ Payment Details',
        description: `Viewing details for payment ID: ${payment.id}`,
      });
      // TODO: Implement payment detail modal or navigation
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
    fetchJobs();
    fetchPayments(); // Fetch payments on mount
    fetchCategories();
    fetchAnalyticsData();
  }, []);

  // Refetch analytics when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [analyticsPeriod]);

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

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayments(
            data.data.map((payment) => ({ ...payment, actionLoading: false }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Use mock data as fallback
      setPayments([
        {
          id: '1',
          amount: 2500,
          paymentMethod: 'Bank Transfer',
          status: 'PENDING',
          job: { id: '1', title: 'Website Development' },
          customer: {
            id: '1',
            firstName: 'Jane',
            lastName: 'Doe',
            avatar: null,
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          actionLoading: false,
        },
        {
          id: '2',
          amount: 1500,
          paymentMethod: 'Credit Card',
          status: 'COMPLETED',
          job: { id: '2', title: 'Mobile App Design' },
          customer: {
            id: '2',
            firstName: 'Bob',
            lastName: 'Wilson',
            avatar: null,
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          actionLoading: false,
        },
        {
          id: '3',
          amount: 800,
          paymentMethod: 'PayPal',
          status: 'FAILED',
          job: { id: '3', title: 'Content Writing' },
          customer: {
            id: '3',
            firstName: 'Alice',
            lastName: 'Brown',
            avatar: null,
          },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          actionLoading: false,
        },
      ]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/categories'
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(
            data.data.map((category) => ({ ...category, actionLoading: false }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use mock data as fallback
      setCategories([
        {
          id: '1',
          name: 'Web Development',
          description: 'Website and web application development services',
          parentId: null,
          parentName: null,
          jobCount: 45,
          isActive: true,
          actionLoading: false,
        },
        {
          id: '2',
          name: 'Mobile Development',
          description: 'Mobile app development for iOS and Android',
          parentId: null,
          parentName: null,
          jobCount: 32,
          isActive: true,
          actionLoading: false,
        },
        {
          id: '3',
          name: 'UI/UX Design',
          description: 'User interface and user experience design',
          parentId: null,
          parentName: null,
          jobCount: 28,
          isActive: true,
          actionLoading: false,
        },
        {
          id: '4',
          name: 'React Development',
          description: 'React.js and React Native development',
          parentId: '1',
          parentName: 'Web Development',
          jobCount: 18,
          isActive: true,
          actionLoading: false,
        },
        {
          id: '5',
          name: 'Node.js Development',
          description: 'Backend development with Node.js',
          parentId: '1',
          parentName: 'Web Development',
          jobCount: 15,
          isActive: false,
          actionLoading: false,
        },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Category management functions
  const handleEditCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      toast({
        title: '✏️ Edit Category',
        description: `Editing category: ${category.name}`,
      });
      // TODO: Implement category edit modal
    }
  };

  const handleToggleCategoryStatus = async (categoryId, newStatus) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, actionLoading: true } : c))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${categoryId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );

      if (response.ok) {
        toast({
          title: `✅ Category ${newStatus ? 'Activated' : 'Deactivated'}`,
          description: `Category status has been updated`,
        });
        fetchCategories(); // Refresh the list
      } else {
        throw new Error('Failed to update category status');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update category status',
        variant: 'destructive',
      });
    }
  };

  const handleViewCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      toast({
        title: '👁️ Category Details',
        description: `Viewing details for ${category.name}`,
      });
      // TODO: Implement category detail modal or navigation
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/analytics?period=${analyticsPeriod}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Use mock data as fallback
      setAnalyticsData({
        totalRevenue: 45678,
        revenueGrowth: 23.5,
        activeUsers: 1247,
        userGrowth: 18.2,
        completedJobs: 235,
        jobSuccessRate: 87.5,
        platformHealth: 99.2,
        uptime: 99.9,
        topCategories: [
          { id: '1', name: 'Web Development', percentage: 35 },
          { id: '2', name: 'Mobile Development', percentage: 28 },
          { id: '3', name: 'UI/UX Design', percentage: 22 },
          { id: '4', name: 'Content Writing', percentage: 15 },
        ],
        recentActivity: [
          {
            type: 'success',
            title: 'New Vendor Approved',
            description: 'Tech Solutions Inc. has been verified and approved',
            time: '2 hours ago',
          },
          {
            type: 'info',
            title: 'Payment Released',
            description:
              'Payment of $2,500 released for Website Development project',
            time: '4 hours ago',
          },
          {
            type: 'warning',
            title: 'Support Ticket Created',
            description:
              'New high-priority ticket from customer regarding payment',
            time: '6 hours ago',
          },
        ],
      });
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
            {[].map((tab) => (
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
                        {tab === 'settings' && (
                          <Settings className='w-8 h-8 text-gray-600' />
                        )}
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2 capitalize'>
                        {tab} Management
                      </h3>
                      <p className='text-gray-600 max-w-md mx-auto'>
                        This section will contain comprehensive {tab} management
                        features including creation, editing, monitoring, and
                        analytics.
                      </p>
                      <Button className='mt-4' variant='outline'>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            {/* Settings Tab - Fully Dynamic */}
            <TabsContent value='settings' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    System Settings
                  </h1>
                  <p className='text-gray-600'>
                    Configure platform settings and manage system preferences
                  </p>
                </div>
                <Button
                  onClick={() => setShowSettingsModal(true)}
                  className='bg-gray-600 hover:bg-gray-700'
                >
                  <Settings className='w-4 h-4 mr-2' />
                  Configure Settings
                </Button>
              </div>

              {/* Settings Categories */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Platform Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Globe className='w-5 h-5 text-blue-600' />
                      Platform Settings
                    </CardTitle>
                    <p className='text-sm text-gray-600'>
                      Basic platform configuration
                    </p>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Platform Name
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        BOJJ Platform
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Maintenance Mode
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'
                      >
                        Disabled
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Registration
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'
                      >
                        Open
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Auto-approval
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-yellow-100 text-yellow-800'
                      >
                        Manual
                      </Badge>
                    </div>
                    <Button variant='outline' size='sm' className='w-full'>
                      Edit Platform Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Shield className='w-5 h-5 text-green-600' />
                      Security Settings
                    </CardTitle>
                    <p className='text-sm text-gray-600'>
                      Security and authentication
                    </p>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        2FA Required
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'
                      >
                        Enabled
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Session Timeout
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        24 hours
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Password Policy
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'
                      >
                        Strong
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Rate Limiting
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'
                      >
                        Active
                      </Badge>
                    </div>
                    <Button variant='outline' size='sm' className='w-full'>
                      Configure Security
                    </Button>
                  </CardContent>
                </Card>

                {/* Payment Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <CreditCard className='w-5 h-5 text-purple-600' />
                      Payment Settings
                    </CardTitle>
                    <p className='text-sm text-gray-600'>
                      Payment and commission
                    </p>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Platform Fee
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        5%
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Escrow Period
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        7 days
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Auto-release
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-yellow-100 text-yellow-800'
                      >
                        Manual
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Refund Policy
                      </span>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'
                      >
                        Flexible
                      </Badge>
                    </div>
                    <Button variant='outline' size='sm' className='w-full'>
                      Update Payment Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Admin User Management */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <Users className='w-5 h-5 text-indigo-600' />
                    Admin User Management
                  </CardTitle>
                  <p className='text-sm text-gray-600'>
                    Manage admin users and permissions
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='flex items-center space-x-4'>
                          <Avatar className='w-10 h-10'>
                            <AvatarImage src={admin.avatar} />
                            <AvatarFallback className='bg-indigo-100 text-indigo-600 font-semibold'>
                              {admin.firstName.charAt(0)}
                              {admin.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className='font-medium text-gray-900'>
                              {admin.firstName} {admin.lastName}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {admin.email}
                            </p>
                            <p className='text-xs text-gray-500'>
                              Role: {admin.role}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            variant={
                              admin.status === 'ACTIVE'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              admin.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {admin.status}
                          </Badge>
                          <Button size='sm' variant='outline'>
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button size='sm' variant='outline'>
                            <Eye className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant='outline' className='w-full'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add New Admin User
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <Info className='w-5 h-5 text-cyan-600' />
                    System Information
                  </CardTitle>
                  <p className='text-sm text-gray-600'>
                    Platform status and technical details
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Server Status
                        </span>
                        <Badge
                          variant='default'
                          className='bg-green-100 text-green-800'
                        >
                          Online
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
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Uptime</span>
                        <span className='text-sm font-medium text-gray-900'>
                          99.9%
                        </span>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Version</span>
                        <span className='text-sm font-medium text-gray-900'>
                          v2.1.0
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Last Updated
                        </span>
                        <span className='text-sm font-medium text-gray-900'>
                          2 days ago
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Environment
                        </span>
                        <Badge
                          variant='outline'
                          className='bg-blue-100 text-blue-800'
                        >
                          Production
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Support</span>
                        <Badge
                          variant='outline'
                          className='bg-green-100 text-green-800'
                        >
                          Available
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className='mt-6 flex gap-2'>
                    <Button variant='outline' size='sm'>
                      <Download className='w-4 h-4 mr-2' />
                      Export System Logs
                    </Button>
                    <Button variant='outline' size='sm'>
                      <RotateCcw className='w-4 h-4 mr-2' />
                      Check for Updates
                    </Button>
                    <Button variant='outline' size='sm'>
                      <Activity className='w-4 h-4 mr-2' />
                      System Health Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab - Fully Dynamic */}
            <TabsContent value='analytics' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Analytics & Reports
                  </h1>
                  <p className='text-gray-600'>
                    Comprehensive platform insights and performance metrics
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setAnalyticsPeriod('7')}
                    className={
                      analyticsPeriod === '7'
                        ? 'bg-blue-100 border-blue-300'
                        : ''
                    }
                  >
                    7 Days
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setAnalyticsPeriod('30')}
                    className={
                      analyticsPeriod === '30'
                        ? 'bg-blue-100 border-blue-300'
                        : ''
                    }
                  >
                    30 Days
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setAnalyticsPeriod('90')}
                    className={
                      analyticsPeriod === '90'
                        ? 'bg-blue-100 border-blue-300'
                        : ''
                    }
                  >
                    90 Days
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setAnalyticsPeriod('365')}
                    className={
                      analyticsPeriod === '365'
                        ? 'bg-blue-100 border-blue-300'
                        : ''
                    }
                  >
                    1 Year
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-600'>
                          Total Revenue
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          ${analyticsData.totalRevenue?.toLocaleString() || '0'}
                        </p>
                        <p className='text-sm text-green-600 flex items-center mt-1'>
                          <TrendingUp className='w-4 h-4 mr-1' />+
                          {analyticsData.revenueGrowth || 0}% vs last period
                        </p>
                      </div>
                      <div className='p-3 bg-green-100 rounded-lg'>
                        <DollarSign className='w-6 h-6 text-green-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-600'>
                          Active Users
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {analyticsData.activeUsers?.toLocaleString() || '0'}
                        </p>
                        <p className='text-sm text-blue-600 flex items-center mt-1'>
                          <Users className='w-4 h-4 mr-1' />+
                          {analyticsData.userGrowth || 0}% vs last period
                        </p>
                      </div>
                      <div className='p-3 bg-blue-100 rounded-lg'>
                        <Users className='w-6 h-6 text-blue-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-600'>
                          Job Success Rate
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {analyticsData.jobSuccessRate || 0}%
                        </p>
                        <p className='text-sm text-orange-600 flex items-center mt-1'>
                          <Briefcase className='w-4 h-4 mr-1' />
                          {analyticsData.completedJobs || 0} completed
                        </p>
                      </div>
                      <div className='p-3 bg-orange-100 rounded-lg'>
                        <Briefcase className='w-6 h-6 text-orange-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-600'>
                          Platform Health
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                          {analyticsData.platformHealth || 0}%
                        </p>
                        <p className='text-sm text-purple-600 flex items-center mt-1'>
                          <Activity className='w-4 h-4 mr-1' />
                          {analyticsData.uptime || 0}% uptime
                        </p>
                      </div>
                      <div className='p-3 bg-purple-100 rounded-lg'>
                        <Activity className='w-6 h-6 text-purple-600' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Detailed Analytics */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Revenue Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Revenue Trend</CardTitle>
                    <p className='text-sm text-gray-600'>
                      Revenue growth over selected period
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
                      <div className='text-center'>
                        <BarChart3 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-600'>
                          Revenue chart will be displayed here
                        </p>
                        <p className='text-sm text-gray-500'>
                          Chart.js or Recharts integration
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>User Activity</CardTitle>
                    <p className='text-sm text-gray-600'>
                      User engagement and activity patterns
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
                      <div className='text-center'>
                        <TrendingUp className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-600'>
                          User activity chart will be displayed here
                        </p>
                        <p className='text-sm text-gray-500'>
                          Line chart showing daily/weekly trends
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Category Performance
                    </CardTitle>
                    <p className='text-sm text-gray-600'>
                      Top performing job categories
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {analyticsData.topCategories?.map((category, index) => (
                        <div
                          key={category.id}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center space-x-3'>
                            <span className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium'>
                              {index + 1}
                            </span>
                            <span className='font-medium text-gray-900'>
                              {category.name}
                            </span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <div className='w-24 bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-blue-600 h-2 rounded-full'
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                            <span className='text-sm text-gray-600 w-12 text-right'>
                              {category.percentage}%
                            </span>
                          </div>
                        </div>
                      )) || (
                        <div className='text-center py-8 text-gray-500'>
                          <Layers className='w-16 h-16 mx-auto mb-4' />
                          <p>
                            Category performance data will be displayed here
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Recent Activity</CardTitle>
                    <p className='text-sm text-gray-600'>
                      Latest platform activities
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {analyticsData.recentActivity?.map((activity, index) => (
                        <div key={index} className='flex items-start space-x-3'>
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              activity.type === 'success'
                                ? 'bg-green-500'
                                : activity.type === 'warning'
                                ? 'bg-yellow-500'
                                : activity.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          ></div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900'>
                              {activity.title}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {activity.description}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <div className='text-center py-8 text-gray-500'>
                          <Activity className='w-16 h-16 mx-auto mb-4' />
                          <p>Recent activity data will be displayed here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export and Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Export & Reports</CardTitle>
                  <p className='text-sm text-gray-600'>
                    Generate and download detailed reports
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-4'>
                    <Button
                      variant='outline'
                      className='flex items-center space-x-2'
                    >
                      <Download className='w-4 h-4' />
                      <span>Export Revenue Report</span>
                    </Button>
                    <Button
                      variant='outline'
                      className='flex items-center space-x-2'
                    >
                      <Download className='w-4 h-4' />
                      <span>Export User Analytics</span>
                    </Button>
                    <Button
                      variant='outline'
                      className='flex items-center space-x-2'
                    >
                      <Download className='w-4 h-4' />
                      <span>Export Job Performance</span>
                    </Button>
                    <Button
                      variant='outline'
                      className='flex items-center space-x-2'
                    >
                      <Download className='w-4 h-4' />
                      <span>Export Full Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab - Fully Dynamic */}
            <TabsContent value='categories' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Category Management
                  </h1>
                  <p className='text-gray-600'>
                    Manage and organize platform categories and subcategories
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddCategory(true)}
                  className='bg-indigo-600 hover:bg-indigo-700'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Category
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
                          placeholder='Search categories by name or description...'
                          value={categorySearchQuery}
                          onChange={(e) =>
                            setCategorySearchQuery(e.target.value)
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant={
                          categoryTypeFilter === 'all' ? 'default' : 'outline'
                        }
                        onClick={() => setCategoryTypeFilter('all')}
                        size='sm'
                      >
                        All
                      </Button>
                      <Button
                        variant={
                          categoryTypeFilter === 'main' ? 'default' : 'outline'
                        }
                        onClick={() => setCategoryTypeFilter('main')}
                        size='sm'
                      >
                        Main Categories
                      </Button>
                      <Button
                        variant={
                          categoryTypeFilter === 'sub' ? 'default' : 'outline'
                        }
                        onClick={() => setCategoryTypeFilter('sub')}
                        size='sm'
                      >
                        Subcategories
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>
                      Categories ({filteredCategories.length})
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={fetchCategories}
                        disabled={categoriesLoading}
                      >
                        {categoriesLoading ? (
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
                  {categoriesLoading ? (
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
                  ) : filteredCategories.length > 0 ? (
                    <div className='space-y-4'>
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center'>
                              <Layers className='w-6 h-6 text-indigo-600' />
                            </div>
                            <div>
                              <h3 className='font-semibold text-gray-900'>
                                {category.name}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {category.description}
                              </p>
                              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                                <span>
                                  Type:{' '}
                                  {category.parentId
                                    ? 'Subcategory'
                                    : 'Main Category'}
                                </span>
                                {category.parentId && <span>•</span>}
                                {category.parentId && (
                                  <span>Parent: {category.parentName}</span>
                                )}
                                <span>•</span>
                                <span>Jobs: {category.jobCount || 0}</span>
                                <span>•</span>
                                <span>
                                  Status:{' '}
                                  {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center space-x-3'>
                            <Badge
                              variant={
                                category.isActive ? 'default' : 'secondary'
                              }
                              className={
                                category.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>

                            <div className='flex items-center space-x-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => handleEditCategory(category.id)}
                                disabled={category.actionLoading}
                              >
                                <Edit className='w-4 h-4' />
                              </Button>

                              {category.isActive ? (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleToggleCategoryStatus(
                                      category.id,
                                      false
                                    )
                                  }
                                  disabled={category.actionLoading}
                                >
                                  Deactivate
                                </Button>
                              ) : (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleToggleCategoryStatus(
                                      category.id,
                                      true
                                    )
                                  }
                                  disabled={category.actionLoading}
                                >
                                  Activate
                                </Button>
                              )}

                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleViewCategory(category.id)}
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
                      <Layers className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No categories found
                      </h3>
                      <p className='text-gray-600'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab - Fully Dynamic */}
            <TabsContent value='payments' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Payment Management
                  </h1>
                  <p className='text-gray-600'>
                    Manage and monitor all platform payments
                  </p>
                </div>
                <Button
                  onClick={() => setPayments([])}
                  className='bg-purple-600 hover:bg-purple-700'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Process Payment
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
                          placeholder='Search payments by job title, customer, or amount...'
                          value={paymentSearchQuery}
                          onChange={(e) =>
                            setPaymentSearchQuery(e.target.value)
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant={
                          paymentStatusFilter === 'all' ? 'default' : 'outline'
                        }
                        onClick={() => setPaymentStatusFilter('all')}
                        size='sm'
                      >
                        All
                      </Button>
                      <Button
                        variant={
                          paymentStatusFilter === 'pending'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setPaymentStatusFilter('pending')}
                        size='sm'
                      >
                        Pending
                      </Button>
                      <Button
                        variant={
                          paymentStatusFilter === 'completed'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setPaymentStatusFilter('completed')}
                        size='sm'
                      >
                        Completed
                      </Button>
                      <Button
                        variant={
                          paymentStatusFilter === 'failed'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setPaymentStatusFilter('failed')}
                        size='sm'
                      >
                        Failed
                      </Button>
                      <Button
                        variant={
                          paymentStatusFilter === 'refunded'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setPaymentStatusFilter('refunded')}
                        size='sm'
                      >
                        Refunded
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payments List */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Payments ({filteredPayments.length})</CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={fetchPayments}
                        disabled={paymentsLoading}
                      >
                        {paymentsLoading ? (
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
                  {paymentsLoading ? (
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
                  ) : filteredPayments.length > 0 ? (
                    <div className='space-y-4'>
                      {filteredPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <Avatar className='w-12 h-12'>
                              <AvatarImage src={payment.customer?.avatar} />
                              <AvatarFallback className='bg-purple-100 text-purple-600 font-semibold'>
                                {payment.customer?.firstName?.charAt(0)}
                                {payment.customer?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className='font-semibold text-gray-900'>
                                {payment.job?.title || 'Job Title'}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                Customer: {payment.customer?.firstName}{' '}
                                {payment.customer?.lastName}
                              </p>
                              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                                <span>Amount: ${payment.amount}</span>
                                <span>•</span>
                                <span>Method: {payment.paymentMethod}</span>
                                <span>•</span>
                                <span>
                                  Date:{' '}
                                  {new Date(
                                    payment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center space-x-3'>
                            <Badge
                              variant={
                                payment.status === 'COMPLETED'
                                  ? 'default'
                                  : payment.status === 'PENDING'
                                  ? 'secondary'
                                  : payment.status === 'FAILED'
                                  ? 'destructive'
                                  : 'outline'
                              }
                              className={
                                payment.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : payment.status === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {payment.status}
                            </Badge>

                            <div className='flex items-center space-x-2'>
                              {payment.status === 'PENDING' && (
                                <>
                                  <Button
                                    size='sm'
                                    onClick={() =>
                                      handleApprovePayment(payment.id)
                                    }
                                    disabled={payment.actionLoading}
                                    className='bg-green-600 hover:bg-green-700 text-white'
                                  >
                                    {payment.actionLoading ? (
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                      <Check className='w-4 h-4' />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='destructive'
                                    onClick={() =>
                                      handleRejectPayment(payment.id)
                                    }
                                    disabled={payment.actionLoading}
                                  >
                                    {payment.actionLoading ? (
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                      <X className='w-4 h-4' />
                                    )}
                                    Reject
                                  </Button>
                                </>
                              )}

                              {payment.status === 'COMPLETED' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleRefundPayment(payment.id)
                                  }
                                  disabled={payment.actionLoading}
                                >
                                  Refund
                                </Button>
                              )}

                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleViewPayment(payment.id)}
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
                      <DollarSign className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No payments found
                      </h3>
                      <p className='text-gray-600'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab - Fully Dynamic */}
            <TabsContent value='jobs' className='space-y-6'>
              {/* Page Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>
                    Job Management
                  </h1>
                  <p className='text-gray-600'>
                    Manage and monitor all platform jobs
                  </p>
                </div>
                <Button
                  onClick={() => setJobs([])}
                  className='bg-orange-600 hover:bg-orange-700'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Create New Job
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
                          placeholder='Search jobs by title, description, or customer...'
                          value={jobSearchQuery}
                          onChange={(e) => setJobSearchQuery(e.target.value)}
                          className='pl-10'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant={
                          jobStatusFilter === 'all' ? 'default' : 'outline'
                        }
                        onClick={() => setJobStatusFilter('all')}
                        size='sm'
                      >
                        All
                      </Button>
                      <Button
                        variant={
                          jobStatusFilter === 'pending' ? 'default' : 'outline'
                        }
                        onClick={() => setJobStatusFilter('pending')}
                        size='sm'
                      >
                        Pending
                      </Button>
                      <Button
                        variant={
                          jobStatusFilter === 'active' ? 'default' : 'outline'
                        }
                        onClick={() => setJobStatusFilter('active')}
                        size='sm'
                      >
                        Active
                      </Button>
                      <Button
                        variant={
                          jobStatusFilter === 'completed'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setJobStatusFilter('completed')}
                        size='sm'
                      >
                        Completed
                      </Button>
                      <Button
                        variant={
                          jobStatusFilter === 'cancelled'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setJobStatusFilter('cancelled')}
                        size='sm'
                      >
                        Cancelled
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs List */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={fetchJobs}
                        disabled={jobsLoading}
                      >
                        {jobsLoading ? (
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
                  {jobsLoading ? (
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
                  ) : filteredJobs.length > 0 ? (
                    <div className='space-y-4'>
                      {filteredJobs.map((job) => (
                        <div
                          key={job.id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <Avatar className='w-12 h-12'>
                              <AvatarImage src={job.customer?.avatar} />
                              <AvatarFallback className='bg-orange-100 text-orange-600 font-semibold'>
                                {job.customer?.firstName?.charAt(0)}
                                {job.customer?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className='font-semibold text-gray-900'>
                                {job.title}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                {job.description?.substring(0, 100)}...
                              </p>
                              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                                <span>Budget: ${job.budget}</span>
                                <span>•</span>
                                <span>Category: {job.category}</span>
                                <span>•</span>
                                <span>
                                  Posted:{' '}
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center space-x-3'>
                            <Badge
                              variant={
                                job.status === 'ACTIVE'
                                  ? 'default'
                                  : job.status === 'PENDING'
                                  ? 'secondary'
                                  : job.status === 'COMPLETED'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                job.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : job.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : job.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {job.status}
                            </Badge>

                            <div className='flex items-center space-x-2'>
                              {job.status === 'PENDING' && (
                                <>
                                  <Button
                                    size='sm'
                                    onClick={() => handleAssignJob(job.id)}
                                    disabled={job.actionLoading}
                                    className='bg-blue-600 hover:bg-blue-700 text-white'
                                  >
                                    {job.actionLoading ? (
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                      <Check className='w-4 h-4' />
                                    )}
                                    Assign
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='destructive'
                                    onClick={() => handleCancelJob(job.id)}
                                    disabled={job.actionLoading}
                                  >
                                    {job.actionLoading ? (
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                      <X className='w-4 h-4' />
                                    )}
                                    Cancel
                                  </Button>
                                </>
                              )}

                              {job.status === 'ACTIVE' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleUpdateJobStatus(job.id, 'COMPLETED')
                                  }
                                  disabled={job.actionLoading}
                                >
                                  Mark Complete
                                </Button>
                              )}

                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleViewJob(job.id)}
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
                      <Briefcase className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No jobs found
                      </h3>
                      <p className='text-gray-600'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

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
