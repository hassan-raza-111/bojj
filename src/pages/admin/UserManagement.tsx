import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Loader2,
  RefreshCw,
  AlertTriangle,
  UserCog,
  TrendingUp,
  Users2,
  UserMinus,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAllUsers,
  getUserStats,
  updateUserStatus,
  deleteUser,
  createUser,
  bulkUpdateUserStatus,
  bulkDeleteUsers,
  updateUserVerification,
  getUserActivity,
  exportUsers,
  User,
  UserStats,
} from '@/config/adminApi';

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // New state variables for enhanced functionality
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showUserActivityDialog, setShowUserActivityDialog] = useState(false);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  // Create user form state
  const [createUserForm, setCreateUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'VENDOR' | 'ADMIN',
    password: '',
    location: '',
    companyName: '',
    businessType: '',
    experience: '',
    skills: [] as string[],
    preferredCategories: [] as string[],
    budgetRange: '',
  });

  // React Query hooks
  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin', 'userStats'],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: [
      'admin',
      'users',
      currentPage,
      roleFilter,
      statusFilter,
      searchTerm,
    ],
    queryFn: () =>
      getAllUsers({
        page: currentPage,
        limit: 20,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: string;
      reason?: string;
    }) => updateUserStatus(userId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'userStats'] });
      toast({
        title: 'Success',
        description: 'User status updated successfully',
      });
      setShowStatusDialog(false);
      setSelectedUser(null);
      setNewStatus('');
      setStatusReason('');
    },
    onError: (error) => {
      console.error('Failed to update user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'userStats'] });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'userStats'] });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setCreateUserForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'CUSTOMER',
        password: '',
        location: '',
        companyName: '',
        businessType: '',
        experience: '',
        skills: [],
        preferredCategories: [],
        budgetRange: '',
      });
      setShowCreateUserDialog(false);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      userIds,
      status,
      reason,
    }: {
      userIds: string[];
      status: string;
      reason?: string;
    }) => bulkUpdateUserStatus(userIds, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'userStats'] });
      toast({
        title: 'Success',
        description: `Status updated for ${selectedUsers.length} users`,
      });
      setSelectedUsers([]);
      setShowBulkActionsDialog(false);
    },
    onError: (error) => {
      console.error('Failed to bulk update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk update status',
        variant: 'destructive',
      });
    },
  });

  const bulkDeleteUsersMutation = useMutation({
    mutationFn: ({ userIds, reason }: { userIds: string[]; reason?: string }) =>
      bulkDeleteUsers(userIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'userStats'] });
      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedUsers.length} users`,
      });
      setSelectedUsers([]);
      setShowBulkActionsDialog(false);
    },
    onError: (error) => {
      console.error('Failed to bulk delete users:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk delete users',
        variant: 'destructive',
      });
    },
  });

  // Handler functions
  const handleStatusUpdate = () => {
    if (!selectedUser || !newStatus) return;
    updateStatusMutation.mutate({
      userId: selectedUser.id,
      status: newStatus,
      reason: statusReason,
    });
  };

  const handleDeleteUser = (user: User) => {
    deleteUserMutation.mutate(user.id);
  };

  const handleCreateUser = () => {
    const userData = {
      ...createUserForm,
      experience: createUserForm.experience
        ? parseInt(createUserForm.experience)
        : 0,
      skills: createUserForm.skills,
      preferredCategories: createUserForm.preferredCategories,
    };
    createUserMutation.mutate(userData);
  };

  const handleBulkUpdateStatus = () => {
    if (selectedUsers.length === 0 || !newStatus) return;
    bulkUpdateStatusMutation.mutate({
      userIds: selectedUsers,
      status: newStatus,
      reason: statusReason,
    });
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    bulkDeleteUsersMutation.mutate({
      userIds: selectedUsers,
      reason: statusReason,
    });
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked && usersData?.data?.users) {
      setSelectedUsers(usersData.data.users.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    refetchUsers();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    refetchUsers();
  };

  const handleExportUsers = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setExporting(true);

      const result = await exportUsers({
        format,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
      });

      if (format === 'csv' && result instanceof Blob) {
        // Download CSV file
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${
          new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Success',
        description: `Users exported successfully in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error('Failed to export users:', error);
      toast({
        title: 'Error',
        description: 'Failed to export users',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle filter changes
  useEffect(() => {
    if (roleFilter !== 'all' || statusFilter !== 'all') {
      handleFilterChange();
    }
  }, [roleFilter, statusFilter]);

  // Loading state
  if (statsLoading || usersLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || usersError) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading Data
          </h3>
          <p className='text-gray-600 mb-4'>
            Failed to load user data. Please try again.
          </p>
          <Button
            onClick={() => {
              refetchStats();
              refetchUsers();
            }}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Extract data safely
  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || { totalPages: 1, total: 0 };
  const stats = userStats?.data || {
    totalUsers: 0,
    activeUsers: 0,
    pendingVerification: 0,
    suspendedUsers: 0,
    userGrowth: '0%',
    activePercentage: '0%',
  };

  // Utility functions
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
      case 'DELETED':
        return <Badge className='bg-gray-100 text-gray-800'>Deleted</Badge>;
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
    });
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold mb-2'>User Management</h1>
            <p className='text-blue-100'>
              Manage all platform users, roles, and permissions
            </p>
          </div>
          <Button
            onClick={() => {
              setRefreshing(true);
              Promise.all([refetchStats(), refetchUsers()]).finally(() =>
                setRefreshing(false)
              );
            }}
            disabled={usersLoading || refreshing}
            variant='outline'
            className='bg-white/10 border-white/20 text-white hover:bg-white/20'
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                usersLoading || refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {userStats && (
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
              <div className='text-2xl font-bold'>
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className='text-xs text-green-600'>
                {stats.userGrowth} from last month
              </p>
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
              <div className='text-2xl font-bold'>
                {stats.activeUsers.toLocaleString()}
              </div>
              <p className='text-xs text-green-600'>
                {stats.activePercentage}% of total
              </p>
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
              <div className='text-2xl font-bold'>
                {stats.pendingVerification}
              </div>
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
              <div className='text-2xl font-bold'>{stats.suspendedUsers}</div>
              <p className='text-xs text-red-600'>Under review</p>
            </CardContent>
          </Card>
        </div>
      )}

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
                        Create a new user account with specified role and
                        permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium'>
                            First Name
                          </label>
                          <Input placeholder='John' />
                        </div>
                        <div>
                          <label className='text-sm font-medium'>
                            Last Name
                          </label>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                <Button
                  onClick={handleSearch}
                  className='flex items-center gap-2'
                >
                  <Search className='h-4 w-4' />
                  Search
                </Button>
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
                    {users.map((user) => (
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
                              {user.phone && (
                                <div className='text-sm text-gray-500 flex items-center gap-2'>
                                  <Phone className='h-3 w-3' />
                                  {user.phone}
                                </div>
                              )}
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
                            {user.location || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-gray-600'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(user.joinedDate || user.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedUser(user);
                                setShowStatusDialog(true);
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{' '}
                                    {user.firstName} {user.lastName}? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user)}
                                    className='bg-red-600 hover:bg-red-700'
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                  Showing {(currentPage - 1) * 20 + 1} to{' '}
                  {Math.min(currentPage * 20, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
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

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.firstName}{' '}
              {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Name
                  </label>
                  <p className='text-sm'>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Email
                  </label>
                  <p className='text-sm'>{selectedUser.email}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Role
                  </label>
                  <div className='mt-1'>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Status
                  </label>
                  <div className='mt-1'>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Joined
                  </label>
                  <p className='text-sm'>
                    {formatDate(
                      selectedUser.joinedDate || selectedUser.createdAt
                    )}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Last Active
                  </label>
                  <p className='text-sm'>
                    {selectedUser.lastActive || 'Never'}
                  </p>
                </div>
              </div>

              {selectedUser.vendorProfile && (
                <div>
                  <h4 className='font-medium mb-2'>Vendor Profile</h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>Company:</span>{' '}
                      {selectedUser.vendorProfile.companyName || 'N/A'}
                    </div>
                    <div>
                      <span className='text-gray-600'>Experience:</span>{' '}
                      {selectedUser.vendorProfile.experience || 0} years
                    </div>
                    <div>
                      <span className='text-gray-600'>Total Jobs:</span>{' '}
                      {selectedUser.vendorProfile.totalJobs}
                    </div>
                    <div>
                      <span className='text-gray-600'>Completed:</span>{' '}
                      {selectedUser.vendorProfile.completedJobs}
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.customerProfile && (
                <div>
                  <h4 className='font-medium mb-2'>Customer Profile</h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>Jobs Posted:</span>{' '}
                      {selectedUser.customerProfile.totalJobsPosted}
                    </div>
                    <div>
                      <span className='text-gray-600'>Total Spent:</span>{' '}
                      {formatCurrency(selectedUser.customerProfile.totalSpent)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedUser?.firstName}{' '}
              {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='VERIFIED'>Verified</SelectItem>
                  <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Reason (Optional)</label>
              <Input
                placeholder='Reason for status change'
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() => setShowStatusDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
