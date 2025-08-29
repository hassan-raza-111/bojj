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
  Briefcase,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
} from 'lucide-react';

const JobManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for demonstration
  const jobs = [
    {
      id: '1',
      title: 'Website Development for E-commerce',
      description: 'Need a professional website for online store',
      customer: 'John Doe',
      customerEmail: 'john@example.com',
      category: 'Web Development',
      subcategory: 'E-commerce',
      budget: 5000,
      budgetType: 'FIXED',
      location: 'New York, NY',
      isRemote: false,
      deadline: '2024-03-15',
      status: 'OPEN',
      bids: 12,
      views: 45,
      createdAt: '2024-01-20',
      tags: ['React', 'Node.js', 'MongoDB'],
    },
    {
      id: '2',
      title: 'Logo Design for Startup',
      description: 'Modern logo design for tech startup',
      customer: 'Jane Smith',
      customerEmail: 'jane@example.com',
      category: 'Design',
      subcategory: 'Logo Design',
      budget: 800,
      budgetType: 'FIXED',
      location: 'Los Angeles, CA',
      isRemote: true,
      deadline: '2024-02-28',
      status: 'IN_PROGRESS',
      bids: 8,
      views: 32,
      createdAt: '2024-01-18',
      tags: ['Logo', 'Branding', 'Modern'],
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'iOS and Android app for food delivery',
      customer: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      category: 'Mobile Development',
      subcategory: 'iOS/Android',
      budget: 15000,
      budgetType: 'HOURLY',
      location: 'Chicago, IL',
      isRemote: true,
      deadline: '2024-04-30',
      status: 'COMPLETED',
      bids: 25,
      views: 78,
      createdAt: '2024-01-15',
      tags: ['React Native', 'Firebase', 'API'],
    },
    {
      id: '4',
      title: 'Content Writing for Blog',
      description: 'SEO-optimized blog content',
      customer: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      category: 'Content Writing',
      subcategory: 'Blog Writing',
      budget: 300,
      budgetType: 'FIXED',
      location: 'Miami, FL',
      isRemote: true,
      deadline: '2024-02-15',
      status: 'DISPUTED',
      bids: 5,
      views: 18,
      createdAt: '2024-01-22',
      tags: ['SEO', 'Blog', 'Content'],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className='bg-green-100 text-green-800'>Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge className='bg-blue-100 text-blue-800'>In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className='bg-purple-100 text-purple-800'>Completed</Badge>;
      case 'DISPUTED':
        return <Badge className='bg-red-100 text-red-800'>Disputed</Badge>;
      case 'CANCELLED':
        return <Badge className='bg-gray-100 text-gray-800'>Cancelled</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getBudgetTypeBadge = (type: string) => {
    switch (type) {
      case 'FIXED':
        return <Badge className='bg-blue-100 text-blue-800'>Fixed</Badge>;
      case 'HOURLY':
        return <Badge className='bg-green-100 text-green-800'>Hourly</Badge>;
      default:
        return <Badge variant='outline'>{type}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web Development':
        return <Briefcase className='h-4 w-4 text-blue-600' />;
      case 'Design':
        return <Eye className='h-4 w-4 text-purple-600' />;
      case 'Mobile Development':
        return <Activity className='h-4 w-4 text-green-600' />;
      case 'Content Writing':
        return <Edit className='h-4 w-4 text-orange-600' />;
      default:
        return <Briefcase className='h-4 w-4 text-gray-600' />;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>Job Management</h1>
        <p className='text-blue-100'>
          Monitor and manage all platform jobs and activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Jobs
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Briefcase className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,089</div>
            <p className='text-xs text-green-600'>+8% from last month</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Active Jobs
            </CardTitle>
            <div className='p-2 rounded-lg bg-green-50'>
              <Activity className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>89</div>
            <p className='text-xs text-green-600'>Currently open</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Value
            </CardTitle>
            <div className='p-2 rounded-lg bg-purple-50'>
              <DollarSign className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$2.4M</div>
            <p className='text-xs text-green-600'>+15% from last month</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Disputes
            </CardTitle>
            <div className='p-2 rounded-lg bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>3</div>
            <p className='text-xs text-red-600'>Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='all-jobs' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='all-jobs'>All Jobs</TabsTrigger>
          <TabsTrigger value='open'>Open</TabsTrigger>
          <TabsTrigger value='in-progress'>In Progress</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
          <TabsTrigger value='disputed'>Disputed</TabsTrigger>
        </TabsList>

        <TabsContent value='all-jobs' className='space-y-6'>
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div>
                  <CardTitle>Job Management</CardTitle>
                  <CardDescription>
                    Search, filter, and manage platform jobs
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className='flex items-center gap-2'>
                      <Plus className='h-4 w-4' />
                      Create Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Job</DialogTitle>
                      <DialogDescription>
                        Create a new job posting for testing purposes
                      </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <label className='text-sm font-medium'>Job Title</label>
                        <Input placeholder='Enter job title' />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Description</label>
                        <Input placeholder='Enter job description' />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium'>Category</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select category' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='web'>Web Development</SelectItem>
                              <SelectItem value='mobile'>Mobile Development</SelectItem>
                              <SelectItem value='design'>Design</SelectItem>
                              <SelectItem value='content'>Content Writing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className='text-sm font-medium'>Budget</label>
                          <Input placeholder='Enter budget' />
                        </div>
                      </div>
                      <div className='flex gap-2 justify-end'>
                        <Button variant='outline'>Cancel</Button>
                        <Button>Create Job</Button>
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
                    placeholder='Search jobs...'
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
                    <SelectItem value='OPEN'>Open</SelectItem>
                    <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='DISPUTED'>Disputed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    <SelectItem value='Web Development'>Web Development</SelectItem>
                    <SelectItem value='Design'>Design</SelectItem>
                    <SelectItem value='Mobile Development'>Mobile Development</SelectItem>
                    <SelectItem value='Content Writing'>Content Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jobs Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Metrics</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='font-medium'>{job.title}</div>
                            <div className='text-sm text-gray-500 line-clamp-2'>
                              {job.description}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <MapPin className='h-3 w-3' />
                              {job.isRemote ? 'Remote' : job.location}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <Calendar className='h-3 w-3' />
                              Due: {job.deadline}
                            </div>
                            <div className='flex flex-wrap gap-1'>
                              {job.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant='outline' className='text-xs'>
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>{job.customer}</div>
                            <div className='text-sm text-gray-500'>{job.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getCategoryIcon(job.category)}
                            <div>
                              <div className='font-medium'>{job.category}</div>
                              <div className='text-sm text-gray-500'>{job.subcategory}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              ${job.budget.toLocaleString()}
                            </div>
                            {getBudgetTypeBadge(job.budgetType)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          <div className='space-y-2 text-sm'>
                            <div className='flex items-center gap-1'>
                              <Users className='h-3 w-3' />
                              {job.bids} bids
                            </div>
                            <div className='flex items-center gap-1'>
                              <Eye className='h-3 w-3' />
                              {job.views} views
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {job.createdAt}
                            </div>
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
                  Showing 1 to {filteredJobs.length} of {jobs.length} results
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

        <TabsContent value='open' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Briefcase className='h-5 w-5' />
                Open Jobs
              </CardTitle>
              <CardDescription>
                Jobs that are currently open for bidding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Activity className='h-4 w-4' />
                  Monitor Open Jobs
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Open Jobs Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Growth Trends
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Open jobs management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='in-progress' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Jobs In Progress
              </CardTitle>
              <CardDescription>
                Jobs that are currently being worked on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Track Progress
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Progress Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Performance Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                In-progress jobs management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='completed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5' />
                Completed Jobs
              </CardTitle>
              <CardDescription>
                Successfully completed jobs and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  Review Completed
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Completion Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Success Metrics
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Completed jobs management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='disputed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertCircle className='h-5 w-5' />
                Disputed Jobs
              </CardTitle>
              <CardDescription>
                Jobs with disputes that require admin intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Button className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4' />
                  Resolve Disputes
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Dispute Analytics
                </Button>
                <Button variant='outline' className='flex items-center gap-2'>
                  <TrendingDown className='h-4 w-4' />
                  Dispute Trends
                </Button>
              </div>
              <p className='text-gray-500 text-center py-8'>
                Disputed jobs management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobManagement;
