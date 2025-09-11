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
  Loader2,
  RefreshCw,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getJobStats,
  getAllJobs,
  getJobDetails,
  updateJobStatus,
  deleteJob,
  bulkUpdateJobStatus,
  bulkDeleteJobs,
  exportJobs,
  Job,
  JobStats,
} from '@/config/adminApi';

const JobManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // New state variables for enhanced functionality
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  // React Query hooks
  const {
    data: jobStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin', 'jobStats'],
    queryFn: getJobStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: [
      'admin',
      'jobs',
      currentPage,
      statusFilter,
      categoryFilter,
      searchTerm,
    ],
    queryFn: () =>
      getAllJobs({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({
      jobId,
      status,
      reason,
    }: {
      jobId: string;
      status: string;
      reason?: string;
    }) => updateJobStatus(jobId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobStats'] });
      toast({
        title: 'Success',
        description: 'Job status updated successfully',
      });
      setShowStatusDialog(false);
      setSelectedJob(null);
      setNewStatus('');
      setStatusReason('');
    },
    onError: (error) => {
      console.error('Failed to update job status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      deleteJob(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobStats'] });
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to delete job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({
      jobIds,
      status,
      reason,
    }: {
      jobIds: string[];
      status: string;
      reason?: string;
    }) => bulkUpdateJobStatus(jobIds, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobStats'] });
      toast({
        title: 'Success',
        description: `Status updated for ${selectedJobs.length} jobs`,
      });
      setSelectedJobs([]);
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

  const bulkDeleteJobsMutation = useMutation({
    mutationFn: ({ jobIds, reason }: { jobIds: string[]; reason?: string }) =>
      bulkDeleteJobs(jobIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobStats'] });
      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedJobs.length} jobs`,
      });
      setSelectedJobs([]);
      setShowBulkActionsDialog(false);
    },
    onError: (error) => {
      console.error('Failed to bulk delete jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk delete jobs',
        variant: 'destructive',
      });
    },
  });

  // Handler functions
  const handleStatusUpdate = () => {
    if (!selectedJob || !newStatus) return;
    updateStatusMutation.mutate({
      jobId: selectedJob.id,
      status: newStatus,
      reason: statusReason,
    });
  };

  const handleDeleteJob = (job: Job) => {
    deleteJobMutation.mutate({
      jobId: job.id,
      reason: 'Admin deletion',
    });
  };

  const handleBulkUpdateStatus = () => {
    if (selectedJobs.length === 0 || !newStatus) return;
    bulkUpdateStatusMutation.mutate({
      jobIds: selectedJobs,
      status: newStatus,
      reason: statusReason,
    });
  };

  const handleBulkDelete = () => {
    if (selectedJobs.length === 0) return;
    bulkDeleteJobsMutation.mutate({
      jobIds: selectedJobs,
      reason: 'Admin bulk deletion',
    });
  };

  const handleJobSelection = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    }
  };

  const handleSelectAllJobs = (checked: boolean) => {
    if (checked && jobsData?.data?.jobs) {
      setSelectedJobs(jobsData.data.jobs.map((job) => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleExportJobs = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setExporting(true);

      const result = await exportJobs({
        format,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchTerm || undefined,
      });

      if (format === 'csv' && result instanceof Blob) {
        // Download CSV file
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jobs_export_${
          new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Success',
        description: `Jobs exported successfully in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      console.error('Failed to export jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to export jobs',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle filter changes
  useEffect(() => {
    if (statusFilter !== 'all' || categoryFilter !== 'all') {
      handleFilterChange();
    }
  }, [statusFilter, categoryFilter]);

  // Loading state
  if (statsLoading || jobsLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading jobs...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || jobsError) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading Data
          </h3>
          <p className='text-gray-600 mb-4'>
            Failed to load job data. Please try again.
          </p>
          <Button
            onClick={() => {
              refetchStats();
              refetchJobs();
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
  const jobs = jobsData?.data?.jobs || [];
  const pagination = jobsData?.data?.pagination || { totalPages: 1, total: 0 };
  const stats = jobStats?.data || {
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    disputedJobs: 0,
    totalValue: 0,
    averageBudget: 0,
    jobGrowth: '0%',
    categoryDistribution: [],
    monthlyTrends: [],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className='bg-green-100 text-green-800'>Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge className='bg-blue-100 text-blue-800'>In Progress</Badge>;
      case 'COMPLETED':
        return (
          <Badge className='bg-purple-100 text-purple-800'>Completed</Badge>
        );
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

  return (
    <div className='space-y-6'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold mb-2'>Job Management</h1>
            <p className='text-blue-100'>
              Monitor and manage all platform jobs and activities
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => {
                setRefreshing(true);
                Promise.all([refetchStats(), refetchJobs()]).finally(() =>
                  setRefreshing(false)
                );
              }}
              disabled={jobsLoading || refreshing}
              variant='outline'
              className='bg-white/10 border-white/20 text-white hover:bg-white/20'
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  jobsLoading || refreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => handleExportJobs('csv')}
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
              Total Jobs
            </CardTitle>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Briefcase className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalJobs}</div>
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
            <div className='text-2xl font-bold'>{stats.activeJobs}</div>
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
            <div className='text-2xl font-bold'>
              ${stats.totalValue.toLocaleString()}
            </div>
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
            <div className='text-2xl font-bold'>{stats.disputedJobs}</div>
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
                        <label className='text-sm font-medium'>
                          Description
                        </label>
                        <Input placeholder='Enter job description' />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium'>
                            Category
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select category' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='web'>
                                Web Development
                              </SelectItem>
                              <SelectItem value='mobile'>
                                Mobile Development
                              </SelectItem>
                              <SelectItem value='design'>Design</SelectItem>
                              <SelectItem value='content'>
                                Content Writing
                              </SelectItem>
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
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className='w-full sm:w-40'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    <SelectItem value='Web Development'>
                      Web Development
                    </SelectItem>
                    <SelectItem value='Design'>Design</SelectItem>
                    <SelectItem value='Mobile Development'>
                      Mobile Development
                    </SelectItem>
                    <SelectItem value='Content Writing'>
                      Content Writing
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowBulkActionsDialog(true)}
                  disabled={selectedJobs.length === 0}
                  variant='outline'
                  className='whitespace-nowrap'
                >
                  Bulk Actions ({selectedJobs.length})
                </Button>
              </div>

              {/* Jobs Table */}
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>
                        <input
                          type='checkbox'
                          checked={
                            selectedJobs.length === jobs.length &&
                            jobs.length > 0
                          }
                          onChange={(e) =>
                            handleSelectAllJobs(e.target.checked)
                          }
                          className='rounded border-gray-300'
                        />
                      </TableHead>
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
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <input
                            type='checkbox'
                            checked={selectedJobs.includes(job.id)}
                            onChange={(e) =>
                              handleJobSelection(job.id, e.target.checked)
                            }
                            className='rounded border-gray-300'
                          />
                        </TableCell>
                        <TableCell>
                          <div className='space-y-2'>
                            <div className='font-medium'>{job.title}</div>
                            <div className='text-sm text-gray-500 line-clamp-2'>
                              {job.description}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <MapPin className='h-3 w-3' />
                              {job.isRemote
                                ? 'Remote'
                                : job.location || 'Not specified'}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <Calendar className='h-3 w-3' />
                              Due:{' '}
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString()
                                : 'Not set'}
                            </div>
                            <div className='flex flex-wrap gap-1'>
                              {(job.tags || [])
                                .slice(0, 3)
                                .map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant='outline'
                                    className='text-xs'
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {job.customer?.firstName} {job.customer?.lastName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {job.customer?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getCategoryIcon(job.category)}
                            <div>
                              <div className='font-medium'>{job.category}</div>
                              <div className='text-sm text-gray-500'>
                                {job.subcategory || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              ${job.budget?.toLocaleString() || 'Not specified'}
                            </div>
                            {getBudgetTypeBadge(job.budgetType)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          <div className='space-y-2 text-sm'>
                            <div className='flex items-center gap-1'>
                              <Users className='h-3 w-3' />
                              {job.bids?.length || 0} bids
                            </div>
                            <div className='flex items-center gap-1'>
                              <Eye className='h-3 w-3' />
                              {job.viewCount || 0} views
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedJob(job);
                                setShowJobDetails(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedJob(job);
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
                                    Delete Job
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this job?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteJob(job)}
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

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-semibold mb-2'>Basic Information</h3>
                  <div className='space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>Title:</span>{' '}
                      {selectedJob.title}
                    </p>
                    <p>
                      <span className='font-medium'>Category:</span>{' '}
                      {selectedJob.category}
                    </p>
                    <p>
                      <span className='font-medium'>Status:</span>{' '}
                      {selectedJob.status}
                    </p>
                    <p>
                      <span className='font-medium'>Priority:</span>{' '}
                      {selectedJob.priority}
                    </p>
                    <p>
                      <span className='font-medium'>Budget:</span> $
                      {selectedJob.budget?.toLocaleString() || 'Not specified'}
                    </p>
                    <p>
                      <span className='font-medium'>Budget Type:</span>{' '}
                      {selectedJob.budgetType}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-2'>Location & Timing</h3>
                  <div className='space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>Location:</span>{' '}
                      {selectedJob.location || 'Not specified'}
                    </p>
                    <p>
                      <span className='font-medium'>Remote:</span>{' '}
                      {selectedJob.isRemote ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <span className='font-medium'>Deadline:</span>{' '}
                      {selectedJob.deadline
                        ? new Date(selectedJob.deadline).toLocaleDateString()
                        : 'Not set'}
                    </p>
                    <p>
                      <span className='font-medium'>Created:</span>{' '}
                      {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Description</h3>
                <p className='text-sm text-gray-600'>
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements &&
                selectedJob.requirements.length > 0 && (
                  <div>
                    <h3 className='font-semibold mb-2'>Requirements</h3>
                    <ul className='list-disc list-inside text-sm text-gray-600'>
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedJob.tags && selectedJob.tags.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-2'>Tags</h3>
                  <div className='flex flex-wrap gap-2'>
                    {selectedJob.tags.map((tag, index) => (
                      <Badge key={index} variant='outline'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='font-semibold mb-2'>Customer Information</h3>
                  <div className='space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>Name:</span>{' '}
                      {selectedJob.customer?.firstName}{' '}
                      {selectedJob.customer?.lastName}
                    </p>
                    <p>
                      <span className='font-medium'>Email:</span>{' '}
                      {selectedJob.customer?.email}
                    </p>
                    <p>
                      <span className='font-medium'>Phone:</span>{' '}
                      {selectedJob.customer?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold mb-2'>Assigned Vendor</h3>
                  <div className='space-y-2 text-sm'>
                    {selectedJob.assignedVendor ? (
                      <>
                        <p>
                          <span className='font-medium'>Name:</span>{' '}
                          {selectedJob.assignedVendor.firstName}{' '}
                          {selectedJob.assignedVendor.lastName}
                        </p>
                        <p>
                          <span className='font-medium'>Email:</span>{' '}
                          {selectedJob.assignedVendor.email}
                        </p>
                        <p>
                          <span className='font-medium'>Company:</span>{' '}
                          {selectedJob.assignedVendor.companyName ||
                            'Not specified'}
                        </p>
                      </>
                    ) : (
                      <p className='text-gray-500'>No vendor assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedJob.bids && selectedJob.bids.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-2'>
                    Bids ({selectedJob.bids.length})
                  </h3>
                  <div className='space-y-3'>
                    {selectedJob.bids.map((bid) => (
                      <div key={bid.id} className='border rounded-lg p-3'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <p className='font-medium'>
                              {bid.vendor.firstName} {bid.vendor.lastName}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {bid.vendor.email}
                            </p>
                          </div>
                          <Badge
                            variant={
                              bid.status === 'ACCEPTED' ? 'default' : 'outline'
                            }
                          >
                            {bid.status}
                          </Badge>
                        </div>
                        <p className='text-sm mb-2'>{bid.description}</p>
                        <div className='flex justify-between text-sm text-gray-600'>
                          <span>Amount: ${bid.amount.toLocaleString()}</span>
                          <span>Timeline: {bid.timeline}</span>
                        </div>
                      </div>
                    ))}
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
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Change the status of the selected job
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
                  <SelectItem value='OPEN'>Open</SelectItem>
                  <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                  <SelectItem value='COMPLETED'>Completed</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  <SelectItem value='DISPUTED'>Disputed</SelectItem>
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
                disabled={!newStatus || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
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
              Perform actions on {selectedJobs.length} selected jobs
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
                  <SelectItem value='OPEN'>Set to Open</SelectItem>
                  <SelectItem value='IN_PROGRESS'>
                    Set to In Progress
                  </SelectItem>
                  <SelectItem value='COMPLETED'>Set to Completed</SelectItem>
                  <SelectItem value='CANCELLED'>Set to Cancelled</SelectItem>
                  <SelectItem value='DISPUTED'>Set to Disputed</SelectItem>
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
                disabled={bulkDeleteJobsMutation.isPending}
                variant='destructive'
              >
                {bulkDeleteJobsMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete Jobs'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobManagement;
