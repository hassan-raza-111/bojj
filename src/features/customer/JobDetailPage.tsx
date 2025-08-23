import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';

const JobDetailPage = () => {
  const { id } = useParams();
  const { getJobById, loading } = useCustomer();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const jobData = getJobById(id);
      setJob(jobData);
    }
  }, [id, getJobById]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-bojj-primary' />
        <span className='ml-2 text-gray-600'>Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <h2 className='text-2xl font-semibold mb-4'>Job not found</h2>
        <Link to='/customer/jobs'>
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription className='mt-1'>
                Posted on {new Date(job.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge
              variant='outline'
              className={
                job.status === 'completed'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }
            >
              {job.status === 'completed' ? 'Completed' : 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <h3 className='font-semibold mb-1'>Description</h3>
            <p className='text-gray-700 dark:text-gray-300'>
              {job.description}
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <p className='text-sm text-gray-500'>Category</p>
              <p className='font-medium'>
                {job.category} / {job.subcategory}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Budget</p>
              <p className='font-medium'>${job.budget?.toLocaleString()}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Timeline</p>
              <p className='font-medium'>{job.timeline}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Location</p>
              <p className='font-medium'>{job.location}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Category</p>
              <p className='font-medium'>
                {job.category} - {job.subcategory}
              </p>
            </div>
            {job.status === 'completed' && (
              <div>
                <p className='text-sm text-gray-500'>Final Cost</p>
                <p className='font-medium'>{job.finalCost}</p>
              </div>
            )}
            {job.vendor && (
              <div>
                <p className='text-sm text-gray-500'>Vendor</p>
                <p className='font-medium'>{job.vendor}</p>
              </div>
            )}
          </div>
          {job.additionalRequests && (
            <div className='mb-4'>
              <h4 className='font-semibold mb-1'>Additional Requests</h4>
              <p className='text-gray-700 dark:text-gray-300'>
                {job.additionalRequests}
              </p>
            </div>
          )}
          <div className='flex gap-2 mt-6'>
            <Link to='/customer/jobs'>
              <Button variant='outline'>Back to Jobs</Button>
            </Link>
            <Link to={`/customer/jobs/${job.id}/edit`}>
              <Button>Edit Job</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailPage;
