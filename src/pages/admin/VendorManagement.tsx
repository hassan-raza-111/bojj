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
  UserCheck,
  UserX,
  Shield,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Download,
  Mail,
  Phone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getVendorStats,
  getAllVendors,
  getVendorDetails,
  approveVendor,
  rejectVendor,
  toggleVendorStatus,
  bulkUpdateVendorStatus,
  bulkDeleteVendors,
  exportVendors,
  Vendor,
} from '@/config/adminApi';

const VendorManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // New state variables for enhanced functionality
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  // React Query hooks
  const {
    data: vendorStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin', 'vendorStats'],
    queryFn: getVendorStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useQuery({
    queryKey: [
      'admin',
      'vendors',
      currentPage,
      statusFilter,
      verificationFilter,
      searchTerm,
    ],
    queryFn: () =>
      getAllVendors(
        searchTerm || undefined,
        statusFilter === 'all' ? undefined : statusFilter,
        currentPage,
        20
      ),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const approveVendorMutation = useMutation({
    mutationFn: approveVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendorStats'] });
      toast({
        title: 'Success',
        description: 'Vendor approved successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to approve vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve vendor',
        variant: 'destructive',
      });
    },
  });

  const rejectVendorMutation = useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      rejectVendor(vendorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendorStats'] });
      toast({
        title: 'Success',
        description: 'Vendor rejected successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to reject vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject vendor',
        variant: 'destructive',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ vendorId, status }: { vendorId: string; status: string }) =>
      toggleVendorStatus(vendorId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendorStats'] });
      toast({
        title: 'Success',
        description: 'Vendor status updated successfully',
      });
      setShowStatusDialog(false);
      setSelectedVendor(null);
      setNewStatus('');
      setStatusReason('');
    },
    onError: (error) => {
      console.error('Failed to update vendor status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vendor status',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      vendorIds,
      status,
      reason,
    }: {
      vendorIds: string[];
      status: string;
      reason?: string;
    }) => bulkUpdateVendorStatus(vendorIds, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendorStats'] });
      toast({
        title: 'Success',
        description: `Status updated for ${selectedVendors.length} vendors`,
      });
      setSelectedVendors([]);
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

  const bulkDeleteVendorsMutation = useMutation({
    mutationFn: ({
      vendorIds,
      reason,
    }: {
      vendorIds: string[];
      reason?: string;
    }) => bulkDeleteVendors(vendorIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendorStats'] });
      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedVendors.length} vendors`,
      });
      setSelectedVendors([]);
      setShowBulkActionsDialog(false);
    },
    onError: (error) => {
      console.error('Failed to bulk delete vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk delete vendors',
        variant: 'destructive',
      });
    },
  });

  // Handler functions
  const handleApproveVendor = (vendorId: string) => {
    approveVendorMutation.mutate(vendorId);
  };

  const handleRejectVendor = (vendorId: string) => {
    rejectVendorMutation.mutate({
      vendorId,
      reason: 'Admin rejection',
    });
  };

  const handleStatusUpdate = () => {
    if (!selectedVendor || !newStatus) return;
    toggleStatusMutation.mutate({
      vendorId: selectedVendor.id,
      status: newStatus,
    });
  };

  const handleBulkUpdateStatus = () => {
    if (selectedVendors.length === 0 || !newStatus) return;
    bulkUpdateStatusMutation.mutate({
      vendorIds: selectedVendors,
      status: newStatus,
      reason: statusReason,
    });
  };

  const handleBulkDelete = () => {
    if (selectedVendors.length === 0) return;
    bulkDeleteVendorsMutation.mutate({
      vendorIds: selectedVendors,
      reason: 'Admin bulk deletion',
    });
  };

  const handleVendorSelection = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, vendorId]);
    } else {
      setSelectedVendors(selectedVendors.filter((id) => id !== vendorId));
    }
  };

  const handleSelectAllVendors = (checked: boolean) => {
    if (checked && vendorsData?.data?.vendors) {
      setSelectedVendors(vendorsData.data.vendors.map((vendor) => vendor.id));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleExportVendors = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setExporting(true);

      const result = await exportVendors({
        format,
        status: statusFilter === 'all' ? undefined : statusFilter,
        verification:
          verificationFilter === 'all' ? undefined : verificationFilter,
        search: searchTerm || undefined,
      });

      if (format === 'csv' && result instanceof Blob) {
        // Download CSV file
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendors_export_${
          new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Success',
        description: `Vendors exported successfully in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error('Failed to export vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to export vendors',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle filter changes
  useEffect(() => {
    if (statusFilter !== 'all' || verificationFilter !== 'all') {
      handleFilterChange();
    }
  }, [statusFilter, verificationFilter]);

  // Loading state
  if (statsLoading || vendorsLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading vendors...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || vendorsError) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading Data
          </h3>
          <p className='text-gray-600 mb-4'>
            Failed to load vendor data. Please try again.
          </p>
          <Button
            onClick={() => {
              refetchStats();
              refetchVendors();
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
  const vendors = vendorsData?.data?.vendors || [];
  const pagination = vendorsData?.data?.pagination || { pages: 1, total: 0 };
  const stats = vendorStats?.data || {
    totalVendors: 0,
    verifiedVendors: 0,
    pendingVendors: 0,
    suspendedVendors: 0,
    rejectedVendors: 0,
    newVendorsThisMonth: 0,
    vendorGrowth: '0%',
    verifiedPercentage: '0%',
    averageRating: 0,
    totalCompletedJobs: 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'PENDING':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'SUSPENDED':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      case 'REJECTED':
        return <Badge className='bg-gray-100 text-gray-800'>Rejected</Badge>;
      case 'DELETED':
        return <Badge className='bg-gray-100 text-gray-800'>Deleted</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className='h-4 w-4 text-green-600' />
    ) : (
      <XCircle className='h-4 w-4 text-red-600' />
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
        <span className='text-sm font-medium'>{rating}</span>
        <span className='text-xs text-gray-500'>({rating})</span>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold mb-2'>Vendor Management</h1>
            <p className='text-blue-100'>
              Manage vendor accounts, verifications, and approvals
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => {
                setRefreshing(true);
                Promise.all([refetchStats(), refetchVendors()]).finally(() =>
                  setRefreshing(false)
                );
              }}
              disabled={vendorsLoading || refreshing}
              variant='outline'
              className='bg-white/10 border-white/20 text-white hover:bg-white/20'
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  vendorsLoading || refreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => handleExportVendors('csv')}
              disabled={exporting}
              variant='outline'
              className='bg-white/10 border-white/20 text-white hover:bg-white/20'
            >
              <Download className='h-4 w-4 mr-2' />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Vendors
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Users className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalVendors}</div>
            <p className='text-xs text-green-600'>
              {stats.vendorGrowth} from last month
            </p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Verified Vendors
            </CardTitle>
            <div className='p-2 rounded-lg bg-green-50'>
              <UserCheck className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.verifiedVendors}</div>
            <p className='text-xs text-green-600'>
              {stats.verifiedPercentage} of total
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
            <div className='text-2xl font-bold'>{stats.pendingVendors}</div>
            <p className='text-xs text-yellow-600'>Requires attention</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Average Rating
            </CardTitle>
            <div className='p-2 rounded-lg bg-purple-50'>
              <Star className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.averageRating.toFixed(1)}
            </div>
            <p className='text-xs text-green-600'>+0.2 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='all-vendors' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='all-vendors'>All Vendors</TabsTrigger>
          <TabsTrigger value='pending'>Pending</TabsTrigger>
          <TabsTrigger value='verified'>Verified</TabsTrigger>
          <TabsTrigger value='suspended'>Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value='all-vendors' className='space-y-6'>
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                  <CardTitle>Vendor Management</CardTitle>
                  <CardDescription>
                    Search, filter, and manage vendor accounts
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='flex items-center gap-2'>
                      <Plus className='h-4 w-4' />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                      <DialogDescription>
                        Manually add a new vendor account
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium'>
                            First Name
                          </label>
                          <Input placeholder='Jane' />
                        </div>
                        <div>
                          <label className='text-sm font-medium'>
                            Last Name
                          </label>
                          <Input placeholder='Smith' />
                        </div>
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Email</label>
                        <Input type='email' placeholder='jane@example.com' />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>
                          Company Name
                        </label>
                        <Input placeholder='Design Studio Pro' />
                      </div>
                      <div className='flex gap-2 justify-end'>
                        <Button variant='outline'>Cancel</Button>
                        <Button>Add Vendor</Button>
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
                    placeholder='Search vendors...'
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
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                    <SelectItem value='REJECTED'>Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={verificationFilter}
                  onValueChange={setVerificationFilter}
                >
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Verification' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='verified'>Verified</SelectItem>
                    <SelectItem value='unverified'>Unverified</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowBulkActionsDialog(true)}
                  disabled={selectedVendors.length === 0}
                  variant='outline'
                  className='whitespace-nowrap'
                >
                  Bulk Actions ({selectedVendors.length})
                </Button>
              </div>

              {/* Vendors Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>
                        <input
                          type='checkbox'
                          checked={
                            selectedVendors.length === vendors.length &&
                            vendors.length > 0
                          }
                          onChange={(e) =>
                            handleSelectAllVendors(e.target.checked)
                          }
                          className='rounded border-gray-300'
                        />
                      </TableHead>
                      <TableHead>Vendor Details</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Skills & Experience</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Rating & Jobs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <input
                            type='checkbox'
                            checked={selectedVendors.includes(vendor.id)}
                            onChange={(e) =>
                              handleVendorSelection(vendor.id, e.target.checked)
                            }
                            className='rounded border-gray-300'
                          />
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center space-x-3'>
                              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold'>
                                {vendor.firstName.charAt(0)}
                              </div>
                              <div>
                                <div className='font-medium'>
                                  {vendor.firstName} {vendor.lastName}
                                </div>
                                <div className='text-sm text-gray-500 flex items-center gap-2'>
                                  <Mail className='h-3 w-3' />
                                  {vendor.email}
                                </div>
                                {vendor.phone && (
                                  <div className='text-sm text-gray-500 flex items-center gap-2'>
                                    <Phone className='h-3 w-3' />
                                    {vendor.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                            {vendor.location && (
                              <div className='flex items-center gap-2 text-xs text-gray-500'>
                                <MapPin className='h-3 w-3' />
                                {vendor.location}
                              </div>
                            )}
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <Calendar className='h-3 w-3' />
                              Joined:{' '}
                              {new Date(vendor.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {vendor.vendorProfile?.companyName || 'N/A'}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.vendorProfile?.businessType || 'N/A'}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.vendorProfile?.experience || 0} years
                              experience
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex flex-wrap gap-1'>
                              {(vendor.vendorProfile?.skills || [])
                                .slice(0, 3)
                                .map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {(vendor.vendorProfile?.portfolio || []).length}{' '}
                              portfolio links
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <div className='flex items-center gap-1'>
                                {getVerificationIcon(vendor.emailVerified)}
                                <span className='text-xs'>Email</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                {getVerificationIcon(vendor.phoneVerified)}
                                <span className='text-xs'>Phone</span>
                              </div>
                            </div>
                            <div className='text-xs text-gray-500'>
                              {(vendor.vendorProfile?.documents || []).length}{' '}
                              documents uploaded
                            </div>
                            <div className='flex items-center gap-1'>
                              {vendor.vendorProfile?.verified ? (
                                <CheckCircle className='h-3 w-3 text-green-600' />
                              ) : (
                                <Clock className='h-3 w-3 text-yellow-600' />
                              )}
                              <span className='text-xs'>
                                {vendor.vendorProfile?.verified
                                  ? 'Verified'
                                  : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            {vendor.vendorProfile?.rating ? (
                              getRatingStars(vendor.vendorProfile.rating)
                            ) : (
                              <span className='text-sm text-gray-500'>
                                No rating
                              </span>
                            )}
                            <div className='text-sm text-gray-500'>
                              {vendor.vendorProfile?.totalReviews || 0} reviews
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.vendorProfile?.completedJobs || 0} jobs
                              completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setShowVendorDetails(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setShowStatusDialog(true);
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            {vendor.status === 'PENDING' && (
                              <>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleApproveVendor(vendor.id)}
                                  disabled={approveVendorMutation.isPending}
                                >
                                  <CheckCircle className='h-4 w-4 text-green-600' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleRejectVendor(vendor.id)}
                                  disabled={rejectVendorMutation.isPending}
                                >
                                  <XCircle className='h-4 w-4 text-red-600' />
                                </Button>
                              </>
                            )}
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
                    disabled={currentPage === pagination.pages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='pending' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Pending Verification
              </CardTitle>
              <CardDescription>
                Vendors waiting for verification and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <UserCheck className='h-4 w-4' />
                  Review Applications
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Check Documents
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Pending Analytics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Pending verification interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='verified' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCheck className='h-5 w-5' />
                Verified Vendors
              </CardTitle>
              <CardDescription>
                Successfully verified and active vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  Manage Permissions
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Performance Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Success Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Verified vendors management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='suspended' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserX className='h-5 w-5' />
                Suspended Vendors
              </CardTitle>
              <CardDescription>
                Vendors with suspended accounts requiring review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Review Suspensions
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Suspension Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingDown className='h-4 w-4' />
                  Suspension Trends
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Suspended vendors management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Vendor Status</DialogTitle>
            <DialogDescription>
              Change the status of the selected vendor
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
                  <SelectItem value='ACTIVE'>Set to Active</SelectItem>
                  <SelectItem value='SUSPENDED'>Set to Suspended</SelectItem>
                  <SelectItem value='REJECTED'>Set to Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Reason (Optional)</label>
              <Input
                placeholder='Enter reason for status change'
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
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || toggleStatusMutation.isPending}
              >
                {toggleStatusMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog
        open={showBulkActionsDialog}
        onOpenChange={setShowBulkActionsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedVendors.length} selected vendors
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Action</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder='Select action' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Set to Active</SelectItem>
                  <SelectItem value='SUSPENDED'>Set to Suspended</SelectItem>
                  <SelectItem value='REJECTED'>Set to Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Reason (Optional)</label>
              <Input
                placeholder='Enter reason for action'
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() => setShowBulkActionsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpdateStatus}
                disabled={!newStatus || bulkUpdateStatusMutation.isPending}
                className='mr-2'
              >
                {bulkUpdateStatusMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={bulkDeleteVendorsMutation.isPending}
                variant='destructive'
              >
                {bulkDeleteVendorsMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete Vendors'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
