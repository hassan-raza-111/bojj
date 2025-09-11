import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  useJobs, 
  useOpenJobs, 
  useCreateJob, 
  useUpdateJob, 
  useDeleteJob,
  useJobById,
  usePlaceBid,
  useAcceptBid,
  useRejectBid,
  useAuthProfile,
  useLogin,
  useLogout,
  queryKeys
} from '../../hooks/useApi';
import { useQueryWithLoading } from '../../hooks/useQueryUtils';

// Example component demonstrating React Query usage
export const ReactQueryExample: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [newJobData, setNewJobData] = useState({
    title: '',
    description: '',
    budget: '',
    category: ''
  });
  const [bidData, setBidData] = useState({
    amount: '',
    message: ''
  });

  // Query hooks
  const allJobs = useJobs();
  const openJobs = useOpenJobs();
  const selectedJob = useJobById(selectedJobId);
  const userProfile = useAuthProfile();

  // Mutation hooks
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const placeBid = usePlaceBid();
  const acceptBid = useAcceptBid();
  const rejectBid = useRejectBid();
  const login = useLogin();
  const logout = useLogout();

  // Utility hooks for better state management
  const jobsWithLoading = useQueryWithLoading(allJobs);
  const openJobsWithLoading = useQueryWithLoading(openJobs);
  const selectedJobWithLoading = useQueryWithLoading(selectedJob);

  // Handle job creation
  const handleCreateJob = () => {
    if (newJobData.title && newJobData.description) {
      createJob.mutate({
        ...newJobData,
        budget: parseFloat(newJobData.budget) || 0,
        status: 'open'
      }, {
        onSuccess: () => {
          setNewJobData({ title: '', description: '', budget: '', category: '' });
        }
      });
    }
  };

  // Handle job update
  const handleUpdateJob = (jobId: string, updates: any) => {
    updateJob.mutate({ id: jobId, jobData: updates });
  };

  // Handle job deletion
  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJob.mutate(jobId);
    }
  };

  // Handle bid placement
  const handlePlaceBid = (jobId: string) => {
    if (bidData.amount && bidData.message) {
      placeBid.mutate({
        jobId,
        bidData: {
          ...bidData,
          amount: parseFloat(bidData.amount)
        }
      }, {
        onSuccess: () => {
          setBidData({ amount: '', message: '' });
        }
      });
    }
  };

  // Handle bid acceptance
  const handleAcceptBid = (jobId: string, bidId: string) => {
    acceptBid.mutate({ jobId, bidId });
  };

  // Handle bid rejection
  const handleRejectBid = (jobId: string, bidId: string) => {
    rejectBid.mutate({ jobId, bidId });
  };

  // Handle login
  const handleLogin = () => {
    login.mutate({
      email: 'test@example.com',
      password: 'password123'
    });
  };

  // Handle logout
  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>React Query Implementation Examples</CardTitle>
          <CardDescription>
            This component demonstrates how to use React Query hooks for API operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Authentication Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Authentication</h3>
            <div className="flex gap-4 items-center">
              <Button onClick={handleLogin} disabled={login.isPending}>
                {login.isPending ? 'Logging in...' : 'Login'}
              </Button>
              <Button onClick={handleLogout} disabled={logout.isPending}>
                {logout.isPending ? 'Logging out...' : 'Logout'}
              </Button>
              <Badge variant={userProfile.data ? 'default' : 'secondary'}>
                {userProfile.data ? 'Logged In' : 'Not Logged In'}
              </Badge>
            </div>
            {userProfile.isLoading && <p>Loading profile...</p>}
            {userProfile.error && <p className="text-red-500">Error: {userProfile.error.message}</p>}
            {userProfile.data && (
              <div className="p-3 bg-gray-100 rounded">
                <p><strong>User:</strong> {userProfile.data.name || userProfile.data.email}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Job Creation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Job</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Job Title"
                value={newJobData.title}
                onChange={(e) => setNewJobData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Category"
                value={newJobData.category}
                onChange={(e) => setNewJobData(prev => ({ ...prev, category: e.target.value }))}
              />
              <Input
                placeholder="Budget"
                type="number"
                value={newJobData.budget}
                onChange={(e) => setNewJobData(prev => ({ ...prev, budget: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newJobData.description}
                onChange={(e) => setNewJobData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <Button 
              onClick={handleCreateJob} 
              disabled={createJob.isPending || !newJobData.title || !newJobData.description}
            >
              {createJob.isPending ? 'Creating...' : 'Create Job'}
            </Button>
            {createJob.isSuccess && <p className="text-green-500">Job created successfully!</p>}
            {createJob.error && <p className="text-red-500">Error: {createJob.error.message}</p>}
          </div>

          <Separator />

          {/* All Jobs Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Jobs</h3>
            {jobsWithLoading.isLoading && <p>Loading jobs...</p>}
            {jobsWithLoading.isError && <p className="text-red-500">Error loading jobs</p>}
            {jobsWithLoading.hasData && (
              <div className="grid gap-4">
                {allJobs.data?.map((job: any) => (
                  <Card key={job.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{job.category}</Badge>
                          <Badge variant="secondary">${job.budget}</Badge>
                          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedJobId(job.id)}
                          variant="outline"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateJob(job.id, { status: 'in-progress' })}
                          variant="outline"
                        >
                          Update
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Open Jobs Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Open Jobs</h3>
            {openJobsWithLoading.isLoading && <p>Loading open jobs...</p>}
            {openJobsWithLoading.isError && <p className="text-red-500">Error loading open jobs</p>}
            {openJobsWithLoading.hasData && (
              <div className="grid gap-4">
                {openJobs.data?.map((job: any) => (
                  <Card key={job.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{job.category}</Badge>
                          <Badge variant="secondary">${job.budget}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedJobId(job.id)}
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Selected Job Details */}
          {selectedJobId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selected Job Details</h3>
              {selectedJobWithLoading.isLoading && <p>Loading job details...</p>}
              {selectedJobWithLoading.isError && <p className="text-red-500">Error loading job details</p>}
              {selectedJobWithLoading.hasData && selectedJob.data && (
                <Card className="p-4">
                  <h4 className="font-semibold text-lg">{selectedJob.data.title}</h4>
                  <p className="text-gray-600 mt-2">{selectedJob.data.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{selectedJob.data.category}</Badge>
                    <Badge variant="secondary">${selectedJob.data.budget}</Badge>
                    <Badge variant={selectedJob.data.status === 'open' ? 'default' : 'secondary'}>
                      {selectedJob.data.status}
                    </Badge>
                  </div>
                  
                  {/* Bid Section */}
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h5 className="font-medium mb-2">Place a Bid</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Bid Amount"
                        type="number"
                        value={bidData.amount}
                        onChange={(e) => setBidData(prev => ({ ...prev, amount: e.target.value }))}
                      />
                      <Input
                        placeholder="Message"
                        value={bidData.message}
                        onChange={(e) => setBidData(prev => ({ ...prev, message: e.target.value }))}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePlaceBid(selectedJobId)}
                      disabled={placeBid.isPending || !bidData.amount || !bidData.message}
                      className="mt-2"
                    >
                      {placeBid.isPending ? 'Placing Bid...' : 'Place Bid'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Mutation Status Display */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Mutation Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Create Job:</strong> {createJob.isPending ? 'Pending' : createJob.isSuccess ? 'Success' : 'Idle'}</p>
                <p><strong>Update Job:</strong> {updateJob.isPending ? 'Pending' : updateJob.isSuccess ? 'Success' : 'Idle'}</p>
                <p><strong>Delete Job:</strong> {deleteJob.isPending ? 'Pending' : deleteJob.isSuccess ? 'Success' : 'Idle'}</p>
              </div>
              <div>
                <p><strong>Place Bid:</strong> {placeBid.isPending ? 'Pending' : placeBid.isSuccess ? 'Success' : 'Idle'}</p>
                <p><strong>Accept Bid:</strong> {acceptBid.isPending ? 'Pending' : acceptBid.isSuccess ? 'Success' : 'Idle'}</p>
                <p><strong>Reject Bid:</strong> {rejectBid.isPending ? 'Pending' : rejectBid.isSuccess ? 'Success' : 'Idle'}</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ReactQueryExample;
