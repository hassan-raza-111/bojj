import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';

interface VendorPayout {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED' | 'FAILED';
  method: 'STRIPE' | 'BANK_TRANSFER' | 'PAYPAL' | 'CHECK';
  description?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
  stripePayoutId?: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    jobId: string;
    job: {
      title: string;
    };
  }>;
}

const AdminPayoutManagementPage = () => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<VendorPayout | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState({
    totalPayouts: 0,
    pendingPayouts: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  // Fetch all payouts
  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/vendor-payouts/admin/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPayouts(data.data);
        
        // Calculate stats
        const totalAmount = data.data.reduce((sum: number, payout: VendorPayout) => sum + payout.amount, 0);
        const pendingAmount = data.data
          .filter((payout: VendorPayout) => payout.status === 'PENDING')
          .reduce((sum: number, payout: VendorPayout) => sum + payout.amount, 0);
        const pendingCount = data.data.filter((payout: VendorPayout) => payout.status === 'PENDING').length;
        
        setStats({
          totalPayouts: data.data.length,
          pendingPayouts: pendingCount,
          totalAmount,
          pendingAmount,
        });
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  // Approve payout
  const handleApprovePayout = async (payoutId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendor-payouts/admin/${payoutId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Payout Approved',
          description: 'Payout has been approved successfully',
        });
        setAdminNotes('');
        setSelectedPayout(null);
        fetchPayouts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to approve payout',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve payout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Process payout
  const handleProcessPayout = async (payoutId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendor-payouts/admin/${payoutId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Payout Processed',
          description: 'Payout has been processed successfully',
        });
        setAdminNotes('');
        setSelectedPayout(null);
        fetchPayouts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to process payout',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reject payout
  const handleRejectPayout = async (payoutId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendor-payouts/admin/${payoutId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Payout Rejected',
          description: 'Payout has been rejected',
        });
        setAdminNotes('');
        setSelectedPayout(null);
        fetchPayouts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to reject payout',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject payout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'PROCESSED':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Processed</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingPayouts = payouts.filter(payout => payout.status === 'PENDING');
  const approvedPayouts = payouts.filter(payout => payout.status === 'APPROVED');
  const processedPayouts = payouts.filter(payout => payout.status === 'PROCESSED');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payout Management</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayouts}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalAmount)} total amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayouts}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingAmount)} pending amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Payouts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingPayouts.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedPayouts.length})</TabsTrigger>
          <TabsTrigger value="all">All Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPayouts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending payouts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingPayouts.map((payout) => (
                <Card key={payout.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{formatCurrency(payout.amount)}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(payout.requestedAt)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {payout.vendor.firstName} {payout.vendor.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">({payout.vendor.email})</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Method: {payout.method.replace('_', ' ')}</span>
                    </div>
                    
                    {payout.description && (
                      <div className="text-sm text-muted-foreground">
                        {payout.description}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleApprovePayout(payout.id)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleRejectPayout(payout.id)}
                        disabled={loading}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedPayouts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No approved payouts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedPayouts.map((payout) => (
                <Card key={payout.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{formatCurrency(payout.amount)}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(payout.requestedAt)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {payout.vendor.firstName} {payout.vendor.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">({payout.vendor.email})</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Method: {payout.method.replace('_', ' ')}</span>
                    </div>
                    
                    {payout.description && (
                      <div className="text-sm text-muted-foreground">
                        {payout.description}
                      </div>
                    )}

                    <Button 
                      onClick={() => handleProcessPayout(payout.id)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Process Payout
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {payouts.map((payout) => (
              <Card key={payout.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{formatCurrency(payout.amount)}</span>
                      {getStatusBadge(payout.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payout.requestedAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {payout.vendor.firstName} {payout.vendor.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">({payout.vendor.email})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">Method: {payout.method.replace('_', ' ')}</span>
                  </div>
                  
                  {payout.description && (
                    <div className="text-sm text-muted-foreground">
                      {payout.description}
                    </div>
                  )}

                  {payout.adminNotes && (
                    <div className="text-sm bg-muted p-2 rounded">
                      <strong>Admin Notes:</strong> {payout.adminNotes}
                    </div>
                  )}

                  {payout.stripePayoutId && (
                    <div className="text-sm text-muted-foreground">
                      Stripe Payout ID: {payout.stripePayoutId}
                    </div>
                  )}

                  {payout.payments.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium mb-2">Included Payments:</div>
                      <div className="space-y-1">
                        {payout.payments.map((payment) => (
                          <div key={payment.id} className="text-sm text-muted-foreground">
                            {payment.job.title} - {formatCurrency(payment.amount)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Notes Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Admin Notes</h3>
            <Textarea
              placeholder="Enter admin notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mb-4"
            />
            <div className="flex space-x-2">
              <Button onClick={() => setSelectedPayout(null)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => setSelectedPayout(null)}>
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutManagementPage;

