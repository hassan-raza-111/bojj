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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Star,
  CreditCard,
  ShoppingCart,
} from 'lucide-react';

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [spendingFilter, setSpendingFilter] = useState('all');

  // Mock data for demonstration
  const customers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      location: 'New York, NY',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago',
      totalJobsPosted: 5,
      totalSpent: 2500,
      preferredCategories: ['Web Development', 'Design'],
      budgetRange: '$1000 - $5000',
      averageRating: 4.5,
      totalReviews: 8,
      recentActivity: 'Posted new job 2 hours ago',
    },
    {
      id: '2',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0128',
      location: 'San Francisco, CA',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: false,
      joinedDate: '2024-01-12',
      lastActive: '1 day ago',
      totalJobsPosted: 12,
      totalSpent: 8500,
      preferredCategories: ['Mobile Development', 'Web Development'],
      budgetRange: '$2000 - $10000',
      averageRating: 4.8,
      totalReviews: 15,
      recentActivity: 'Completed payment for job',
    },
    {
      id: '3',
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert@example.com',
      phone: '+1-555-0129',
      location: 'Chicago, IL',
      status: 'SUSPENDED',
      emailVerified: true,
      phoneVerified: true,
      joinedDate: '2024-01-08',
      lastActive: '1 week ago',
      totalJobsPosted: 3,
      totalSpent: 1200,
      preferredCategories: ['Content Writing'],
      budgetRange: '$500 - $2000',
      averageRating: 3.2,
      totalReviews: 2,
      recentActivity: 'Account suspended due to policy violation',
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily@example.com',
      phone: '+1-555-0130',
      location: 'Austin, TX',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      joinedDate: '2024-01-20',
      lastActive: '3 hours ago',
      totalJobsPosted: 8,
      totalSpent: 4200,
      preferredCategories: ['Design', 'Marketing'],
      budgetRange: '$800 - $3000',
      averageRating: 4.6,
      totalReviews: 12,
      recentActivity: 'Posted new job 3 hours ago',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'SUSPENDED':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      case 'INACTIVE':
        return <Badge className='bg-gray-100 text-gray-800'>Inactive</Badge>;
      case 'PENDING':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className='h-4 w-4 text-green-600' />
    ) : (
      <XCircle className='h-4 w-4 text-red-600' />
    );
  };

  const getSpendingBadge = (amount: number) => {
    if (amount >= 5000) {
      return (
        <Badge className='bg-purple-100 text-purple-800'>High Spender</Badge>
      );
    } else if (amount >= 2000) {
      return (
        <Badge className='bg-blue-100 text-blue-800'>Medium Spender</Badge>
      );
    } else {
      return <Badge className='bg-gray-100 text-gray-800'>Low Spender</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
        <span className='text-sm font-medium'>{rating}</span>
      </div>
    );
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter;
    const matchesSpending =
      spendingFilter === 'all' ||
      (spendingFilter === 'high' && customer.totalSpent >= 5000) ||
      (spendingFilter === 'medium' &&
        customer.totalSpent >= 2000 &&
        customer.totalSpent < 5000) ||
      (spendingFilter === 'low' && customer.totalSpent < 2000);
    return matchesSearch && matchesStatus && matchesSpending;
  });

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Customer Management</h1>
        <p className='text-blue-100'>
          Manage customer accounts, support, and activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Customers
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Users className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>2,847</div>
            <p className='text-xs text-green-600'>+18% from last month</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Active Customers
            </CardTitle>
            <div className='p-2 rounded-lg bg-green-50'>
              <UserCheck className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>2,456</div>
            <p className='text-xs text-green-600'>86.3% of total</p>
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
            <div className='text-2xl font-bold'>$1.2M</div>
            <p className='text-xs text-green-600'>+22% from last month</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Average Order Value
            </CardTitle>
            <div className='p-2 rounded-lg bg-orange-50'>
              <ShoppingCart className='h-4 w-4 text-orange-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$2,450</div>
            <p className='text-xs text-green-600'>+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='all-customers' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='all-customers'>All Customers</TabsTrigger>
          <TabsTrigger value='active'>Active</TabsTrigger>
          <TabsTrigger value='suspended'>Suspended</TabsTrigger>
          <TabsTrigger value='high-value'>High Value</TabsTrigger>
        </TabsList>

        <TabsContent value='all-customers' className='space-y-6'>
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>
                    Search, filter, and manage customer accounts
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='flex items-center gap-2'>
                      <Plus className='h-4 w-4' />
                      Add Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Customer</DialogTitle>
                      <DialogDescription>
                        Manually add a new customer account
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium'>
                            First Name
                          </label>
                          <Input placeholder='John' />
                        </div>
                        <div>
                          <label className='text-sm font-medium'>
                            Last Name
                          </label>
                          <Input placeholder='Doe' />
                        </div>
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Email</label>
                        <Input type='email' placeholder='john@example.com' />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Phone</label>
                        <Input placeholder='+1-555-0123' />
                      </div>
                      <div className='flex gap-2 justify-end'>
                        <Button variant='outline'>Cancel</Button>
                        <Button>Add Customer</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search customers...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={spendingFilter}
                  onValueChange={setSpendingFilter}
                >
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Spending' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Spending</SelectItem>
                    <SelectItem value='high'>High Spenders</SelectItem>
                    <SelectItem value='medium'>Medium Spenders</SelectItem>
                    <SelectItem value='low'>Low Spenders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customers Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Details</TableHead>
                      <TableHead>Contact & Location</TableHead>
                      <TableHead>Jobs & Spending</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Rating & Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center space-x-3'>
                              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold'>
                                {customer.firstName.charAt(0)}
                              </div>
                              <div>
                                <div className='font-medium'>
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  ID: {customer.id}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <Calendar className='h-3 w-3' />
                              Joined: {customer.joinedDate}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <Clock className='h-3 w-3' />
                              Last active: {customer.lastActive}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='text-sm text-gray-500 flex items-center gap-2'>
                              <Mail className='h-3 w-3' />
                              {customer.email}
                            </div>
                            <div className='text-sm text-gray-500 flex items-center gap-2'>
                              <Phone className='h-3 w-3' />
                              {customer.phone}
                            </div>
                            <div className='text-sm text-gray-500 flex items-center gap-2'>
                              <MapPin className='h-3 w-3' />
                              {customer.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Briefcase className='h-4 w-4 text-blue-600' />
                              <span className='font-medium'>
                                {customer.totalJobsPosted} jobs
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='h-4 w-4 text-green-600' />
                              <span className='font-medium'>
                                ${customer.totalSpent.toLocaleString()}
                              </span>
                            </div>
                            {getSpendingBadge(customer.totalSpent)}
                            <div className='text-xs text-gray-500'>
                              Budget: {customer.budgetRange}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <div className='flex items-center gap-1'>
                                {getVerificationIcon(customer.emailVerified)}
                                <span className='text-xs'>Email</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                {getVerificationIcon(customer.phoneVerified)}
                                <span className='text-xs'>Phone</span>
                              </div>
                            </div>
                            <div className='text-xs text-gray-500'>
                              {customer.preferredCategories
                                .slice(0, 2)
                                .join(', ')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            {getRatingStars(customer.averageRating)}
                            <div className='text-sm text-gray-500'>
                              {customer.totalReviews} reviews
                            </div>
                            <div className='text-xs text-gray-500 line-clamp-2'>
                              {customer.recentActivity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Mail className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between mt-6'>
                <div className='text-sm text-gray-500'>
                  Showing 1 to {filteredCustomers.length} of {customers.length}{' '}
                  results
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    Previous
                  </Button>
                  <Button variant='outline' size='sm'>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='active' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCheck className='h-5 w-5' />
                Active Customers
              </CardTitle>
              <CardDescription>
                Currently active and engaged customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Active Customer Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Send Newsletter
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Engagement Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Active customers management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='suspended' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserX className='h-5 w-5' />
                Suspended Customers
              </CardTitle>
              <CardDescription>
                Customers with suspended accounts requiring review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Review Suspensions
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Suspension Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingDown className='h-4 w-4' />
                  Suspension Trends
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Suspended customers management interface will be implemented
                here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='high-value' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                High Value Customers
              </CardTitle>
              <CardDescription>
                Customers with high spending and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Star className='h-4 w-4' />
                  VIP Management
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  High Value Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Revenue Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                High value customers management interface will be implemented
                here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
