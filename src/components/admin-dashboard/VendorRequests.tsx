import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X, Search, Eye, Star, Briefcase, Building } from "lucide-react";
import { getPendingVendors, approveVendor, rejectVendor, Vendor } from "@/config/adminApi";
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
  if (status === "Approved" || status === "Active" || status === "Completed") {
    variant = "default";
  } else if (status === "Rejected" || status === "Inactive") {
    variant = "destructive";
  } else if (status === "Pending") {
    variant = "secondary";
  } else if (status === "On Hold") {
    variant = "outline";
  }
  return <Badge variant={variant}>{label}</Badge>;
};

const VendorProfileModal = ({ 
  vendor, 
  isOpen, 
  onClose 
}: { 
  vendor: Vendor | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!vendor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vendor Profile Details</DialogTitle>
          <DialogDescription>Review vendor information and documents</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm">{vendor.firstName} {vendor.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{vendor.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <StatusBadge status={vendor.status} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Joined</label>
              <p className="text-sm">{new Date(vendor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Business Information */}
          {vendor.vendorProfile && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Building className="w-4 h-4" />
                Business Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="text-sm">{vendor.vendorProfile.companyName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                  <p className="text-sm">{vendor.vendorProfile.businessType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Experience</label>
                  <p className="text-sm">{vendor.vendorProfile.experience || 0} years</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vendor.vendorProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                // Handle rejection
                onClose();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => {
                // Handle approval
                onClose();
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const VendorRequests: React.FC = () => {
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const vendors = await getPendingVendors();
      setPendingVendors(vendors);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      setActionLoading(vendorId);
      await approveVendor(vendorId);
      
      // Update local state
      setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
      
      toast({
        title: "Success",
        description: "Vendor approved successfully",
      });
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to approve vendor",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(vendorId);
      await rejectVendor(vendorId, rejectReason);
      
      // Update local state
      setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
      
      toast({
        title: "Success",
        description: "Vendor rejected successfully",
      });
      
      setRejectModalOpen(false);
      setRejectReason("");
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to reject vendor",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVendors = pendingVendors.filter(vendor =>
    vendor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.vendorProfile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Pending Vendor Requests</CardTitle>
              <CardDescription>
                Review and approve new vendor signups. {pendingVendors.length} pending approval.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <EmptyState message={searchTerm ? "No vendors match your search." : "No pending vendor requests."} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px] w-full text-sm md:text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Business Info</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {vendor.firstName[0]}{vendor.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{vendor.firstName} {vendor.lastName}</p>
                            <p className="text-sm text-muted-foreground">{vendor.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {vendor.vendorProfile?.companyName || 'Individual'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.vendorProfile?.businessType || 'Not specified'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {vendor.vendorProfile?.experience || 0} years exp.
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-32">
                          {vendor.vendorProfile?.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {vendor.vendorProfile?.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{vendor.vendorProfile.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={vendor.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setProfileModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={actionLoading === vendor.id}
                            onClick={() => handleApproveVendor(vendor.id)}
                          >
                            {actionLoading === vendor.id ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === vendor.id}
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setRejectModalOpen(true);
                            }}
                          >
                            {actionLoading === vendor.id ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Profile Modal */}
      <VendorProfileModal
        vendor={selectedVendor}
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedVendor(null);
        }}
      />

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this vendor. This will help them understand why their application was not approved.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedVendor && handleRejectVendor(selectedVendor.id)}
              disabled={!rejectReason.trim() || actionLoading === selectedVendor?.id}
            >
              {actionLoading === selectedVendor?.id ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorRequests; 