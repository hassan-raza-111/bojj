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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
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
  Download,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  Loader2,
} from 'lucide-react';
import { useCustomerManagement } from '@/hooks/useCustomerManagement';
import { Customer } from '@/config/adminApi';

const CustomerManagement = () => {
  const {
    customers,
    stats,
    pagination,
    statsLoading,
    customersLoading,
    statsError,
    customersError,
    filters,
    selectedCustomers,
    updateFilters,
    handlePageChange,
    handleSearch,
    handleStatusFilter,
    handleSpendingFilter,
    toggleCustomerSelection,
    selectAllCustomers,
    clearSelection,
    toggleStatusMutation,
    bulkUpdateStatusMutation,
    bulkDeleteMutation,
    exportCustomersMutation,
  } = useCustomerManagement();

  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{
    status: string;
    reason: string;
  }>({ status: 'ACTIVE', reason: '' });
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkActionData, setBulkActionData] = useState<{
    action: 'status' | 'delete';
    status?: string;
    reason: string;
  }>({ action: 'status', status: 'ACTIVE', reason: '' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'SUSPENDED':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      case 'INACTIVE':
        return <Badge className='bg-gray-100 text-gray-800'>Inactive</Badge>;
      case 'DELETED':
        return <Badge className='bg-gray-100 text-gray-800'>Deleted</Badge>;
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

  const handleStatusUpdate = async (customerId: string) => {
    await toggleStatusMutation.mutateAsync({
      customerId,
      status: statusUpdateData.status,
      reason: statusUpdateData.reason,
    });
    setStatusUpdateDialog(false);
    setStatusUpdateData({ status: 'ACTIVE', reason: '' });
  };

  const handleBulkAction = async () => {
    if (bulkActionData.action === 'status' && bulkActionData.status) {
      await bulkUpdateStatusMutation.mutateAsync({
        customerIds: selectedCustomers,
        status: bulkActionData.status,
        reason: bulkActionData.reason,
      });
    } else if (bulkActionData.action === 'delete') {
      await bulkDeleteMutation.mutateAsync({
        customerIds: selectedCustomers,
        reason: bulkActionData.reason,
      });
    }
    setBulkActionDialog(false);
    setBulkActionData({ action: 'status', status: 'ACTIVE', reason: '' });
  };

  const handleExport = async () => {
    await exportCustomersMutation.mutateAsync({
      format: 'csv',
      status: filters.status !== 'all' ? filters.status : undefined,
      spending: filters.spending !== 'all' ? filters.spending : undefined,
      search: filters.search || undefined,
    });
  };

  if (statsError) {
    return (
      <div className='space-y-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
          <h1 className='text-xl font-semibold text-red-800 mb-2'>
            Error Loading Statistics
          </h1>
          <p className='text-red-600'>
            Failed to load customer statistics. Please try again.
          </p>
        </div>
      </div>
    );
  }

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
            {statsLoading ? (
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            ) : (
              <>
                <div className='text-2xl font-bold'>
                  {stats?.totalCustomers || 0}
                </div>
                <p className='text-xs text-green-600'>
                  +{stats?.customerGrowth || '0%'} from last month
                </p>
              </>
            )}
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
            {statsLoading ? (
              <Loader2 className='h-8 w-8 animate-spin text-green-600' />
            ) : (
              <>
                <div className='text-2xl font-bold'>
                  {stats?.activeCustomers || 0}
                </div>
                <p className='text-xs text-green-600'>
                  {stats?.activePercentage || '0%'} of total
                </p>
              </>
            )}
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
            {statsLoading ? (
              <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
            ) : (
              <>
                <div className='text-2xl font-bold'>
                  ${(stats?.totalRevenue || 0).toLocaleString()}
                </div>
                <p className='text-xs text-green-600'>+22% from last month</p>
              </>
            )}
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
            {statsLoading ? (
              <Loader2 className='h-8 w-8 animate-spin text-orange-600' />
            ) : (
              <>
                <div className='text-2xl font-bold'>
                  ${(stats?.averageOrderValue || 0).toLocaleString()}
                </div>
                <p className='text-xs text-green-600'>+8% from last month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        defaultValue='all-customers'
        className='space-y-4'
        onValueChange={(value) => {
          if (value === 'active') handleStatusFilter('ACTIVE');
          else if (value === 'suspended') handleStatusFilter('SUSPENDED');
          else if (value === 'high-value') handleStatusFilter('high-value');
          else handleStatusFilter('all');
        }}
      >
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
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={handleExport}
                    disabled={exportCustomersMutation.isPending}
                  >
                    {exportCustomersMutation.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : (
                      <Download className='h-4 w-4 mr-2' />
                    )}
                    Export
                  </Button>
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
              </div>
            </CardHeader>
            <CardContent>
              {/* Bulk Actions */}
              {selectedCustomers.length > 0 && (
                <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Shield className='h-4 w-4 text-blue-600' />
                      <span className='text-sm font-medium text-blue-800'>
                        {selectedCustomers.length} customer(s) selected
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setBulkActionDialog(true)}
                      >
                        <ShieldCheck className='h-4 w-4 mr-2' />
                        Bulk Actions
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={clearSelection}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search customers...'
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select
                  value={filters.status}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                    <SelectItem value='DELETED'>Deleted</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.spending}
                  onValueChange={handleSpendingFilter}
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
                      <TableHead className='w-12'>
                        <Checkbox
                          checked={
                            selectedCustomers.length === customers.length &&
                            customers.length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllCustomers();
                            } else {
                              clearSelection();
                            }
                          }}
                        />
                      </TableHead>
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
                    {customersLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center py-8'>
                          <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600' />
                          <p className='mt-2 text-gray-500'>
                            Loading customers...
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : customersError ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center py-8'>
                          <AlertCircle className='h-8 w-8 mx-auto text-red-600' />
                          <p className='mt-2 text-red-500'>
                            Error loading customers
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className='text-center py-8'>
                          <Users className='h-8 w-8 mx-auto text-gray-400' />
                          <p className='mt-2 text-gray-500'>
                            No customers found
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer: Customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() =>
                                toggleCustomerSelection(customer.id)
                              }
                            />
                          </TableCell>
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
                                Joined:{' '}
                                {new Date(
                                  customer.createdAt
                                ).toLocaleDateString()}
                              </div>
                              <div className='flex items-center gap-2 text-xs text-gray-500'>
                                <Clock className='h-3 w-3' />
                                Last active: {customer.lastActive || 'Never'}
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
                                {customer.phone || 'N/A'}
                              </div>
                              <div className='text-sm text-gray-500 flex items-center gap-2'>
                                <MapPin className='h-3 w-3' />
                                {customer.location || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                <Briefcase className='h-4 w-4 text-blue-600' />
                                <span className='font-medium'>
                                  {customer.customerProfile?.totalJobsPosted ||
                                    0}{' '}
                                  jobs
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <DollarSign className='h-4 w-4 text-green-600' />
                                <span className='font-medium'>
                                  $
                                  {(
                                    customer.customerProfile?.totalSpent || 0
                                  ).toLocaleString()}
                                </span>
                              </div>
                              {getSpendingBadge(
                                customer.customerProfile?.totalSpent || 0
                              )}
                              <div className='text-xs text-gray-500'>
                                Budget:{' '}
                                {customer.customerProfile?.budgetRange || 'N/A'}
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
                                {customer.customerProfile?.preferredCategories
                                  ?.slice(0, 2)
                                  .join(', ') || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2'>
                              {customer.averageRating
                                ? getRatingStars(customer.averageRating)
                                : 'No rating'}
                              <div className='text-sm text-gray-500'>
                                {customer.totalReviews || 0} reviews
                              </div>
                              <div className='text-xs text-gray-500 line-clamp-2'>
                                {customer.recentActivity ||
                                  'No recent activity'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(customer.status)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setStatusUpdateData({
                                    status:
                                      customer.status === 'ACTIVE'
                                        ? 'SUSPENDED'
                                        : 'ACTIVE',
                                    reason: '',
                                  });
                                  setStatusUpdateDialog(true);
                                }}
                                disabled={toggleStatusMutation.isPending}
                              >
                                {customer.status === 'ACTIVE' ? (
                                  <ShieldX className='h-4 w-4' />
                                ) : (
                                  <ShieldCheck className='h-4 w-4' />
                                )}
                              </Button>
                              <Button variant='ghost' size='sm'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='sm'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button variant='ghost' size='sm'>
                                <Mail className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className='flex items-center justify-between mt-6'>
                  <div className='text-sm text-gray-500'>
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} results
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
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
              {customersLoading ? (
                <div className='text-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600' />
                  <p className='mt-2 text-gray-500'>
                    Loading active customers...
                  </p>
                </div>
              ) : (
                <p className='text-gray-500 text-center py-8'>
                  {customers.length} active customers found
                </p>
              )}
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
              {customersLoading ? (
                <div className='text-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600' />
                  <p className='mt-2 text-gray-500'>
                    Loading suspended customers...
                  </p>
                </div>
              ) : (
                <p className='text-gray-500 text-center py-8'>
                  {customers.length} suspended customers found
                </p>
              )}
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
              {customersLoading ? (
                <div className='text-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600' />
                  <p className='mt-2 text-gray-500'>
                    Loading high value customers...
                  </p>
                </div>
              ) : (
                <p className='text-gray-500 text-center py-8'>
                  {customers.length} high value customers found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Customer Status</DialogTitle>
            <DialogDescription>
              Change the customer account status
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>New Status</label>
              <Select
                value={statusUpdateData.status}
                onValueChange={(value) =>
                  setStatusUpdateData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Reason (Optional)</label>
              <Input
                placeholder='Enter reason for status change...'
                value={statusUpdateData.reason}
                onChange={(e) =>
                  setStatusUpdateData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() => setStatusUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={toggleStatusMutation.isPending}
              >
                {toggleStatusMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : null}
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <AlertDialog open={bulkActionDialog} onOpenChange={setBulkActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Choose an action to perform on {selectedCustomers.length} selected
              customer(s)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Action</label>
              <Select
                value={bulkActionData.action}
                onValueChange={(value: 'status' | 'delete') =>
                  setBulkActionData((prev) => ({ ...prev, action: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='status'>Update Status</SelectItem>
                  <SelectItem value='delete'>Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkActionData.action === 'status' && (
              <div>
                <label className='text-sm font-medium'>New Status</label>
                <Select
                  value={bulkActionData.status}
                  onValueChange={(value) =>
                    setBulkActionData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className='text-sm font-medium'>Reason (Optional)</label>
              <Input
                placeholder='Enter reason for action...'
                value={bulkActionData.reason}
                onChange={(e) =>
                  setBulkActionData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              disabled={
                bulkUpdateStatusMutation.isPending ||
                bulkDeleteMutation.isPending
              }
              className='bg-red-600 hover:bg-red-700'
            >
              {bulkUpdateStatusMutation.isPending ||
              bulkDeleteMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : null}
              {bulkActionData.action === 'delete' ? 'Delete' : 'Update'}{' '}
              Customers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerManagement;
