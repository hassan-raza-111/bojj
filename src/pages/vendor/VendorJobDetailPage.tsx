import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

// Mock data for jobs
const jobs = [
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
    postedDate: '2023-04-25',
    status: 'active',
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
    postedDate: '2023-04-23',
    status: 'active',
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
    postedDate: '2023-04-10',
    status: 'completed',
    company: 'Green Thumb Landscaping',
    serviceCategory: 'Landscaping',
    serviceType: 'Lawn Care',
  },
  // Add more jobs as needed
];

// Mock data for bids
const activeBids = [
  {
    id: 'bid-1',
    jobId: 'job-1',
    jobTitle: 'Kitchen Renovation',
    bidAmount: '$15,800',
    bidDate: '2023-04-20',
    status: 'Pending',
    customerName: 'Robert Johnson',
    notes: 'Includes all materials and labor for complete basement finishing.',
  },
  {
    id: 'bid-2',
    jobId: 'job-2',
    jobTitle: 'Bathroom Remodel',
    bidAmount: '$2,400',
    bidDate: '2023-04-18',
    status: 'Under Review',
    customerName: 'Jennifer Davis',
    notes: 'Repair of damaged shingles and flashing around chimney.',
  },
];

// Mock data for awarded jobs
const awardedJobs = [
  {
    id: 'awarded-1',
    jobId: 'job-3',
    jobTitle: 'Lawn Landscaping',
    bidAmount: '$850',
    startDate: '2023-05-02',
    customerName: 'Michael Thompson',
    status: 'In Progress',
    paymentStatus: 'Deposit Received',
  },
];

const VendorJobDetailPage = () => {
  const { id } = useParams();
  const { theme } = useTheme();

  // Try to find job directly
  let job = jobs.find((j) => j.id === id);

  // If not found, try to find in bids or awarded jobs
  if (!job) {
    const bid = activeBids.find((b) => b.id === id);
    if (bid) {
      job = jobs.find((j) => j.id === bid.jobId);
    }
  }
  if (!job) {
    const awarded = awardedJobs.find((a) => a.id === id);
    if (awarded) {
      job = jobs.find((j) => j.id === awarded.jobId);
    }
  }

  if (!job) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <h2 className='text-2xl font-semibold mb-4'>Job not found</h2>
        <Link to='/vendor-dashboard'>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto py-10'>
      <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle
                className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
              >
                {job.title}
              </CardTitle>
              <CardDescription
                className={`mt-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Posted on {job.postedDate}
              </CardDescription>
            </div>
            <Badge
              variant='outline'
              className={
                job.status === 'completed'
                  ? theme === 'dark'
                    ? 'bg-blue-900/20 text-blue-300 border-blue-700'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                  : theme === 'dark'
                  ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }
            >
              {job.status === 'completed' ? 'Completed' : 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <h3
              className={`font-semibold mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Description
            </h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {job.description}
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Category
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {job.category} / {job.subcategory}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Budget
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {job.budget}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Timeline
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {job.timeline}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Location
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {job.street}, {job.city}, {job.state} {job.zipCode}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Service
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {job.serviceCategory} - {job.serviceType}
              </p>
            </div>
          </div>
          <div className='flex gap-2 mt-6'>
            <Link to='/vendor-dashboard'>
              <Button variant='outline'>Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorJobDetailPage;
