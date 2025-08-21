import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Check,
  X,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Loader2,
  Shield,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Payment {
  id: string;
  jobId: string;
  jobTitle: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_escrow' | 'released' | 'refunded' | 'disputed';
  paymentMethod: string;
  transactionId?: string;
  escrowReleaseDate?: string;
  refundDate?: string;
  disputeReason?: string;
  createdAt: string;
  actionLoading?: boolean;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const { toast } = useToast();

  // Mock data for fallback
  const mockPayments: Payment[] = [
    {
      id: '1',
      jobId: 'JOB001',
      jobTitle: 'E-commerce Website Development',
      customerId: 'CUST001',
      customerName: 'Aisha Rahman',
      customerEmail: 'aisha.rahman@example.com',
      vendorId: 'VEND001',
      vendorName: 'Ahmed Khan',
      vendorEmail: 'ahmed.khan@example.com',
      amount: 45000,
      currency: 'PKR',
      status: 'in_escrow',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN123456789',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      jobId: 'JOB002',
      jobTitle: 'Mobile App UI/UX Design',
      customerId: 'CUST002',
      customerName: 'Omar Ahmed',
      customerEmail: 'omar.ahmed@example.com',
      vendorId: 'VEND002',
      vendorName: 'Fatima Ali',
      vendorEmail: 'fatima.ali@example.com',
      amount: 28000,
      currency: 'PKR',
      status: 'released',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654321',
      escrowReleaseDate: '2024-01-20',
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      jobId: 'JOB003',
      jobTitle: 'Content Writing for Blog',
      customerId: 'CUST003',
      customerName: 'Zara Khan',
      customerEmail: 'zara.khan@example.com',
      vendorId: 'VEND003',
      vendorName: 'Muhammad Hassan',
      vendorEmail: 'm.hassan@example.com',
      amount: 12000,
      currency: 'PKR',
      status: 'pending',
      paymentMethod: 'PayPal',
      createdAt: '2024-01-18',
    },
    {
      id: '4',
      jobId: 'JOB004',
      jobTitle: 'Logo Design and Branding',
      customerId: 'CUST004',
      customerName: 'Hassan Ali',
      customerEmail: 'hassan.ali@example.com',
      vendorId: 'VEND004',
      vendorName: 'Ayesha Malik',
      vendorEmail: 'ayesha.malik@example.com',
      amount: 18000,
      currency: 'PKR',
      status: 'disputed',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN456789123',
      disputeReason: 'Quality not as expected',
      createdAt: '2024-01-12',
    },
  ];

  // Filtered payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.jobTitle
        .toLowerCase()
        .includes(paymentSearchQuery.toLowerCase()) ||
      payment.customerName
        .toLowerCase()
        .includes(paymentSearchQuery.toLowerCase()) ||
      payment.vendorName
        .toLowerCase()
        .includes(paymentSearchQuery.toLowerCase()) ||
      payment.transactionId
        ?.toLowerCase()
        .includes(paymentSearchQuery.toLowerCase());
    const matchesStatus =
      paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch payments from API
  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/payments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayments(
            data.data.map((payment: Payment) => ({
              ...payment,
              actionLoading: false,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Use mock data as fallback
      setPayments(
        mockPayments.map((payment) => ({ ...payment, actionLoading: false }))
      );
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Handle payment approval
  const handleApprovePayment = async (paymentId: string) => {
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
          description: 'Payment has been approved and moved to escrow',
        });
        fetchPayments();
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

  // Handle payment rejection
  const handleRejectPayment = async (paymentId: string) => {
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
          title: '❌ Payment Rejected',
          description: 'Payment has been rejected',
        });
        fetchPayments();
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

  // Handle payment release from escrow
  const handleReleasePayment = async (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, actionLoading: true } : p))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/release`,
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
          title: '✅ Payment Released',
          description: 'Payment has been released from escrow to vendor',
        });
        fetchPayments();
      } else {
        throw new Error('Failed to release payment');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to release payment',
        variant: 'destructive',
      });
    }
  };

  // Handle payment refund
  const handleRefundPayment = async (paymentId: string) => {
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
          description: 'Payment has been refunded to customer',
        });
        fetchPayments();
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

  // Handle view payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_escrow':
        return 'default';
      case 'released':
        return 'default';
      case 'refunded':
        return 'destructive';
      case 'disputed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-4 w-4' />;
      case 'in_escrow':
        return <Shield className='h-4 w-4' />;
      case 'released':
        return <CheckCircle className='h-4 w-4' />;
      case 'refunded':
        return <XCircle className='h-4 w-4' />;
      case 'disputed':
        return <AlertTriangle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Payment Management
          </h3>
          <p className='text-sm text-gray-600'>
            Monitor transactions, escrow, and payment releases
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm'>
            <Upload className='h-4 w-4 mr-2' />
            Import
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search payments by job title, customer, vendor, or transaction ID...'
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={paymentStatusFilter}
              onValueChange={setPaymentStatusFilter}
            >
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='in_escrow'>In Escrow</SelectItem>
                <SelectItem value='released'>Released</SelectItem>
                <SelectItem value='refunded'>Refunded</SelectItem>
                <SelectItem value='disputed'>Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Payments ({filteredPayments.length})</span>
            <Button variant='outline' size='sm' onClick={fetchPayments}>
              <RotateCcw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              <span className='ml-2 text-gray-600'>Loading payments...</span>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job & Payment</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-medium text-gray-900'>
                            {payment.jobTitle}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Job ID: {payment.jobId}
                          </p>
                          {payment.transactionId && (
                            <p className='text-xs text-gray-400'>
                              TXN: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-medium text-gray-900'>
                            {payment.customerName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {payment.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-medium text-gray-900'>
                            {payment.vendorName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {payment.vendorEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className='text-gray-500'>{payment.currency}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(payment.status)}
                          className='flex items-center gap-1'
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status
                            .replace('_', ' ')
                            .charAt(0)
                            .toUpperCase() +
                            payment.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          {payment.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>

                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleApprovePayment(payment.id)}
                                disabled={payment.actionLoading}
                                className='text-green-600 hover:text-green-700 hover:bg-green-50'
                              >
                                {payment.actionLoading ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <Check className='h-4 w-4' />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRejectPayment(payment.id)}
                                disabled={payment.actionLoading}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                {payment.actionLoading ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <X className='h-4 w-4' />
                                )}
                              </Button>
                            </>
                          )}

                          {payment.status === 'in_escrow' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleReleasePayment(payment.id)}
                              disabled={payment.actionLoading}
                              className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            >
                              {payment.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <TrendingUp className='h-4 w-4' />
                              )}
                            </Button>
                          )}

                          {(payment.status === 'in_escrow' ||
                            payment.status === 'pending') && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleRefundPayment(payment.id)}
                              disabled={payment.actionLoading}
                              className='text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                            >
                              {payment.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <TrendingDown className='h-4 w-4' />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!paymentsLoading && filteredPayments.length === 0 && (
            <div className='text-center py-8'>
              <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>
                No payments found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about payment for {selectedPayment?.jobTitle}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className='space-y-6'>
              {/* Payment Overview */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <p className='text-sm text-gray-600'>Amount</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(
                        selectedPayment.amount,
                        selectedPayment.currency
                      )}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-gray-600'>Status</p>
                    <Badge
                      variant={getStatusBadgeVariant(selectedPayment.status)}
                      className='mt-1'
                    >
                      {getStatusIcon(selectedPayment.status)}
                      {selectedPayment.status
                        .replace('_', ' ')
                        .charAt(0)
                        .toUpperCase() +
                        selectedPayment.status.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-gray-600'>Method</p>
                    <p className='text-lg font-medium text-gray-900'>
                      {selectedPayment.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>
                  Job Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-600'>Job Title</p>
                    <p className='font-medium'>{selectedPayment.jobTitle}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Job ID</p>
                    <p className='font-medium'>{selectedPayment.jobId}</p>
                  </div>
                </div>
              </div>

              {/* Customer & Vendor */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Customer</h4>
                  <div className='space-y-2'>
                    <p className='text-sm text-gray-600'>Name</p>
                    <p className='font-medium'>
                      {selectedPayment.customerName}
                    </p>
                    <p className='text-sm text-gray-600'>Email</p>
                    <p className='font-medium'>
                      {selectedPayment.customerEmail}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>Vendor</h4>
                  <div className='space-y-2'>
                    <p className='text-sm text-gray-600'>Name</p>
                    <p className='font-medium'>{selectedPayment.vendorName}</p>
                    <p className='text-sm text-gray-600'>Email</p>
                    <p className='font-medium'>{selectedPayment.vendorEmail}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h4 className='font-medium text-gray-900 mb-3'>
                  Transaction Details
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-600'>Transaction ID</p>
                    <p className='font-medium'>
                      {selectedPayment.transactionId || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Created Date</p>
                    <p className='font-medium'>
                      {new Date(selectedPayment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedPayment.escrowReleaseDate && (
                    <div>
                      <p className='text-sm text-gray-600'>
                        Escrow Release Date
                      </p>
                      <p className='font-medium'>
                        {new Date(
                          selectedPayment.escrowReleaseDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedPayment.refundDate && (
                    <div>
                      <p className='text-sm text-gray-600'>Refund Date</p>
                      <p className='font-medium'>
                        {new Date(
                          selectedPayment.refundDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dispute Information */}
              {selectedPayment.disputeReason && (
                <div>
                  <h4 className='font-medium text-gray-900 mb-3'>
                    Dispute Information
                  </h4>
                  <p className='text-sm text-gray-600 bg-red-50 p-3 rounded border border-red-200'>
                    {selectedPayment.disputeReason}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                {selectedPayment.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprovePayment(selectedPayment.id);
                        setShowPaymentDetails(false);
                      }}
                      className='bg-green-600 hover:bg-green-700'
                    >
                      <Check className='h-4 w-4 mr-2' />
                      Approve
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        handleRejectPayment(selectedPayment.id);
                        setShowPaymentDetails(false);
                      }}
                      className='border-red-200 text-red-600 hover:bg-red-50'
                    >
                      <X className='h-4 w-4 mr-2' />
                      Reject
                    </Button>
                  </>
                )}

                {selectedPayment.status === 'in_escrow' && (
                  <>
                    <Button
                      onClick={() => {
                        handleReleasePayment(selectedPayment.id);
                        setShowPaymentDetails(false);
                      }}
                      className='bg-blue-600 hover:bg-blue-700'
                    >
                      <TrendingUp className='h-4 w-4 mr-2' />
                      Release from Escrow
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        handleRefundPayment(selectedPayment.id);
                        setShowPaymentDetails(false);
                      }}
                      className='border-orange-200 text-orange-600 hover:bg-orange-50'
                    >
                      <TrendingDown className='h-4 w-4 mr-2' />
                      Refund
                    </Button>
                  </>
                )}

                {(selectedPayment.status === 'pending' ||
                  selectedPayment.status === 'in_escrow') && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      handleRefundPayment(selectedPayment.id);
                      setShowPaymentDetails(false);
                    }}
                    className='border-orange-200 text-orange-600 hover:bg-orange-50'
                  >
                    <TrendingDown className='h-4 w-4 mr-2' />
                    Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
