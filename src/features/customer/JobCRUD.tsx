import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';
import CustomerLayout from '@/layouts/CustomerLayout';

export interface JobData {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  budget: string;
  timeline: string;
  date: string;
  time: string;
  additionalRequests: string;
  contactPreference: string;
  status: string;
  postedDate: string;
  completedDate?: string;
  finalCost?: string;
  vendor?: string;
  bidsCount?: number;
  unreadMessages?: number;
  company?: string;
  serviceCategory: string;
  serviceType: string;
}

const initialJobs: JobData[] = [
  {
    id: 'job-1',
    title: 'Kitchen Renovation',
    category: 'Home Renovation',
    subcategory: 'Kitchen',
    description:
      'Complete renovation of kitchen including cabinets, countertops, and appliances.',
    street: '123 Main St',
    city: 'Chicago',
    state: 'Illinois',
    zipCode: '60601',
    budget: '$8,000 - $12,000',
    timeline: 'ASAP',
    date: '',
    time: '',
    additionalRequests: '',
    contactPreference: 'email',
    status: 'active',
    postedDate: '2023-04-25',
    bidsCount: 5,
    unreadMessages: 2,
    company: 'BOJJ Construction',
    serviceCategory: 'Home Renovation',
    serviceType: 'Kitchen',
  },
  {
    id: 'job-2',
    title: 'Bathroom Remodel',
    category: 'Home Renovation',
    subcategory: 'Bathroom',
    description: 'Full bathroom remodel with new fixtures, tile, and vanity.',
    street: '456 Oak Ave',
    city: 'Chicago',
    state: 'Illinois',
    zipCode: '60602',
    budget: '$5,000 - $7,500',
    timeline: 'Within a month',
    date: '',
    time: '',
    additionalRequests: '',
    contactPreference: 'phone',
    status: 'active',
    postedDate: '2023-04-23',
    bidsCount: 3,
    unreadMessages: 0,
    company: 'BOJJ Construction',
    serviceCategory: 'Home Renovation',
    serviceType: 'Bathroom',
  },
  {
    id: 'job-3',
    title: 'Lawn Landscaping',
    category: 'Landscaping',
    subcategory: 'Lawn Care',
    description:
      'Front yard landscaping with new plants, mulch, and decorative stones.',
    street: '789 Pine Rd',
    city: 'Chicago',
    state: 'Illinois',
    zipCode: '60603',
    budget: '$1,500 - $2,500',
    timeline: 'Specific Date',
    date: '2023-04-15',
    time: '10:00',
    additionalRequests: '',
    contactPreference: 'both',
    status: 'completed',
    postedDate: '2023-04-10',
    completedDate: '2023-04-18',
    finalCost: '$2,100',
    vendor: 'Green Thumb Landscaping',
    bidsCount: 2,
    unreadMessages: 0,
    company: 'Green Thumb Landscaping',
    serviceCategory: 'Landscaping',
    serviceType: 'Lawn Care',
  },
];

const JobCRUD = () => {
  const [jobs, setJobs] = useState<JobData[]>(initialJobs);
  const [search, setSearch] = useState('');

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };
  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.category.toLowerCase().includes(q) ||
      job.city.toLowerCase().includes(q) ||
      (job.company && job.company.toLowerCase().includes(q))
    );
  });

  const jobContent = (
    <div className='w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Jobs</h2>
        <Link to='/customer/jobs/new'>
          <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-colors flex items-center gap-2'>
            <Plus className='h-4 w-4' /> Add a Job
          </Button>
        </Link>
      </div>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <input
          type='text'
          placeholder='Search jobs by title, type, location, or company...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full max-w-md px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bojj-primary'
        />
      </div>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service Category</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-center text-gray-500 py-8'
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className='font-medium'>{job.title}</TableCell>
                  <TableCell>{job.category}</TableCell>
                  <TableCell>
                    {job.city}, {job.state}
                  </TableCell>
                  <TableCell>{job.company || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        job.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {job.status === 'completed' ? 'Completed' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {job.status === 'completed'
                      ? job.completedDate
                      : job.postedDate}
                  </TableCell>
                  <TableCell>{job.serviceCategory}</TableCell>
                  <TableCell>{job.serviceType}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Link to={`/customer/jobs/${job.id}/edit`}>
                        <Button size='icon' variant='ghost' title='Edit'>
                          <Pencil className='h-4 w-4' />
                        </Button>
                      </Link>
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => handleDelete(job.id)}
                        title='Delete'
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return <CustomerLayout>{jobContent}</CustomerLayout>;
};

export default JobCRUD;
