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
  Download,
  Mail,
  Phone,
} from 'lucide-react';

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Mock data for demonstration
  const vendors = [
    {
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+1-555-0124',
      companyName: 'Design Studio Pro',
      businessType: 'Design Agency',
      experience: 5,
      skills: ['UI/UX Design', 'Logo Design', 'Branding'],
      portfolio: ['portfolio1.com', 'portfolio2.com'],
      verified: false,
      documents: ['id_proof.pdf', 'business_license.pdf'],
      rating: 4.8,
      totalReviews: 23,
      completedJobs: 45,
      status: 'PENDING',
      location: 'Los Angeles, CA',
      joinedDate: '2024-01-20',
      lastActive: '1 day ago',
      emailVerified: true,
      phoneVerified: false,
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      phone: '+1-555-0125',
      companyName: 'Tech Solutions Inc',
      businessType: 'Software Development',
      experience: 8,
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      portfolio: ['techsolutions.com', 'github.com/mike'],
      verified: true,
      documents: ['id_proof.pdf', 'business_license.pdf', 'certifications.pdf'],
      rating: 4.9,
      totalReviews: 67,
      completedJobs: 89,
      status: 'VERIFIED',
      location: 'Chicago, IL',
      joinedDate: '2024-01-10',
      lastActive: '5 hours ago',
      emailVerified: true,
      phoneVerified: true,
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah@example.com',
      phone: '+1-555-0126',
      companyName: 'Content Creators',
      businessType: 'Content Agency',
      experience: 3,
      skills: ['Content Writing', 'SEO', 'Blog Writing'],
      portfolio: ['contentcreators.com', 'blog.sarah.com'],
      verified: false,
      documents: ['id_proof.pdf'],
      rating: 4.2,
      totalReviews: 12,
      completedJobs: 18,
      status: 'PENDING',
      location: 'Miami, FL',
      joinedDate: '2024-01-15',
      lastActive: '2 days ago',
      emailVerified: true,
      phoneVerified: false,
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@example.com',
      phone: '+1-555-0127',
      companyName: 'Mobile Apps Pro',
      businessType: 'Mobile Development',
      experience: 6,
      skills: ['iOS Development', 'Android Development', 'React Native'],
      portfolio: ['mobileappspro.com', 'appstore.com/david'],
      verified: true,
      documents: ['id_proof.pdf', 'business_license.pdf', 'portfolio.pdf'],
      rating: 4.7,
      totalReviews: 34,
      completedJobs: 56,
      status: 'VERIFIED',
      location: 'Austin, TX',
      joinedDate: '2024-01-08',
      lastActive: '3 hours ago',
      emailVerified: true,
      phoneVerified: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className='bg-green-100 text-green-800'>Verified</Badge>;
      case 'PENDING':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'SUSPENDED':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      case 'REJECTED':
        return <Badge className='bg-gray-100 text-gray-800'>Rejected</Badge>;
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

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || vendor.status === statusFilter;
    const matchesVerification =
      verificationFilter === 'all' ||
      vendor.verified === (verificationFilter === 'verified');
    return matchesSearch && matchesStatus && matchesVerification;
  });

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Vendor Management</h1>
        <p className='text-blue-100'>
          Manage vendor accounts, verifications, and approvals
        </p>
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
            <div className='text-2xl font-bold'>456</div>
            <p className='text-xs text-green-600'>+15% from last month</p>
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
            <div className='text-2xl font-bold'>389</div>
            <p className='text-xs text-green-600'>85.3% of total</p>
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
              Average Rating
            </CardTitle>
            <div className='p-2 rounded-lg bg-purple-50'>
              <Star className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>4.7</div>
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
                    <SelectItem value='VERIFIED'>Verified</SelectItem>
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
              </div>

              {/* Vendors Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
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
                                <div className='text-sm text-gray-500 flex items-center gap-2'>
                                  <Phone className='h-3 w-3' />
                                  {vendor.phone}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <MapPin className='h-3 w-3' />
                              {vendor.location}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <Calendar className='h-3 w-3' />
                              Joined: {vendor.joinedDate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {vendor.companyName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.businessType}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.experience} years experience
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='flex flex-wrap gap-1'>
                              {vendor.skills.slice(0, 3).map((skill, index) => (
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
                              {vendor.portfolio.length} portfolio links
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
                              {vendor.documents.length} documents uploaded
                            </div>
                            <div className='flex items-center gap-1'>
                              {vendor.verified ? (
                                <CheckCircle className='h-3 w-3 text-green-600' />
                              ) : (
                                <Clock className='h-3 w-3 text-yellow-600' />
                              )}
                              <span className='text-xs'>
                                {vendor.verified ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            {getRatingStars(vendor.rating)}
                            <div className='text-sm text-gray-500'>
                              {vendor.totalReviews} reviews
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.completedJobs} jobs completed
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <FileText className='h-4 w-4' />
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
                  Showing 1 to {filteredVendors.length} of {vendors.length}{' '}
                  results
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
    </div>
  );
};

export default VendorManagement;
