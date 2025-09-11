import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useJobs, useDeleteJob } from '../../hooks/useApiHooks';
import { toast } from 'sonner';

// Simple component showing how to use the new organized hooks
export const SimpleJobList: React.FC = () => {
  // Using the clean React Query hooks
  const { data: jobs = [], isLoading, error, refetch } = useJobs();
  const deleteJob = useDeleteJob();

  const handleDelete = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJob.mutate(jobId, {
        onSuccess: () => {
          toast.success('Job deleted successfully!');
        },
        onError: (error) => {
          toast.error(`Failed to delete job: ${error.message}`);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading jobs</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Jobs</h2>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No jobs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{job.description}</p>
                  </div>
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p><strong>Category:</strong> {job.category}</p>
                    <p><strong>Budget:</strong> ${job.budget}</p>
                    <p><strong>Location:</strong> {job.city}, {job.state}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(job.id)}
                      disabled={deleteJob.isPending}
                    >
                      {deleteJob.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mutation Status */}
      {deleteJob.isPending && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">Deleting job...</p>
        </div>
      )}

      {deleteJob.isSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">Job deleted successfully!</p>
        </div>
      )}

      {deleteJob.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">Error: {deleteJob.error.message}</p>
        </div>
      )}
    </div>
  );
};

export default SimpleJobList;
