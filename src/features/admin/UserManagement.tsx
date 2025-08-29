import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  BarChart3,
  Activity,
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock data for demonstration
  const users = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      location: 'New York, NY',
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago',
      emailVerified: true,
      phoneVerified: true,
      totalJobs: 5,
      totalSpent: 2500,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1-555-0124',
      role: 'VENDOR',
      status: 'PENDING',
      location: 'Los Angeles, CA',
      joinedDate: '2024-01-20',
      lastActive: '1 day ago',
      emailVerified: true,
      phoneVerified: false,
      totalJobs: 0,
      totalSpent: 0,
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      phone: '+1-555-0125',
      role: 'VENDOR',
      status: 'VERIFIED',
      location: 'Chicago, IL',
      joinedDate: '2024-01-10',
      lastActive: '5 hours ago',
      emailVerified: true,
      phoneVerified: true,
      totalJobs: 12,
      totalSpent: 0,
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah@example.com',
      phone: '+1-555-0126',
      role: 'CUSTOMER',
      status: 'SUSPENDED',
      location: 'Miami, FL',
      joinedDate: '2024-01-05',
      lastActive: '1 week ago',
      emailVerified: true,
      phoneVerified: true,
      totalJobs: 3,
      totalSpent: 1200,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'PENDING':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'VERIFIED':
        return <Badge className='bg-blue-100 text-blue-800'>Verified</Badge>;
      case 'SUSPENDED':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'CUSTOMER':
        return (
          <Badge className='bg-purple-100 text-purple-800'>Customer</Badge>
        );
      case 'VENDOR':
        return (
          <Badge className='bg-emerald-100 text-emerald-800'>Vendor</Badge>
        );
      case 'ADMIN':
        return <Badge className='bg-blue-100 text-blue-800'>Admin</Badge>;
      default:
        return <Badge variant='outline'>{role}</Badge>;
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className='h-4 w-4 text-green-600' />
    ) : (
      <XCircle className='h-4 w-4 text-red-600' />
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>User Management</h1>
        <p className='text-blue-100'>
          Manage all platform users, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Users
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Users className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,247</div>
            <p className='text-xs text-green-600'>+12% from last month</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Active Users
            </CardTitle>
            <div className='p-2 rounded-lg bg-green-50'>
              <UserCheck className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,089</div>
            <p className='text-xs text-green-600'>87.3% of total</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Pending Verification
            </CardTitle>
            <div className='p-2 rounded-lg bg-yellow-50'>
              <Clock className='h-4 w-4 text-yellow-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>23</div>
            <p className='text-xs text-yellow-600'>Requires attention</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Suspended Users
            </CardTitle>
            <div className='p-2 rounded-lg bg-red-50'>
              <UserX className='h-4 w-4 text-red-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>8</div>
            <p className='text-xs text-red-600'>Under review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='all-users' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='all-users'>All Users</TabsTrigger>
          <TabsTrigger value='customers'>Customers</TabsTrigger>
          <TabsTrigger value='vendors'>Vendors</TabsTrigger>
          <TabsTrigger value='admins'>Admins</TabsTrigger>
        </TabsList>

        <TabsContent value='all-users' className='space-y-6'>
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Search, filter, and manage platform users
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='flex items-center gap-2'>
                      <UserPlus className='h-4 w-4' />
                      Add New User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account with specified role and permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium'>First Name</label>
                          <Input placeholder='John' />
                        </div>
                        <div>
                          <label className='text-sm font-medium'>Last Name</label>
                          <Input placeholder='Doe' />
                        </div>
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Email</label>
                        <Input type='email' placeholder='john@example.com' />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Role</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder='Select role' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='customer'>Customer</SelectItem>
                            <SelectItem value='vendor'>Vendor</SelectItem>
                            <SelectItem value='admin'>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex gap-2 justify-end'>
                        <Button variant='outline'>Cancel</Button>
                        <Button>Create User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search users...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                    <SelectItem value='VERIFIED'>Verified</SelectItem>
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Roles</SelectItem>
                    <SelectItem value='CUSTOMER'>Customer</SelectItem>
                    <SelectItem value='VENDOR'>Vendor</SelectItem>
                    <SelectItem value='ADMIN'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold'>
                              {user.firstName.charAt(0)}
                            </div>
                            <div>
                              <div className='font-medium'>
                                {user.firstName} {user.lastName}
                              </div>
                              <div className='text-sm text-gray-500 flex items-center gap-2'>
                                <Mail className='h-3 w-3' />
                                {user.email}
                              </div>
                              <div className='text-sm text-gray-500 flex items-center gap-2'>
                                <Phone className='h-3 w-3' />
                                {user.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1'>
                              {getVerificationIcon(user.emailVerified)}
                              <span className='text-xs'>Email</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              {getVerificationIcon(user.phoneVerified)}
                              <span className='text-xs'>Phone</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-gray-600'>
                            <MapPin className='h-3 w-3' />
                            {user.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-gray-600'>
                            <Calendar className='h-3 w-3' />
                            {user.joinedDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between mt-6'>
                <div className='text-sm text-gray-500'>
                  Showing 1 to {filteredUsers.length} of {users.length} results
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    Previous
                  </Button>
                  <Button variant='outline' size='sm'>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='customers' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Customer Management
              </CardTitle>
              <CardDescription>
                Manage customer accounts and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <UserPlus className='h-4 w-4' />
                  Add Customer
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <UserCheck className='h-4 w-4' />
                  Verify Customers
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Customer Analytics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Customer-specific management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='vendors' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Vendor Management
              </CardTitle>
              <CardDescription>
                Manage vendor accounts, verifications, and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <UserCheck className='h-4 w-4' />
                  Verify Vendors
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  Review Documents
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Star className='h-4 w-4' />
                  Vendor Ratings
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Vendor-specific management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='admins' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Admin Management
              </CardTitle>
              <CardDescription>
                Manage admin accounts and system permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <UserPlus className='h-4 w-4' />
                  Add Admin
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  Manage Permissions
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Activity className='h-4 w-4' />
                  Admin Logs
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Admin-specific management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
