import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Search, Filter, Eye, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getAllPayments, confirmPayment, releasePayment, Payment } from "@/config/adminApi";
import { useToast } from "@/components/ui/use-toast";

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <span className="text-4xl mb-2">😕</span>
    <span className="text-lg">{message}</span>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="animate-spin w-8 h-8 text-primary" />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let variant: any = "secondary";
  let label = status;
  if (status === "PAID" || status === "RELEASED" || status === "Completed") {
    variant = "default";
  } else if (status === "DISPUTED" || status === "REFUNDED" || status === "Rejected") {
    variant = "destructive";
  } else if (status === "PENDING") {
    variant = "secondary";
  } else if (status === "IN_ESCROW") {
    variant = "outline";
  }
  return <Badge variant={variant}>{label}</Badge>;
};

const PaymentDetailsModal = ({ 
  payment, 
  isOpen, 
  onClose 
}: { 
  payment: Payment | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>View detailed payment information</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-lg font-bold text-green-600">
                ${payment.amount.toLocaleString()} {payment.currency}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <StatusBadge status={payment.status} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Method</label>
              <p className="text-sm">{payment.method}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Escrow</label>
              <p className="text-sm">{payment.isEscrow ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="font-medium mb-2">Customer</h4>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium">
                {payment.customer.firstName} {payment.customer.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{payment.customer.email}</p>
            </div>
          </div>

          {/* Vendor Information */}
          <div>
            <h4 className="font-medium mb-2">Vendor</h4>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium">
                {payment.vendor.firstName} {payment.vendor.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{payment.vendor.email}</p>
            </div>
          </div>

          {/* Job Information */}
          {payment.job && (
            <div>
              <h4 className="font-medium mb-2">Job</h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">{payment.job.title}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{new Date(payment.createdAt).toLocaleString()}</p>
            </div>
            {payment.paidAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Paid</label>
                <p className="text-sm">{new Date(payment.paidAt).toLocaleString()}</p>
              </div>
            )}
            {payment.releasedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Released</label>
                <p className="text-sm">{new Date(payment.releasedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [searchTerm, statusFilter, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getAllPayments(statusFilter, page, 10);
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);
      await confirmPayment(paymentId);
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'PAID', paidAt: new Date().toISOString() } : p
      ));
      
      toast({
        title: "Success",
        description: "Payment confirmed successfully",
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReleasePayment = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);
      await releasePayment(paymentId);
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'RELEASED', releasedAt: new Date().toISOString() } : p
      ));
      
      toast({
        title: "Success",
        description: "Payment released successfully",
      });
    } catch (error) {
      console.error('Error releasing payment:', error);
      toast({
        title: "Error",
        description: "Failed to release payment",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.vendor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.vendor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.job?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getStatusCounts = () => {
    const counts = { PENDING: 0, PAID: 0, IN_ESCROW: 0, RELEASED: 0, DISPUTED: 0 };
    payments.forEach(payment => {
      counts[payment.status as keyof typeof counts] = (counts[payment.status as keyof typeof counts] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return <LoadingState />;
  }

  const statusCounts = getStatusCounts();

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalAmount().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{payments.length} transactions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.IN_ESCROW}</div>
              <p className="text-xs text-muted-foreground">Held for release</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCounts.RELEASED + statusCounts.PAID}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>
                  Track and manage all platform transactions. {pagination.total} total payments.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_ESCROW">In Escrow</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="RELEASED">Released</SelectItem>
                    <SelectItem value="DISPUTED">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <EmptyState message={searchTerm ? "No payments match your search." : "No payments found."} />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px] w-full text-sm md:text-base">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">#{payment.id.slice(-8)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {payment.customer.firstName} {payment.customer.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{payment.customer.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {payment.vendor.firstName} {payment.vendor.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{payment.vendor.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {payment.job?.title || 'Service Payment'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-green-600">
                                ${payment.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.currency} • {payment.method}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={payment.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setDetailsModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {payment.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={actionLoading === payment.id}
                                  onClick={() => handleConfirmPayment(payment.id)}
                                >
                                  {actionLoading === payment.id ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Confirm
                                </Button>
                              )}
                              
                              {payment.status === "IN_ESCROW" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionLoading === payment.id}
                                  onClick={() => handleReleasePayment(payment.id)}
                                >
                                  {actionLoading === payment.id ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <DollarSign className="w-4 h-4" />
                                  )}
                                  Release
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(prev => Math.max(1, prev - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {[...Array(pagination.pages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setPage(i + 1)}
                            isActive={page === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                          className={page === pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPayment(null);
        }}
      />
    </>
  );
};

export default Payments; 