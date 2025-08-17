import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

interface UserManagementProps {
  filteredVendors: any[];
  filteredCustomers: any[];
  vendorSearch: string;
  setVendorSearch: (v: string) => void;
  customerSearch: string;
  setCustomerSearch: (v: string) => void;
  handleToggleVendor: (id: number) => void;
  handleToggleCustomer: (id: number) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  filteredVendors,
  filteredCustomers,
  vendorSearch,
  setVendorSearch,
  customerSearch,
  setCustomerSearch,
  handleToggleVendor,
  handleToggleCustomer,
}) => (
  <Tabs defaultValue="vendors" className="w-full">
    <TabsList className="mb-4">
      <TabsTrigger value="vendors">Vendors</TabsTrigger>
      <TabsTrigger value="customers">Customers</TabsTrigger>
    </TabsList>
    <TabsContent value="vendors">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>Search, activate, or deactivate vendors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search vendors..."
            className="mb-4 max-w-xs"
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
          />
          {filteredVendors.length === 0 ? (
            <EmptyState message="No vendors found." />
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
                  {filteredVendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.email}</TableCell>
                      <TableCell>{v.category}</TableCell>
                      <TableCell>
                        <StatusBadge status={v.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={v.status === "Active" ? "destructive" : "secondary"}
                          onClick={() => handleToggleVendor(v.id)}
                        >
                          {v.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="customers">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>Search and deactivate suspicious accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search customers..."
            className="mb-4 max-w-xs"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          {filteredCustomers.length === 0 ? (
            <EmptyState message="No customers found." />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px] w-full text-sm md:text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Signup Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={c.status === "Active" ? "destructive" : "secondary"}
                          onClick={() => handleToggleCustomer(c.id)}
                        >
                          {c.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

export default UserManagement; 