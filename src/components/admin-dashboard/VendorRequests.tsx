import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";

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

interface VendorRequestsProps {
  pendingVendors: any[];
  loading: boolean;
  vendorActionLoading: number | null;
  handleApproveVendor: (id: number) => void;
  handleRejectVendor: (id: number) => void;
}

const VendorRequests: React.FC<VendorRequestsProps> = ({ pendingVendors, loading, vendorActionLoading, handleApproveVendor, handleRejectVendor }) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Pending Vendor Requests</CardTitle>
      <CardDescription>Review and approve new vendor signups.</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingState />
      ) : pendingVendors.length === 0 ? (
        <EmptyState message="No pending vendor requests." />
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[600px] w-full text-sm md:text-base">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingVendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.category}</TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {v.status === "Pending" ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={vendorActionLoading === v.id}
                          onClick={() => handleApproveVendor(v.id)}
                        >
                          {vendorActionLoading === v.id ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )} Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={vendorActionLoading === v.id}
                          onClick={() => handleRejectVendor(v.id)}
                        >
                          {vendorActionLoading === v.id ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )} Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">No actions</span>
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

export default VendorRequests; 