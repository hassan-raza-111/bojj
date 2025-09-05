import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator, SeparatorHorizontal } from '@/components/ui/separator';
import { MessageButton } from '@/components/shared/MessageButton';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  MessageSquare,
  Star,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import customerAPI from '@/config/customerApi';
import { formatDistanceToNow, format } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget?: number;
  budgetType: string;
  location?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timeline?: string;
  date?: string;
  time?: string;
  additionalRequests?: string;
  contactPreference?: string;
  images: string[];
  tags: string[];
  requirements: string[];
  estimatedDuration?: string;
  urgency?: string;
  customerRating?: number;
  customerFeedback?: string;
  completionDate?: string;
  viewCount: number;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
  assignedVendor?: {
    id: string;
    firstName: string;
    lastName: string;
    vendorProfile?: {
      rating?: number;
      companyName?: string;
    };
  };
}

interface Bid {
  id: string;
  amount: number;
  description: string;
  timeline: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  vendorId: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    vendorProfile?: {
      rating?: number;
      companyName?: string;
    };
  };
  createdAt: string;
}

interface JobAnalytics {
  bidStats: {
    total: number;
    average: number;
    lowest: number;
    highest: number;
    accepted: number;
    pending: number;
  };
  engagementMetrics: {
    viewCount: number;
    savedCount: number;
    shareCount: number;
    responseTime: string;
  };
  performanceMetrics: {
    timeToCompletion: string;
    customerSatisfaction: number;
    rehireLikelihood: number;
    budgetEfficiency: number;
  };
}

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch job details
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => customerAPI.getJobById(id || ''),
    enabled: !!id,
  });

  // Fetch job bids
  const {
    data: bids = [],
    isLoading: bidsLoading,
    refetch: refetchBids,
  } = useQuery({
    queryKey: ['jobBids', id],
    queryFn: () => customerAPI.getJobBids(id || ''),
    enabled: !!id,
  });

  // Fetch job analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['jobAnalytics', id],
    queryFn: () => customerAPI.getJobAnalytics(id || ''),
    enabled: !!id,
  });

  // Accept bid mutation
  const acceptBidMutation = useMutation({
    mutationFn: ({ jobId, bidId }: { jobId: string; bidId: string }) =>
      customerAPI.acceptBid(jobId, bidId),
    onSuccess: () => {
      toast({
        title: 'Bid Accepted',
        description: 'Vendor has been assigned to your job.',
      });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobBids', id] });
      refetchBids();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept bid.',
        variant: 'destructive',
      });
    },
  });

  // Reject bid mutation
  const rejectBidMutation = useMutation({
    mutationFn: ({ jobId, bidId }: { jobId: string; bidId: string }) =>
      customerAPI.rejectBid(jobId, bidId),
    onSuccess: () => {
      toast({
        title: 'Bid Rejected',
        description: 'Bid has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['jobBids', id] });
      refetchBids();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject bid.',
        variant: 'destructive',
      });
    },
  });

  const handleAcceptBid = (bidId: string) => {
    if (
      window.confirm(
        'Are you sure you want to accept this bid? This will assign the vendor to your job.'
      )
    ) {
      acceptBidMutation.mutate({ jobId: id || '', bidId });
    }
  };

  const handleRejectBid = (bidId: string) => {
    if (window.confirm('Are you sure you want to reject this bid?')) {
      rejectBidMutation.mutate({ jobId: id || '', bidId });
    }
  };

  const handleCompleteJob = (jobId: string) => {
    if (
      window.confirm(
        'Are you sure you want to mark this job as complete? This will release the payment to the vendor.'
      )
    ) {
      // Call API to complete job
      fetch(`/api/jobs/${jobId}/complete-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ customerId: user?.id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            toast({
              title: 'Job Completed',
              description:
                'Job has been marked as complete and payment has been released to the vendor.',
            });
            queryClient.invalidateQueries({ queryKey: ['job', id] });
          } else {
            toast({
              title: 'Error',
              description: data.message || 'Failed to complete job.',
              variant: 'destructive',
            });
          }
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: 'Failed to complete job.',
            variant: 'destructive',
          });
        });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (jobLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading job details...</span>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Job Not Found</h2>
          <p className='text-gray-600 mb-4'>
            The job you're looking for doesn't exist or you don't have access to
            it.
          </p>
          <Button onClick={() => navigate('/customer/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/customer/jobs')}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Jobs
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              {job.title}
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              {job.category}
              {job.subcategory && ` • ${job.subcategory}`}
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {job.status === 'OPEN' && (
            <Button
              variant='outline'
              onClick={() => navigate(`/customer/jobs/${job.id}/edit`)}
            >
              <Edit className='h-4 w-4 mr-2' />
              Edit Job
            </Button>
          )}
          <Badge className={getStatusColor(job.status)}>
            {job.status.replace('_', ' ')}
          </Badge>
          <Badge className={getPriorityColor(job.priority)}>
            {job.priority}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column - Job Details */}
        <div className='lg:col-span-2'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='bids'>Bids ({bids.length})</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='activity'>Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value='overview' className='space-y-6'>
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 dark:text-gray-300 mb-4'>
                    {job.description}
                  </p>

                  {job.additionalRequests && (
                    <div className='mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                      <h4 className='font-semibold mb-2'>
                        Additional Requests
                      </h4>
                      <p className='text-gray-600 dark:text-gray-400'>
                        {job.additionalRequests}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex items-center space-x-3'>
                      <DollarSign className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='text-sm text-gray-500'>Budget</p>
                        <p className='font-medium'>
                          {job.budget
                            ? `$${job.budget.toLocaleString()}`
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <Clock className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='text-sm text-gray-500'>Timeline</p>
                        <p className='font-medium'>
                          {job.timeline || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <MapPin className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='text-sm text-gray-500'>Location</p>
                        <p className='font-medium'>
                          {job.location ||
                            `${job.street}, ${job.city}, ${job.state} ${job.zipCode}`}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <Calendar className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='text-sm text-gray-500'>Posted</p>
                        <p className='font-medium'>
                          {formatDistanceToNow(new Date(job.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant='secondary'>
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {job.tags.map((tag, index) => (
                        <Badge key={index} variant='outline'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bids Tab */}
            <TabsContent value='bids' className='space-y-4'>
              {bidsLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span className='ml-2'>Loading bids...</span>
                </div>
              ) : bids.length === 0 ? (
                <Card>
                  <CardContent className='text-center py-8'>
                    <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium mb-2'>No Bids Yet</h3>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Vendors haven't submitted any bids for this job yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className='space-y-4'>
                  {bids.map((bid: Bid) => (
                    <Card key={bid.id}>
                      <CardHeader>
                        <div className='flex justify-between items-start'>
                          <div>
                            <CardTitle className='text-lg'>
                              ${bid.amount.toLocaleString()}
                            </CardTitle>
                            <CardDescription>
                              by {bid.vendor.firstName} {bid.vendor.lastName}
                              {bid.vendor.vendorProfile?.companyName && (
                                <span className='ml-2 text-gray-500'>
                                  • {bid.vendor.vendorProfile.companyName}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className='flex items-center space-x-2'>
                            {bid.vendor.vendorProfile?.rating && (
                              <div className='flex items-center'>
                                <Star className='h-4 w-4 text-yellow-500 mr-1' />
                                <span className='text-sm'>
                                  {bid.vendor.vendorProfile.rating}
                                </span>
                              </div>
                            )}
                            <Badge
                              variant={
                                bid.status === 'ACCEPTED'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {bid.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className='text-gray-700 dark:text-gray-300 mb-3'>
                          {bid.description}
                        </p>
                        <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
                          <span>Timeline: {bid.timeline}</span>
                          <span>
                            Submitted{' '}
                            {formatDistanceToNow(new Date(bid.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </CardContent>
                      {job.status === 'OPEN' && bid.status === 'PENDING' && (
                        <CardFooter className='flex space-x-2'>
                          <Button
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={acceptBidMutation.isPending}
                            className='flex-1'
                          >
                            {acceptBidMutation.isPending ? (
                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            ) : (
                              <CheckCircle className='h-4 w-4 mr-2' />
                            )}
                            Accept Bid
                          </Button>
                          <Button
                            variant='outline'
                            onClick={() => handleRejectBid(bid.id)}
                            disabled={rejectBidMutation.isPending}
                          >
                            {rejectBidMutation.isPending ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <XCircle className='h-4 w-4' />
                            )}
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value='analytics' className='space-y-4'>
              {analyticsLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span className='ml-2'>Loading analytics...</span>
                </div>
              ) : analytics ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Bid Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bid Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex justify-between'>
                          <span>Total Bids:</span>
                          <span className='font-semibold'>
                            {analytics.bidStats.total}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Average Bid:</span>
                          <span className='font-semibold'>
                            ${analytics.bidStats.average.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Lowest Bid:</span>
                          <span className='font-semibold'>
                            ${analytics.bidStats.lowest.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Highest Bid:</span>
                          <span className='font-semibold'>
                            ${analytics.bidStats.highest.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex justify-between'>
                          <span>Views:</span>
                          <span className='font-semibold'>
                            {analytics.engagementMetrics.viewCount}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Response Time:</span>
                          <span className='font-semibold'>
                            {analytics.engagementMetrics.responseTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className='text-center py-8'>
                    <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-medium mb-2'>
                      No Analytics Available
                    </h3>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Analytics will be available once the job receives some
                      activity.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value='activity' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <div>
                        <p className='text-sm font-medium'>Job Posted</p>
                        <p className='text-xs text-gray-500'>
                          {format(
                            new Date(job.createdAt),
                            'MMM dd, yyyy HH:mm'
                          )}
                        </p>
                      </div>
                    </div>

                    {job.updatedAt !== job.createdAt && (
                      <div className='flex items-center space-x-3'>
                        <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                        <div>
                          <p className='text-sm font-medium'>Job Updated</p>
                          <p className='text-xs text-gray-500'>
                            {format(
                              new Date(job.updatedAt),
                              'MMM dd, yyyy HH:mm'
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {bids.map((bid: Bid) => (
                      <div key={bid.id} className='flex items-center space-x-3'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <div>
                          <p className='text-sm font-medium'>
                            Bid received from {bid.vendor.firstName}{' '}
                            {bid.vendor.lastName}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {format(
                              new Date(bid.createdAt),
                              'MMM dd, yyyy HH:mm'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className='space-y-6'>
          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Views
                </span>
                <div className='flex items-center'>
                  <Eye className='h-4 w-4 mr-2' />
                  <span className='font-semibold'>{job.viewCount}</span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Bids
                </span>
                <div className='flex items-center'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  <span className='font-semibold'>{job.bidCount}</span>
                </div>
              </div>

              <Separator />

              <div className='text-center'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Posted
                </p>
                <p className='font-semibold'>
                  {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Vendor */}
          {job.assignedVendor && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Vendor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center space-x-3 mb-3'>
                  <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center'>
                    <User className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                  </div>
                  <div>
                    <p className='font-medium'>
                      {job.assignedVendor.firstName}{' '}
                      {job.assignedVendor.lastName}
                    </p>
                    {job.assignedVendor.vendorProfile?.companyName && (
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {job.assignedVendor.vendorProfile.companyName}
                      </p>
                    )}
                  </div>
                </div>

                {job.assignedVendor.vendorProfile?.rating && (
                  <div className='flex items-center space-x-1 mb-3'>
                    <Star className='h-4 w-4 text-yellow-500' />
                    <span className='text-sm font-medium'>
                      {job.assignedVendor.vendorProfile.rating}
                    </span>
                  </div>
                )}

                <div className='space-y-2'>
                  <Button variant='outline' size='sm' className='w-full'>
                    <Phone className='h-4 w-4 mr-2' />
                    Contact Vendor
                  </Button>
                  <MessageButton
                    jobId={job.id}
                    vendorId={job.assignedVendor.id}
                    variant='outline'
                    size='sm'
                    className='w-full'
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button variant='outline' size='sm' className='w-full'>
                <MessageSquare className='h-4 w-4 mr-2' />
                View All Bids
              </Button>

              {job.status === 'OPEN' && (
                <Button variant='outline' size='sm' className='w-full'>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Job
                </Button>
              )}

              <Button variant='outline' size='sm' className='w-full'>
                <Eye className='h-4 w-4 mr-2' />
                View Public Page
              </Button>

              {/* Payment Button - Only show if job has assigned vendor */}
              {job.assignedVendor && job.status === 'IN_PROGRESS' && (
                <Button
                  onClick={() => navigate(`/customer/jobs/${job.id}/payment`)}
                  size='sm'
                  className='w-full bg-green-600 hover:bg-green-700'
                >
                  <CreditCard className='h-4 w-4 mr-2' />
                  Make Payment
                </Button>
              )}

              {/* Job Approval Button - Only show if job is pending approval */}
              {job.assignedVendor && job.status === 'PENDING_APPROVAL' && (
                <Button
                  onClick={() => handleCompleteJob(job.id)}
                  size='sm'
                  className='w-full bg-blue-600 hover:bg-blue-700'
                >
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Approve & Release Payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
