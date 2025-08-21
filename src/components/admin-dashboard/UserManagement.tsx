import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Loader2, Search, Filter, Eye, MoreHorizontal, UserCheck, UserX, Building, Star, DollarSign } from "lucide-react";
import { getAllVendors, getAllCustomers, toggleVendorStatus, toggleCustomerStatus, Vendor, Customer } from "@/config/adminApi";
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
  if (status === "ACTIVE" || status === "Approved" || status === "Completed") {
    variant = "default";
  } else if (status === "SUSPENDED" || status === "Rejected" || status === "Inactive") {
    variant = "destructive";
  } else if (status === "PENDING") {
    variant = "secondary";
  } else if (status === "On Hold") {
    variant = "outline";
  }
  return <Badge variant={variant}>{label}</Badge>;
};

const UserProfileModal = ({ 
  user, 
  userType,
  isOpen, 
  onClose 
}: { 
  user: Vendor | Customer | null; 
  userType: 'vendor' | 'customer';
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{userType === 'vendor' ? 'Vendor' : 'Customer'} Profile Details</DialogTitle>
          <DialogDescription>View detailed user information</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <StatusBadge status={user.status} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Joined</label>
              <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Profile Information */}
          {userType === 'vendor' && 'vendorProfile' in user && user.vendorProfile && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Building className="w-4 h-4" />
                Business Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="text-sm">{user.vendorProfile.companyName || 'Individual'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                  <p className="text-sm">{user.vendorProfile.businessType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Experience</label>
                  <p className="text-sm">{user.vendorProfile.experience || 0} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rating</label>
                  <p className="text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {user.vendorProfile.rating.toFixed(1)} ({user.vendorProfile.totalReviews} reviews)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed Jobs</label>
                  <p className="text-sm">{user.vendorProfile.completedJobs}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.vendorProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {userType === 'customer' && 'customerProfile' in user && user.customerProfile && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Customer Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jobs Posted</label>
                  <p className="text-sm">{user.customerProfile.totalJobsPosted}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                  <p className="text-sm flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ${user.customerProfile.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                  <p className="text-sm">{user.customerProfile.budgetRange || 'Not specified'}</p>
                </div>
              </div>

              {/* Preferred Categories */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Categories</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.customerProfile.preferredCategories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

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

const UserManagement: React.FC = () => {
  // State for vendors
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = useState<string>("");
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorPagination, setVendorPagination] = useState({ total: 0, pages: 0 });

  // State for customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>("");
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPagination, setCustomerPagination] = useState({ total: 0, pages: 0 });

  // Common state
  const [selectedUser, setSelectedUser] = useState<Vendor | Customer | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userType, setUserType] = useState<'vendor' | 'customer'>('vendor');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const response = await getAllVendors(vendorSearch, vendorStatusFilter, vendorPage, 10);
      setVendors(response.data);
      setVendorPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive"
      });
    } finally {
      setVendorsLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await getAllCustomers(customerSearch, customerStatusFilter, customerPage, 10);
      setCustomers(response.data);
      setCustomerPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchVendors();
  }, [vendorSearch, vendorStatusFilter, vendorPage]);

  useEffect(() => {
    fetchCustomers();
  }, [customerSearch, customerStatusFilter, customerPage]);

  // Handle vendor status toggle
  const handleToggleVendorStatus = async (vendorId: string, currentStatus: string) => {
    try {
      setActionLoading(vendorId);
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await toggleVendorStatus(vendorId, newStatus);
      
      // Update local state
      setVendors(prev => prev.map(v => 
        v.id === vendorId ? { ...v, status: newStatus } : v
      ));
      
      toast({
        title: "Success",
        description: `Vendor status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle customer status toggle
  const handleToggleCustomerStatus = async (customerId: string, currentStatus: string) => {
    try {
      setActionLoading(customerId);
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await toggleCustomerStatus(customerId, newStatus);
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, status: newStatus } : c
      ));
      
      toast({
        title: "Success",
        description: `Customer status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Tabs defaultValue="vendors" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="vendors">Vendors</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
      </TabsList>

      <TabsContent value="vendors" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Vendors</CardTitle>
                <CardDescription>
                  Manage vendor accounts and status. {vendorPagination.total} total vendors.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search vendors..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-48"
                />
                <Select value={vendorStatusFilter} onValueChange={setVendorStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {vendorsLoading ? (
              <LoadingState />
            ) : vendors.length === 0 ? (
              <EmptyState message="No vendors found." />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table className="min-w-[800px] w-full text-sm md:text-base">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Business Info</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
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
                              <p className="text-xs text-muted-foreground">
                                {vendor.vendorProfile?.experience || 0} years exp.
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{vendor.vendorProfile?.rating.toFixed(1) || '0.0'}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {vendor.vendorProfile?.completedJobs || 0} jobs
                              </p>
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
                                  setSelectedUser(vendor);
                                  setUserType('vendor');
                                  setProfileModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={vendor.status === "ACTIVE" ? "destructive" : "secondary"}
                                disabled={actionLoading === vendor.id}
                                onClick={() => handleToggleVendorStatus(vendor.id, vendor.status)}
                              >
                                {actionLoading === vendor.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : vendor.status === "ACTIVE" ? (
                                  "Suspend"
                                ) : (
                                  "Activate"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {vendorPagination.pages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setVendorPage(prev => Math.max(1, prev - 1))}
                          className={vendorPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {[...Array(vendorPagination.pages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setVendorPage(i + 1)}
                            isActive={vendorPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setVendorPage(prev => Math.min(vendorPagination.pages, prev + 1))}
                          className={vendorPage === vendorPagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="customers" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>
                  Manage customer accounts and status. {customerPagination.total} total customers.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-48"
                />
                <Select value={customerStatusFilter} onValueChange={setCustomerStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <LoadingState />
            ) : customers.length === 0 ? (
              <EmptyState message="No customers found." />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table className="min-w-[800px] w-full text-sm md:text-base">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Preferences</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary font-medium text-sm">
                                  {customer.firstName[0]}{customer.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {customer.customerProfile?.totalJobsPosted || 0} jobs posted
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${customer.customerProfile?.totalSpent.toLocaleString() || '0'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Budget: {customer.customerProfile?.budgetRange || 'Not specified'}
                              </p>
                              <div className="flex flex-wrap gap-1 max-w-32">
                                {customer.customerProfile?.preferredCategories.slice(0, 2).map((category, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                                {customer.customerProfile?.preferredCategories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{customer.customerProfile.preferredCategories.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={customer.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(customer);
                                  setUserType('customer');
                                  setProfileModalOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={customer.status === "ACTIVE" ? "destructive" : "secondary"}
                                disabled={actionLoading === customer.id}
                                onClick={() => handleToggleCustomerStatus(customer.id, customer.status)}
                              >
                                {actionLoading === customer.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : customer.status === "ACTIVE" ? (
                                  "Suspend"
                                ) : (
                                  "Activate"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {customerPagination.pages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCustomerPage(prev => Math.max(1, prev - 1))}
                          className={customerPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {[...Array(customerPagination.pages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCustomerPage(i + 1)}
                            isActive={customerPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCustomerPage(prev => Math.min(customerPagination.pages, prev + 1))}
                          className={customerPage === customerPagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        userType={userType}
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </Tabs>
  );
};

export default UserManagement; 