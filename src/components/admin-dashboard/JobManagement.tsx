import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  Filter,
  Eye,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import { getAllJobs, updateJobStatus, Job } from '@/config/adminApi';
import { useToast } from '@/components/ui/use-toast';

const EmptyState = ({ message }: { message: string }) => (
  <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
    <span className='text-4xl mb-2'>😕</span>
    <span className='text-lg'>{message}</span>
  </div>
);

const LoadingState = () => (
  <div className='flex items-center justify-center py-12'>
    <Loader2 className='animate-spin w-8 h-8 text-primary' />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let variant: any = 'secondary';
  let label = status;
  if (status === 'COMPLETED' || status === 'IN_PROGRESS') {
    variant = 'default';
  } else if (status === 'CANCELLED' || status === 'DISPUTED') {
    variant = 'destructive';
  } else if (status === 'OPEN') {
    variant = 'secondary';
  }
  return <Badge variant={variant}>{label}</Badge>;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  let variant: any = 'secondary';
  if (priority === 'HIGH' || priority === 'URGENT') {
    variant = 'destructive';
  } else if (priority === 'MEDIUM') {
    variant = 'default';
  } else {
    variant = 'outline';
  }
  return <Badge variant={variant}>{priority}</Badge>;
};

const JobDetailsModal = ({
  job,
  isOpen,
  onClose,
}: {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
          <DialogDescription>View detailed job information</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Job Information */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Status
              </label>
              <StatusBadge status={job.status} />
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Priority
              </label>
              <PriorityBadge priority={job.priority} />
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Budget
              </label>
              <p className='text-sm font-medium'>
                ${job.budget?.toLocaleString() || 'Not specified'}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Budget Type
              </label>
              <p className='text-sm'>{job.budgetType}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Category
              </label>
              <p className='text-sm'>{job.category}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Subcategory
              </label>
              <p className='text-sm'>{job.subcategory || 'Not specified'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Description
            </label>
            <p className='text-sm mt-1 bg-muted/50 p-3 rounded-lg'>
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Requirements
              </label>
              <div className='flex flex-wrap gap-2 mt-1'>
                {job.requirements.map((req, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location & Timing */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Location
              </label>
              <p className='text-sm flex items-center gap-1'>
                <MapPin className='w-4 h-4' />
                {job.location || 'Remote'}
                {job.isRemote && (
                  <Badge variant='outline' className='text-xs'>
                    Remote
                  </Badge>
                )}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Deadline
              </label>
              <p className='text-sm flex items-center gap-1'>
                <Calendar className='w-4 h-4' />
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString()
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className='font-medium mb-2'>Customer</h4>
            <div className='bg-muted/50 p-3 rounded-lg'>
              <p className='text-sm font-medium'>
                {job.customer.firstName} {job.customer.lastName}
              </p>
              <p className='text-sm text-muted-foreground'>
                {job.customer.email}
              </p>
            </div>
          </div>

          {/* Assigned Vendor */}
          {job.assignedVendor && (
            <div>
              <h4 className='font-medium mb-2'>Assigned Vendor</h4>
              <div className='bg-muted/50 p-3 rounded-lg'>
                <p className='text-sm font-medium'>
                  {job.assignedVendor.firstName} {job.assignedVendor.lastName}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {job.assignedVendor.email}
                </p>
              </div>
            </div>
          )}

          {/* Bids */}
          <div>
            <h4 className='font-medium mb-2'>Bids</h4>
            <div className='bg-muted/50 p-3 rounded-lg'>
              <p className='text-sm'>{job.bids.length} bids received</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Created
              </label>
              <p className='text-sm'>
                {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Last Updated
              </label>
              <p className='text-sm'>
                {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const JobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, categoryFilter, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs(statusFilter, categoryFilter, page, 10);
      setJobs(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId: string) => {
    if (!newStatus) {
      toast({
        title: 'Error',
        description: 'Please select a new status',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(jobId);
      await updateJobStatus(jobId, newStatus);

      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );

      toast({
        title: 'Success',
        description: 'Job status updated successfully',
      });

      setStatusModalOpen(false);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusCounts = () => {
    const counts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      DISPUTED: 0,
    };
    jobs.forEach((job) => {
      counts[job.status as keyof typeof counts] =
        (counts[job.status as keyof typeof counts] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return <LoadingState />;
  }

  const statusCounts = getStatusCounts();

  return (
    <>
      <div className='space-y-6'>
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{jobs.length}</div>
              <p className='text-xs text-muted-foreground'>All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Open Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {statusCounts.OPEN}
              </div>
              <p className='text-xs text-muted-foreground'>Awaiting bids</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {statusCounts.IN_PROGRESS}
              </div>
              <p className='text-xs text-muted-foreground'>Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {statusCounts.COMPLETED}
              </div>
              <p className='text-xs text-muted-foreground'>
                Successfully finished
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <CardTitle>Job Management</CardTitle>
                <CardDescription>
                  Monitor and manage all platform jobs. {pagination.total} total
                  jobs.
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  placeholder='Search jobs...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-48'
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>All</SelectItem>
                    <SelectItem value='OPEN'>Open</SelectItem>
                    <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                    <SelectItem value='DISPUTED'>Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className='w-32'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>All</SelectItem>
                    <SelectItem value='Home Maintenance and Repairs'>
                      Home Maintenance
                    </SelectItem>
                    <SelectItem value='Cleaning Services'>Cleaning</SelectItem>
                    <SelectItem value='Landscaping and Outdoor Services'>
                      Landscaping
                    </SelectItem>
                    <SelectItem value='Other Services'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              <EmptyState
                message={
                  searchTerm ? 'No jobs match your search.' : 'No jobs found.'
                }
              />
            ) : (
              <div className='space-y-4'>
                <div className='overflow-x-auto'>
                  <Table className='min-w-[1000px] w-full text-sm md:text-base'>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bids</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div className='space-y-1'>
                              <p className='text-sm font-medium'>{job.title}</p>
                              <p className='text-xs text-muted-foreground line-clamp-2'>
                                {job.description}
                              </p>
                              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                <MapPin className='w-3 h-3' />
                                {job.location || 'Remote'}
                                {job.isRemote && (
                                  <Badge variant='outline' className='text-xs'>
                                    Remote
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <p className='text-sm font-medium'>
                                {job.customer.firstName} {job.customer.lastName}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {job.customer.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <p className='text-sm font-medium'>
                                {job.category}
                              </p>
                              {job.subcategory && (
                                <p className='text-xs text-muted-foreground'>
                                  {job.subcategory}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <p className='text-sm font-bold text-green-600'>
                                $
                                {job.budget?.toLocaleString() ||
                                  'Not specified'}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {job.budgetType}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='space-y-1'>
                              <StatusBadge status={job.status} />
                              <PriorityBadge priority={job.priority} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1'>
                              <Users className='w-4 h-4' />
                              <span className='text-sm'>{job.bids.length}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  setSelectedJob(job);
                                  setDetailsModalOpen(true);
                                }}
                              >
                                <Eye className='w-4 h-4' />
                              </Button>

                              <Button
                                size='sm'
                                variant='secondary'
                                onClick={() => {
                                  setSelectedJob(job);
                                  setNewStatus(job.status);
                                  setStatusModalOpen(true);
                                }}
                              >
                                <Briefcase className='w-4 h-4' />
                                Status
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setPage((prev) => Math.max(1, prev - 1))
                          }
                          className={
                            page === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {[...Array(pagination.pages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setPage(i + 1)}
                            isActive={page === i + 1}
                            className='cursor-pointer'
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((prev) =>
                              Math.min(pagination.pages, prev + 1)
                            )
                          }
                          className={
                            page === pagination.pages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedJob(null);
        }}
      />

      {/* Update Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Change the status of "{selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>

          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder='Select new status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='OPEN'>Open</SelectItem>
              <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
              <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              <SelectItem value='DISPUTED'>Disputed</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button variant='outline' onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedJob && handleUpdateJobStatus(selectedJob.id)
              }
              disabled={!newStatus || actionLoading === selectedJob?.id}
            >
              {actionLoading === selectedJob?.id ? (
                <Loader2 className='animate-spin w-4 h-4 mr-2' />
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobManagement;
