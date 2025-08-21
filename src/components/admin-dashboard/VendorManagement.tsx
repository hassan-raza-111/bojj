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
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  rating?: number;
  totalJobs?: number;
  completedJobs?: number;
  location?: string;
  skills?: string[];
  bio?: string;
  createdAt: string;
  actionLoading?: boolean;
}

const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const { toast } = useToast();

  // Mock data for fallback
  const mockVendors: Vendor[] = [
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Khan',
      email: 'ahmed.khan@example.com',
      phone: '+92-300-1234567',
      status: 'pending',
      verificationStatus: 'pending',
      rating: 4.8,
      totalJobs: 25,
      completedJobs: 23,
      location: 'Karachi, Pakistan',
      skills: ['Web Development', 'React', 'Node.js'],
      bio: 'Experienced full-stack developer with 5+ years of experience',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      firstName: 'Fatima',
      lastName: 'Ali',
      email: 'fatima.ali@example.com',
      phone: '+92-301-2345678',
      status: 'approved',
      verificationStatus: 'verified',
      rating: 4.9,
      totalJobs: 42,
      completedJobs: 40,
      location: 'Lahore, Pakistan',
      skills: ['Graphic Design', 'UI/UX', 'Illustration'],
      bio: 'Creative designer passionate about user experience',
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      firstName: 'Muhammad',
      lastName: 'Hassan',
      email: 'm.hassan@example.com',
      phone: '+92-302-3456789',
      status: 'approved',
      verificationStatus: 'verified',
      rating: 4.7,
      totalJobs: 18,
      completedJobs: 17,
      location: 'Islamabad, Pakistan',
      skills: ['Mobile Development', 'Flutter', 'Firebase'],
      bio: 'Mobile app developer specializing in cross-platform solutions',
      createdAt: '2024-01-20',
    },
  ];

  // Filtered vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.firstName
        .toLowerCase()
        .includes(vendorSearchQuery.toLowerCase()) ||
      vendor.lastName.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(vendorSearchQuery.toLowerCase());
    const matchesStatus =
      vendorStatusFilter === 'all' || vendor.status === vendorStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch vendors from API
  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/vendors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVendors(
            data.data.map((vendor: Vendor) => ({
              ...vendor,
              actionLoading: false,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Use mock data as fallback
      setVendors(
        mockVendors.map((vendor) => ({ ...vendor, actionLoading: false }))
      );
    } finally {
      setVendorsLoading(false);
    }
  };

  // Handle vendor approval
  const handleApproveVendor = async (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, actionLoading: true } : v))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${vendorId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: '✅ Vendor Approved',
          description: 'Vendor has been successfully approved',
        });
        fetchVendors();
      } else {
        throw new Error('Failed to approve vendor');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to approve vendor',
        variant: 'destructive',
      });
    }
  };

  // Handle vendor rejection
  const handleRejectVendor = async (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, actionLoading: true } : v))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${vendorId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: '❌ Vendor Rejected',
          description: 'Vendor has been rejected',
        });
        fetchVendors();
      } else {
        throw new Error('Failed to reject vendor');
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to reject vendor',
        variant: 'destructive',
      });
    }
  };

  // Handle vendor status toggle
  const handleToggleVendorStatus = async (
    vendorId: string,
    newStatus: 'approved' | 'suspended'
  ) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, actionLoading: true } : v))
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${vendorId}/status`,
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
          title: `✅ Vendor ${
            newStatus === 'approved' ? 'Activated' : 'Suspended'
          }`,
          description: `Vendor status updated to ${newStatus}`,
        });
        fetchVendors();
      } else {
        throw new Error(`Failed to update vendor status to ${newStatus}`);
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update vendor status',
        variant: 'destructive',
      });
    }
  };

  // Handle view vendor details
  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowVendorDetails(true);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'suspended':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Get verification status badge variant
  const getVerificationBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'unverified':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Load vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Vendor Management
          </h3>
          <p className='text-sm text-gray-600'>
            Manage vendor accounts, approvals, and verifications
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
                placeholder='Search vendors by name, email, or skills...'
                value={vendorSearchQuery}
                onChange={(e) => setVendorSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={vendorStatusFilter}
              onValueChange={setVendorStatusFilter}
            >
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='approved'>Approved</SelectItem>
                <SelectItem value='rejected'>Rejected</SelectItem>
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

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Vendors ({filteredVendors.length})</span>
            <Button variant='outline' size='sm' onClick={fetchVendors}>
              <RotateCcw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendorsLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
              <span className='ml-2 text-gray-600'>Loading vendors...</span>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?name=${vendor.firstName}+${vendor.lastName}&background=0ea5e9&color=fff`}
                            />
                            <AvatarFallback className='bg-blue-100 text-blue-600'>
                              {vendor.firstName[0]}
                              {vendor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {vendor.firstName} {vendor.lastName}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {vendor.email}
                            </p>
                            {vendor.phone && (
                              <p className='text-xs text-gray-400 flex items-center'>
                                <Phone className='h-3 w-3 mr-1' />
                                {vendor.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(vendor.status)}>
                          {vendor.status.charAt(0).toUpperCase() +
                            vendor.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getVerificationBadgeVariant(
                            vendor.verificationStatus
                          )}
                        >
                          {vendor.verificationStatus === 'verified' && (
                            <Shield className='h-3 w-3 mr-1' />
                          )}
                          {vendor.verificationStatus.charAt(0).toUpperCase() +
                            vendor.verificationStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center'>
                          <Star className='h-4 w-4 text-yellow-400 mr-1' />
                          <span className='font-medium'>{vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>
                            {vendor.completedJobs}/{vendor.totalJobs}
                          </p>
                          <p className='text-gray-500'>Completed</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center text-sm text-gray-600'>
                          <MapPin className='h-4 w-4 mr-1' />
                          {vendor.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>

                          {vendor.status === 'pending' && (
                            <>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleApproveVendor(vendor.id)}
                                disabled={vendor.actionLoading}
                                className='text-green-600 hover:text-green-700 hover:bg-green-50'
                              >
                                {vendor.actionLoading ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <Check className='h-4 w-4' />
                                )}
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRejectVendor(vendor.id)}
                                disabled={vendor.actionLoading}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                {vendor.actionLoading ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <X className='h-4 w-4' />
                                )}
                              </Button>
                            </>
                          )}

                          {vendor.status === 'approved' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleVendorStatus(vendor.id, 'suspended')
                              }
                              disabled={vendor.actionLoading}
                              className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                            >
                              {vendor.actionLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <UserX className='h-4 w-4' />
                              )}
                            </Button>
                          )}

                          {vendor.status === 'suspended' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleToggleVendorStatus(vendor.id, 'approved')
                              }
                              disabled={vendor.actionLoading}
                              className='text-green-600 hover:text-green-700 hover:bg-green-50'
                            >
                              {vendor.actionLoading ? (
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

          {!vendorsLoading && filteredVendors.length === 0 && (
            <div className='text-center py-8'>
              <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>
                No vendors found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedVendor?.firstName}{' '}
              {selectedVendor?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='flex items-center space-x-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${selectedVendor.firstName}+${selectedVendor.lastName}&background=0ea5e9&color=fff`}
                  />
                  <AvatarFallback className='bg-blue-100 text-blue-600 text-xl'>
                    {selectedVendor.firstName[0]}
                    {selectedVendor.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-xl font-semibold'>
                    {selectedVendor.firstName} {selectedVendor.lastName}
                  </h3>
                  <p className='text-gray-600'>{selectedVendor.email}</p>
                  <div className='flex items-center space-x-4 mt-2'>
                    <Badge
                      variant={getStatusBadgeVariant(selectedVendor.status)}
                    >
                      {selectedVendor.status.charAt(0).toUpperCase() +
                        selectedVendor.status.slice(1)}
                    </Badge>
                    <Badge
                      variant={getVerificationBadgeVariant(
                        selectedVendor.verificationStatus
                      )}
                    >
                      {selectedVendor.verificationStatus
                        .charAt(0)
                        .toUpperCase() +
                        selectedVendor.verificationStatus.slice(1)}
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
                  {selectedVendor.phone && (
                    <p className='text-sm text-gray-600 flex items-center'>
                      <Phone className='h-4 w-4 mr-2' />
                      {selectedVendor.phone}
                    </p>
                  )}
                  <p className='text-sm text-gray-600 flex items-center'>
                    <Mail className='h-4 w-4 mr-2' />
                    {selectedVendor.email}
                  </p>
                  {selectedVendor.location && (
                    <p className='text-sm text-gray-600 flex items-center'>
                      <MapPin className='h-4 w-4 mr-2' />
                      {selectedVendor.location}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <h4 className='font-medium text-gray-900'>Performance</h4>
                  <p className='text-sm text-gray-600 flex items-center'>
                    <Star className='h-4 w-4 mr-2 text-yellow-400' />
                    Rating: {selectedVendor.rating}/5.0
                  </p>
                  <p className='text-sm text-gray-600'>
                    Jobs: {selectedVendor.completedJobs}/
                    {selectedVendor.totalJobs} completed
                  </p>
                  <p className='text-sm text-gray-600 flex items-center'>
                    <Calendar className='h-4 w-4 mr-2' />
                    Joined:{' '}
                    {new Date(selectedVendor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {selectedVendor.skills && selectedVendor.skills.length > 0 && (
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Skills</h4>
                  <div className='flex flex-wrap gap-2'>
                    {selectedVendor.skills.map((skill, index) => (
                      <Badge key={index} variant='secondary'>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedVendor.bio && (
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Bio</h4>
                  <p className='text-sm text-gray-600'>{selectedVendor.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2 pt-4 border-t'>
                {selectedVendor.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproveVendor(selectedVendor.id);
                        setShowVendorDetails(false);
                      }}
                      className='bg-green-600 hover:bg-green-700'
                    >
                      <Check className='h-4 w-4 mr-2' />
                      Approve
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        handleRejectVendor(selectedVendor.id);
                        setShowVendorDetails(false);
                      }}
                      className='border-red-200 text-red-600 hover:bg-red-50'
                    >
                      <X className='h-4 w-4 mr-2' />
                      Reject
                    </Button>
                  </>
                )}

                {selectedVendor.status === 'approved' && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      handleToggleVendorStatus(selectedVendor.id, 'suspended');
                      setShowVendorDetails(false);
                    }}
                    className='border-yellow-200 text-yellow-600 hover:bg-yellow-50'
                  >
                    <UserX className='h-4 w-4 mr-2' />
                    Suspend
                  </Button>
                )}

                {selectedVendor.status === 'suspended' && (
                  <Button
                    onClick={() => {
                      handleToggleVendorStatus(selectedVendor.id, 'approved');
                      setShowVendorDetails(false);
                    }}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <UserCheck className='h-4 w-4 mr-2' />
                    Activate
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

export default VendorManagement;
