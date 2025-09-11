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
  Loader2,
} from 'lucide-react';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { toast } from 'sonner';

const PaymentManagement = () => {
  const {
    payments,
    paymentStats,
    pagination,
    filters,
    selectedPayments,
    isLoading,
    isUpdating,
    isExporting,
    error,
    updateFilters,
    updatePage,
    togglePaymentSelection,
    selectAllPayments,
    deselectAllPayments,
    clearSelection,
    updatePaymentStatus,
    exportPaymentsData,
    hasSelectedPayments,
    selectedPaymentsCount,
  } = usePaymentManagement();

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

  // Handle error state
  if (error) {
    return (
      <div className='space-y-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-red-800 mb-2'>
            Error Loading Payments
          </h2>
          <p className='text-red-600 mb-4'>
            {error?.message || 'Failed to load payment data'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

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
        {isLoading ? (
          // Loading skeleton for stats cards
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className='hover:shadow-lg transition-shadow'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                  <div className='p-2 rounded-lg bg-gray-100'>
                    <div className='h-4 w-4 bg-gray-300 rounded' />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='h-3 w-32 bg-gray-200 rounded animate-pulse' />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
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
                  ${paymentStats?.data?.totalRevenue?.toLocaleString() || '0'}
                </div>
                <p className='text-xs text-green-600'>
                  {paymentStats?.data?.monthlyGrowth || '0%'} from last month
                </p>
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
                  $
                  {paymentStats?.data?.totalPlatformFees?.toLocaleString() ||
                    '0'}
                </div>
                <p className='text-xs text-green-600'>
                  {paymentStats?.data?.totalEscrowFees?.toLocaleString() || '0'}{' '}
                  escrow fees
                </p>
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
                <div className='text-2xl font-bold'>
                  ${paymentStats?.data?.pendingAmount?.toLocaleString() || '0'}
                </div>
                <p className='text-xs text-yellow-600'>
                  {paymentStats?.data?.pendingPayments || '0'} payments pending
                </p>
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
                <div className='text-2xl font-bold'>
                  {paymentStats?.data?.successRate || '0%'}
                </div>
                <p className='text-xs text-green-600'>
                  {paymentStats?.data?.completedPayments || '0'} completed
                </p>
              </CardContent>
            </Card>
          </>
        )}
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
                            onClick={() => exportPaymentsData('csv')}
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <FileText className='h-4 w-4' />
                            )}
                            CSV Export
                          </Button>
                          <Button
                            variant='outline'
                            className='flex items-center gap-2'
                            onClick={() => exportPaymentsData('json')}
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <FileText className='h-4 w-4' />
                            )}
                            JSON Export
                          </Button>
                        </div>
                        <div className='flex gap-2 justify-end'>
                          <Button variant='outline'>Cancel</Button>
                          <Button disabled={isExporting}>
                            {isExporting ? 'Exporting...' : 'Export'}
                          </Button>
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
              {/* Bulk Actions */}
              {hasSelectedPayments && (
                <div className='flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-blue-800'>
                      {selectedPaymentsCount} payment(s) selected
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearSelection}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        // Bulk release selected payments
                        selectedPayments.forEach((paymentId) => {
                          updatePaymentStatus(paymentId, 'RELEASED');
                        });
                        clearSelection();
                      }}
                      disabled={isUpdating}
                    >
                      Release All
                    </Button>
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search payments...'
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className='pl-10'
                  />
                </div>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilters({ status: value })}
                >
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                    <SelectItem value='PAID'>Paid</SelectItem>
                    <SelectItem value='IN_ESCROW'>In Escrow</SelectItem>
                    <SelectItem value='RELEASED'>Released</SelectItem>
                    <SelectItem value='REFUNDED'>Refunded</SelectItem>
                    <SelectItem value='DISPUTED'>Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilters({ type: value })}
                >
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
                {isLoading ? (
                  <div className='p-8 text-center'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                    <p className='text-gray-500'>Loading payments...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className='p-8 text-center'>
                    <AlertCircle className='h-8 w-8 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500'>No payments found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12'>
                          <Checkbox
                            checked={
                              selectedPayments.length === payments.length &&
                              payments.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllPayments();
                              } else {
                                deselectAllPayments();
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Payment Details</TableHead>
                        <TableHead>Parties</TableHead>
                        <TableHead>Job & Amount</TableHead>
                        <TableHead>Payment Info</TableHead>
                        <TableHead>Status & Timing</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPayments.includes(payment.id)}
                              onCheckedChange={() =>
                                togglePaymentSelection(payment.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2'>
                              <div className='font-medium'>{payment.id}</div>
                              <div className='text-sm text-gray-500'>
                                {payment.description}
                              </div>
                              <div className='flex items-center gap-2'>
                                {getTypeBadge(
                                  payment.isEscrow ? 'ESCROW' : 'MILESTONE'
                                )}
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
                                  {payment.customer.firstName}{' '}
                                  {payment.customer.lastName}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {payment.customer.email}
                                </div>
                              </div>
                              <div>
                                <div className='font-medium text-sm'>
                                  Vendor
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {payment.vendor.firstName}{' '}
                                  {payment.vendor.lastName}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {payment.vendor.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2'>
                              <div className='text-sm font-medium line-clamp-2'>
                                {payment.job?.title || 'N/A'}
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
                                {getPaymentMethodIcon(
                                  payment.paymentMethod || payment.method
                                )}
                                <span className='text-sm'>
                                  {payment.paymentMethod || payment.method}
                                </span>
                              </div>
                              <div className='text-xs text-gray-500'>
                                TXN: {payment.transactionId || 'N/A'}
                              </div>
                              <div className='text-xs text-gray-500'>
                                Created:{' '}
                                {new Date(
                                  payment.createdAt
                                ).toLocaleDateString()}
                              </div>
                              {payment.paidAt && (
                                <div className='text-xs text-gray-500'>
                                  Paid:{' '}
                                  {new Date(
                                    payment.paidAt
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                {payment.status === 'RELEASED' ? (
                                  <CheckCircle className='h-4 w-4 text-green-600' />
                                ) : payment.status === 'DISPUTED' ? (
                                  <XCircle className='h-4 w-4 text-red-600' />
                                ) : payment.status === 'IN_ESCROW' ? (
                                  <Activity className='h-4 w-4 text-blue-600' />
                                ) : (
                                  <Clock className='h-4 w-4 text-yellow-600' />
                                )}
                                <span className='text-sm font-medium'>
                                  {payment.status}
                                </span>
                              </div>
                              <div className='text-xs text-gray-500'>
                                {payment.status === 'RELEASED'
                                  ? 'Successfully released'
                                  : payment.status === 'DISPUTED'
                                  ? 'Payment disputed'
                                  : payment.status === 'IN_ESCROW'
                                  ? 'Held in escrow'
                                  : 'Awaiting completion'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Button variant='ghost' size='sm'>
                                <Eye className='h-4 w-4' />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant='ghost' size='sm'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Update Payment Status
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Change the status of payment {payment.id}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-2'>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          updatePaymentStatus(
                                            payment.id,
                                            'RELEASED'
                                          )
                                        }
                                        disabled={isUpdating}
                                      >
                                        Release
                                      </Button>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                          updatePaymentStatus(
                                            payment.id,
                                            'REFUNDED'
                                          )
                                        }
                                        disabled={isUpdating}
                                      >
                                        Refund
                                      </Button>
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagination */}
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
                    onClick={() => updatePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => updatePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
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
