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
  UserCheck,
  UserX,
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
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  location?: string;
  preferences?: string[];
  createdAt: string;
  actionLoading?: boolean;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const { toast } = useToast();

  // Mock data for fallback
  const mockCustomers: Customer[] = [
    {
      id: '1',
      firstName: 'Aisha',
      lastName: 'Rahman',
      email: 'aisha.rahman@example.com',
      phone: '+92-300-1111111',
      status: 'active',
      totalOrders: 15,
      totalSpent: 45000,
      lastOrderDate: '2024-01-18',
      location: 'Karachi, Pakistan',
      preferences: ['Web Development', 'Mobile Apps', 'UI/UX Design'],
      createdAt: '2024-01-05',
    },
    {
      id: '2',
      firstName: 'Omar',
      lastName: 'Ahmed',
      email: 'omar.ahmed@example.com',
      phone: '+92-301-2222222',
      status: 'active',
      totalOrders: 8,
      totalSpent: 28000,
      lastOrderDate: '2024-01-20',
      location: 'Lahore, Pakistan',
      preferences: ['Graphic Design', 'Logo Design', 'Branding'],
      createdAt: '2024-01-12',
    },
    {
      id: '3',
      firstName: 'Zara',
      lastName: 'Khan',
      email: 'zara.khan@example.com',
      phone: '+92-302-3333333',
      status: 'inactive',
      totalOrders: 3,
      totalSpent: 12000,
      lastOrderDate: '2024-01-10',
      location: 'Islamabad, Pakistan',
      preferences: ['Content Writing', 'SEO', 'Social Media'],
      createdAt: '2024-01-15',
    },
    {
      id: '4',
      firstName: 'Hassan',
      lastName: 'Ali',
      email: 'hassan.ali@example.com',
      phone: '+92-303-4444444',
      status: 'suspended',
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: undefined,
      location: 'Peshawar, Pakistan',
      preferences: [],
      createdAt: '2024-01-08',
    },
  ];

  // Filtered customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName
        .toLowerCase()
        .includes(customerSearchQuery.toLowerCase()) ||
      customer.lastName
        .toLowerCase()
        .includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase());
    const matchesStatus =
      customerStatusFilter === 'all' ||
      customer.status === customerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch customers from API
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/customers',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomers(
            data.data.map((customer: Customer) => ({
              ...customer,
              actionLoading: false,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Use mock data as fallback
      setCustomers(
        mockCustomers.map((customer) => ({ ...customer, actionLoading: false }))
      );
    } finally {
      setCustomersLoading(false);
    }
  };

  // Handle customer status toggle
  const handleToggleCustomerStatus = async (
    customerId: string,
    newStatus: 'active' | 'inactive' | 'suspended'
  ) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, actionLoading: true } : c))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/customers/${customerId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast({
          title: `✅ Customer Status Updated`,
          description: `Customer status changed to ${newStatus}`,
        });
        fetchCustomers();
      } else {
        throw new Error(`Failed to update customer status to ${newStatus}`);
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update customer status',
        variant: 'destructive',
      });
    }
  };

  // Handle view customer details
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Customer Management
          </h3>
          <p className='text-sm text-gray-600'>
            Manage customer accounts and preferences
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
                placeholder='Search customers by name, email, or preferences...'
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={customerStatusFilter}
              onValueChange={setCustomerStatusFilter}
            >
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Customers ({filteredCustomers.length})</span>
            <Button variant='outline' size='sm' onClick={fetchCustomers}>
              <RotateCcw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              <span className='ml-2 text-gray-600'>Loading customers...</span>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?name=${customer.firstName}+${customer.lastName}&background=10b981&color=fff`}
                            />
                            <AvatarFallback className='bg-green-100 text-green-600'>
                              {customer.firstName[0]}
                              {customer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {customer.email}
                            </p>
                            {customer.phone && (
                              <p className='text-xs text-gray-400 flex items-center'>
                                <Phone className='h-3 w-3 mr-1' />
                                {customer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(customer.status)}>
                          {customer.status.charAt(0).toUpperCase() +
                            customer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>{customer.totalOrders}</p>
                          <p className='text-gray-500'>Orders</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>
                            {formatCurrency(customer.totalSpent || 0)}
                          </p>
                          <p className='text-gray-500'>Total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          {customer.lastOrderDate ? (
                            new Date(
                              customer.lastOrderDate
                            ).toLocaleDateString()
                          ) : (
                            <span className='text-gray-400'>No orders</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center text-sm text-gray-600'>
                          <MapPin className='h-4 w-4 mr-1' />
                          {customer.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>

                          {customer.status === 'active' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleCustomerStatus(
                                  customer.id,
                                  'inactive'
                                )
                              }
                              disabled={customer.actionLoading}
                              className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                            >
                              {customer.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <UserX className='h-4 w-4' />
                              )}
                            </Button>
                          )}

                          {customer.status === 'inactive' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleCustomerStatus(
                                  customer.id,
                                  'active'
                                )
                              }
                              disabled={customer.actionLoading}
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              {customer.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <UserCheck className='h-4 w-4' />
                              )}
                            </Button>
                          )}

                          {customer.status === 'suspended' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleCustomerStatus(
                                  customer.id,
                                  'active'
                                )
                              }
                              disabled={customer.actionLoading}
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              {customer.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <UserCheck className='h-4 w-4' />
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

          {!customersLoading && filteredCustomers.length === 0 && (
            <div className='text-center py-8'>
              <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>
                No customers found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedCustomer?.firstName}{' '}
              {selectedCustomer?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='flex items-center space-x-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${selectedCustomer.firstName}+${selectedCustomer.lastName}&background=10b981&color=fff`}
                  />
                  <AvatarFallback className='bg-green-100 text-green-600 text-xl'>
                    {selectedCustomer.firstName[0]}
                    {selectedCustomer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-xl font-semibold'>
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className='text-gray-600'>{selectedCustomer.email}</p>
                  <div className='flex items-center space-x-4 mt-2'>
                    <Badge
                      variant={getStatusBadgeVariant(selectedCustomer.status)}
                    >
                      {selectedCustomer.status.charAt(0).toUpperCase() +
                        selectedCustomer.status.slice(1)}
                    </Badge>
                    <Badge variant='secondary'>
                      <ShoppingBag className='h-3 w-3 mr-1' />
                      {selectedCustomer.totalOrders} Orders
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <h4 className='font-medium text-gray-900'>
                    Contact Information
                  </h4>
                  {selectedCustomer.phone && (
                    <p className='text-sm text-gray-600 flex items-center'>
                      <Phone className='h-4 w-4 mr-2' />
                      {selectedCustomer.phone}
                    </p>
                  )}
                  <p className='text-sm text-gray-600 flex items-center'>
                    <Mail className='h-4 w-4 mr-2' />
                    {selectedCustomer.email}
                  </p>
                  {selectedCustomer.location && (
                    <p className='text-sm text-gray-600 flex items-center'>
                      <MapPin className='h-4 w-4 mr-2' />
                      {selectedCustomer.location}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <h4 className='font-medium text-gray-900'>
                    Order Statistics
                  </h4>
                  <p className='text-sm text-gray-600 flex items-center'>
                    <ShoppingBag className='h-4 w-4 mr-2' />
                    Total Orders: {selectedCustomer.totalOrders}
                  </p>
                  <p className='text-sm text-gray-600 flex items-center'>
                    <CreditCard className='h-4 w-4 mr-2' />
                    Total Spent:{' '}
                    {formatCurrency(selectedCustomer.totalSpent || 0)}
                  </p>
                  <p className='text-sm text-gray-600 flex items-center'>
                    <Calendar className='h-4 w-4 mr-2' />
                    Joined:{' '}
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                  {selectedCustomer.lastOrderDate && (
                    <p className='text-sm text-gray-600 flex items-center'>
                      <Heart className='h-4 w-4 mr-2' />
                      Last Order:{' '}
                      {new Date(
                        selectedCustomer.lastOrderDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Preferences */}
              {selectedCustomer.preferences &&
                selectedCustomer.preferences.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Service Preferences
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {selectedCustomer.preferences.map((preference, index) => (
                        <Badge key={index} variant='secondary'>
                          {preference}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                {selectedCustomer.status === 'active' && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      handleToggleCustomerStatus(
                        selectedCustomer.id,
                        'inactive'
                      );
                      setShowCustomerDetails(false);
                    }}
                    className='border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                  >
                    <UserX className='h-4 w-4 mr-2' />
                    Deactivate
                  </Button>
                )}

                {selectedCustomer.status === 'inactive' && (
                  <Button
                    onClick={() => {
                      handleToggleCustomerStatus(selectedCustomer.id, 'active');
                      setShowCustomerDetails(false);
                    }}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <UserCheck className='h-4 w-4 mr-2' />
                    Activate
                  </Button>
                )}

                {selectedCustomer.status === 'suspended' && (
                  <Button
                    onClick={() => {
                      handleToggleCustomerStatus(selectedCustomer.id, 'active');
                      setShowCustomerDetails(false);
                    }}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <UserCheck className='h-4 w-4 mr-2' />
                    Reactivate
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

export default CustomerManagement;
