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
  CreditCard,
  DollarSign,
  Search,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  Calendar,
  Users,
  Receipt,
  Shield,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const PaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for demonstration
  const payments = [
    {
      id: 'PAY-001',
      customer: 'John Doe',
      customerEmail: 'john@example.com',
      vendor: 'Tech Solutions Inc',
      vendorEmail: 'mike@techsolutions.com',
      jobTitle: 'Website Development for E-commerce',
      amount: 5000,
      currency: 'USD',
      type: 'ESCROW',
      status: 'COMPLETED',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-123456789',
      platformFee: 250,
      netAmount: 4750,
      createdAt: '2024-01-20 10:30:00',
      completedAt: '2024-01-25 15:45:00',
      description: 'Final payment for completed website development project',
    },
    {
      id: 'PAY-002',
      customer: 'Jane Smith',
      customerEmail: 'jane@example.com',
      vendor: 'Design Studio Pro',
      vendorEmail: 'jane@designstudio.com',
      jobTitle: 'Logo Design for Startup',
      amount: 800,
      currency: 'USD',
      type: 'ESCROW',
      status: 'PENDING',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-123456790',
      platformFee: 40,
      netAmount: 760,
      createdAt: '2024-01-22 14:20:00',
      completedAt: null,
      description: 'Payment for logo design project',
    },
    {
      id: 'PAY-003',
      customer: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      vendor: 'Mobile Apps Pro',
      vendorEmail: 'david@mobileappspro.com',
      jobTitle: 'Mobile App Development',
      amount: 15000,
      currency: 'USD',
      type: 'MILESTONE',
      status: 'COMPLETED',
      paymentMethod: 'PayPal',
      transactionId: 'TXN-123456791',
      platformFee: 750,
      netAmount: 14250,
      createdAt: '2024-01-18 09:15:00',
      completedAt: '2024-01-23 11:30:00',
      description: 'Milestone payment for mobile app development',
    },
    {
      id: 'PAY-004',
      customer: 'Robert Wilson',
      customerEmail: 'robert@example.com',
      vendor: 'Content Creators',
      vendorEmail: 'sarah@contentcreators.com',
      jobTitle: 'Content Writing for Blog',
      amount: 300,
      currency: 'USD',
      type: 'ESCROW',
      status: 'FAILED',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-123456792',
      platformFee: 15,
      netAmount: 285,
      createdAt: '2024-01-24 16:45:00',
      completedAt: null,
      description: 'Payment for blog content writing',
    },
    {
      id: 'PAY-005',
      customer: 'Emily Brown',
      customerEmail: 'emily@example.com',
      vendor: 'Tech Solutions Inc',
      vendorEmail: 'mike@techsolutions.com',
      jobTitle: 'API Integration Service',
      amount: 2500,
      currency: 'USD',
      type: 'ESCROW',
      status: 'PROCESSING',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-123456793',
      platformFee: 125,
      netAmount: 2375,
      createdAt: '2024-01-25 12:00:00',
      completedAt: null,
      description: 'Payment for API integration service',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className='bg-green-100 text-green-800'>Completed</Badge>;
      case 'PENDING':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'PROCESSING':
        return <Badge className='bg-blue-100 text-blue-800'>Processing</Badge>;
      case 'FAILED':
        return <Badge className='bg-red-100 text-red-800'>Failed</Badge>;
      case 'CANCELLED':
        return <Badge className='bg-gray-100 text-gray-800'>Cancelled</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ESCROW':
        return <Badge className='bg-blue-100 text-blue-800'>Escrow</Badge>;
      case 'MILESTONE':
        return (
          <Badge className='bg-purple-100 text-purple-800'>Milestone</Badge>
        );
      case 'DIRECT':
        return <Badge className='bg-green-100 text-green-800'>Direct</Badge>;
      default:
        return <Badge variant='outline'>{type}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return <CreditCard className='h-4 w-4 text-blue-600' />;
      case 'PayPal':
        return <Shield className='h-4 w-4 text-blue-600' />;
      case 'Bank Transfer':
        return <Receipt className='h-4 w-4 text-green-600' />;
      default:
        return <CreditCard className='h-4 w-4 text-gray-600' />;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFees = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.platformFee, 0);

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Payment Management</h1>
        <p className='text-blue-100'>
          Monitor and manage all platform transactions and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
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
              ${totalRevenue.toLocaleString()}
            </div>
            <p className='text-xs text-green-600'>+25% from last month</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Platform Fees
            </CardTitle>
            <div className='p-2 rounded-lg bg-purple-50'>
              <CreditCard className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalFees.toLocaleString()}
            </div>
            <p className='text-xs text-green-600'>5% of total revenue</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Pending Payments
            </CardTitle>
            <div className='p-2 rounded-lg bg-yellow-50'>
              <Clock className='h-4 w-4 text-yellow-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$3,300</div>
            <p className='text-xs text-yellow-600'>Requires attention</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Success Rate
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <CheckCircle className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>94.2%</div>
            <p className='text-xs text-green-600'>+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='all-payments' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='all-payments'>All Payments</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
          <TabsTrigger value='pending'>Pending</TabsTrigger>
          <TabsTrigger value='failed'>Failed</TabsTrigger>
          <TabsTrigger value='processing'>Processing</TabsTrigger>
        </TabsList>

        <TabsContent value='all-payments' className='space-y-6'>
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                  <CardTitle>Payment Management</CardTitle>
                  <CardDescription>
                    Search, filter, and manage platform payments
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='flex items-center gap-2'
                      >
                        <Download className='h-4 w-4' />
                        Export Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Payment Data</DialogTitle>
                        <DialogDescription>
                          Export payment data in various formats
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <Button
                            variant='outline'
                            className='flex items-center gap-2'
                          >
                            <FileText className='h-4 w-4' />
                            CSV Export
                          </Button>
                          <Button
                            variant='outline'
                            className='flex items-center gap-2'
                          >
                            <FileText className='h-4 w-4' />
                            Excel Export
                          </Button>
                        </div>
                        <div className='flex gap-2 justify-end'>
                          <Button variant='outline'>Cancel</Button>
                          <Button>Export</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Manual Payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search payments...'
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
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                    <SelectItem value='PROCESSING'>Processing</SelectItem>
                    <SelectItem value='FAILED'>Failed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='ESCROW'>Escrow</SelectItem>
                    <SelectItem value='MILESTONE'>Milestone</SelectItem>
                    <SelectItem value='DIRECT'>Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payments Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Details</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Job & Amount</TableHead>
                      <TableHead>Payment Info</TableHead>
                      <TableHead>Status & Timing</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='font-medium'>{payment.id}</div>
                            <div className='text-sm text-gray-500'>
                              {payment.description}
                            </div>
                            <div className='flex items-center gap-2'>
                              {getTypeBadge(payment.type)}
                              {getStatusBadge(payment.status)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div>
                              <div className='font-medium text-sm'>
                                Customer
                              </div>
                              <div className='text-xs text-gray-500'>
                                {payment.customer}
                              </div>
                              <div className='text-xs text-gray-500'>
                                {payment.customerEmail}
                              </div>
                            </div>
                            <div>
                              <div className='font-medium text-sm'>Vendor</div>
                              <div className='text-xs text-gray-500'>
                                {payment.vendor}
                              </div>
                              <div className='text-xs text-gray-500'>
                                {payment.vendorEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='text-sm font-medium line-clamp-2'>
                              {payment.jobTitle}
                            </div>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='h-4 w-4 text-green-600' />
                              <span className='font-bold text-lg'>
                                ${payment.amount.toLocaleString()}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {payment.currency}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>
                              Platform Fee: ${payment.platformFee}
                            </div>
                            <div className='text-xs text-gray-500'>
                              Net: ${payment.netAmount.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className='text-sm'>
                                {payment.paymentMethod}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>
                              TXN: {payment.transactionId}
                            </div>
                            <div className='text-xs text-gray-500'>
                              Created: {payment.createdAt}
                            </div>
                            {payment.completedAt && (
                              <div className='text-xs text-gray-500'>
                                Completed: {payment.completedAt}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              {payment.status === 'COMPLETED' ? (
                                <CheckCircle className='h-4 w-4 text-green-600' />
                              ) : payment.status === 'FAILED' ? (
                                <XCircle className='h-4 w-4 text-red-600' />
                              ) : payment.status === 'PROCESSING' ? (
                                <Activity className='h-4 w-4 text-blue-600' />
                              ) : (
                                <Clock className='h-4 w-4 text-yellow-600' />
                              )}
                              <span className='text-sm font-medium'>
                                {payment.status}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>
                              {payment.status === 'COMPLETED'
                                ? 'Successfully processed'
                                : payment.status === 'FAILED'
                                ? 'Payment failed'
                                : payment.status === 'PROCESSING'
                                ? 'Currently processing'
                                : 'Awaiting completion'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Download className='h-4 w-4' />
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
                  Showing 1 to {filteredPayments.length} of {payments.length}{' '}
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

        <TabsContent value='completed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5' />
                Completed Payments
              </CardTitle>
              <CardDescription>
                Successfully completed transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Completion Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  Export Completed
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Success Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Completed payments management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='pending' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Pending Payments
              </CardTitle>
              <CardDescription>
                Payments awaiting completion or approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Monitor Pending
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Pending Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Resolve Issues
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Pending payments management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='failed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <XCircle className='h-5 w-5' />
                Failed Payments
              </CardTitle>
              <CardDescription>Payments that failed to process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Review Failures
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Failure Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingDown className='h-4 w-4' />
                  Failure Trends
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Failed payments management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='processing' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Processing Payments
              </CardTitle>
              <CardDescription>
                Payments currently being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Activity className='h-4 w-4' />
                  Monitor Processing
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Processing Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Processing Times
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Processing payments management interface will be implemented
                here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentManagement;
