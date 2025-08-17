import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <span className="text-4xl mb-2">😕</span>
    <span className="text-lg">{message}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let variant: any = "secondary";
  let label = status;
  if (status === "Approved" || status === "Active" || status === "Completed") {
    variant = "default";
  } else if (status === "Rejected" || status === "Inactive") {
    variant = "destructive";
  } else if (status === "Pending") {
    variant = "secondary";
  } else if (status === "On Hold") {
    variant = "outline";
  }
  return <span className={`inline-block px-2 py-1 rounded text-xs font-medium bg-${variant === "default" ? "primary/10 text-primary" : variant === "destructive" ? "destructive/10 text-destructive" : variant === "outline" ? "border border-border text-foreground" : "muted"}`}>{label}</span>;
};

interface PaymentsProps {
  payments: any[];
  paymentActionLoading: number | null;
  handleConfirmPayment: (id: number) => void;
  handleReleasePayment: (id: number) => void;
}

const Payments: React.FC<PaymentsProps> = ({ payments, paymentActionLoading, handleConfirmPayment, handleReleasePayment }) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Payment Oversight</CardTitle>
      <CardDescription>Track and manage all platform transactions.</CardDescription>
    </CardHeader>
    <CardContent>
      {payments.length === 0 ? (
        <EmptyState message="No payments found." />
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[600px] w-full text-sm md:text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.jobId}</TableCell>
                  <TableCell>{p.vendor}</TableCell>
                  <TableCell>{p.customer}</TableCell>
                  <TableCell>${p.amount}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {p.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={paymentActionLoading === p.id}
                        onClick={() => handleConfirmPayment(p.id)}
                      >
                        {paymentActionLoading === p.id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    )}
                    {p.status === "On Hold" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={paymentActionLoading === p.id}
                        onClick={() => handleReleasePayment(p.id)}
                      >
                        {paymentActionLoading === p.id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Release Payment"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Payments; 