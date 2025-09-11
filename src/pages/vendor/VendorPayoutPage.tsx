import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, CreditCard, History, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface VendorBalance {
  availableBalance: number;
  pendingPayouts: number;
  netAvailable: number;
  paymentCount: number;
}

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
  payments: Array<{
    id: string;
    amount: number;
    jobId: string;
    job: {
      title: string;
    };
  }>;
}

const VendorPayoutPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<VendorBalance | null>(null);
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestMethod, setRequestMethod] = useState('STRIPE');
  const [requestDescription, setRequestDescription] = useState('');

  // Fetch vendor balance
  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/vendor-payouts/vendor/${user?.id}/balance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch payout history
  const fetchPayouts = async () => {
    try {
      const response = await fetch(`/api/vendor-payouts/vendor/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPayouts(data.data);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  // Request payout
  const handleRequestPayout = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (balance && parseFloat(requestAmount) > balance.netAvailable) {
      toast({
        title: 'Insufficient Balance',
        description: `Available balance: $${balance.netAvailable.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor-payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          vendorId: user?.id,
          amount: parseFloat(requestAmount),
          method: requestMethod,
          description: requestDescription,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Payout Requested',
          description: 'Your payout request has been submitted successfully',
        });
        setRequestAmount('');
        setRequestDescription('');
        fetchBalance();
        fetchPayouts();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to request payout',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request payout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBalance();
      fetchPayouts();
    }
  }, [user?.id]);

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Payouts</h1>
      </div>

      {/* Balance Overview */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance.availableBalance)}</div>
              <p className="text-xs text-muted-foreground">
                {balance.paymentCount} completed payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance.pendingPayouts)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Available</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance.netAvailable)}</div>
              <p className="text-xs text-muted-foreground">
                Ready for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance.availableBalance + balance.pendingPayouts)}</div>
              <p className="text-xs text-muted-foreground">
                All time earnings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="request" className="space-y-4">
        <TabsList>
          <TabsTrigger value="request">Request Payout</TabsTrigger>
          <TabsTrigger value="history">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={requestMethod} onValueChange={setRequestMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="CHECK">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Reason for payout request"
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleRequestPayout} 
                disabled={loading || !requestAmount || parseFloat(requestAmount) <= 0}
                className="w-full"
              >
                {loading ? 'Requesting...' : 'Request Payout'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payout history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{formatCurrency(payout.amount)}</span>
                          {getStatusBadge(payout.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(payout.requestedAt)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Method: {payout.method.replace('_', ' ')}
                      </div>
                      
                      {payout.description && (
                        <div className="text-sm mb-2">
                          {payout.description}
                        </div>
                      )}
                      
                      {payout.adminNotes && (
                        <div className="text-sm bg-muted p-2 rounded">
                          <strong>Admin Notes:</strong> {payout.adminNotes}
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPayoutPage;

