import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Star,
} from 'lucide-react';

const VendorJobsPage = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock data for available jobs
  const availableJobs = [
    {
      id: 'job-1',
      title: 'Kitchen Renovation',
      description:
        'Complete renovation of kitchen including cabinets, countertops, and appliances. Looking for experienced contractor with kitchen renovation expertise.',
      location: 'Chicago, IL',
      postedDate: '2023-04-25',
      budget: '$8,000 - $12,000',
      category: 'Home Renovation',
      distance: '3.2 miles away',
      customerRating: 4.8,
      totalBids: 12,
      urgency: 'High',
    },
    {
      id: 'job-2',
      title: 'Bathroom Remodel',
      description:
        'Full bathroom remodel with new fixtures, tile, and vanity. Need someone who can work with existing plumbing.',
      location: 'Evanston, IL',
      postedDate: '2023-04-23',
      budget: '$5,000 - $7,500',
      category: 'Home Renovation',
      distance: '5.1 miles away',
      customerRating: 4.6,
      totalBids: 8,
      urgency: 'Medium',
    },
    {
      id: 'job-3',
      title: 'Deck Construction',
      description:
        "Build a 12' x 14' wooden deck in the backyard. Must be weather-resistant and include railings.",
      location: 'Oak Park, IL',
      postedDate: '2023-04-21',
      budget: '$3,000 - $4,500',
      category: 'Carpentry',
      distance: '4.3 miles away',
      customerRating: 4.9,
      totalBids: 15,
      urgency: 'Low',
    },
    {
      id: 'job-4',
      title: 'Basement Finishing',
      description:
        'Convert unfinished basement into living space. Include electrical, plumbing, and drywall work.',
      location: 'Naperville, IL',
      postedDate: '2023-04-20',
      budget: '$15,000 - $20,000',
      category: 'Home Renovation',
      distance: '8.7 miles away',
      customerRating: 4.7,
      totalBids: 6,
      urgency: 'High',
    },
    {
      id: 'job-5',
      title: 'Roof Repair',
      description:
        'Repair damaged shingles and flashing around chimney. Also need gutter cleaning and repair.',
      location: 'Arlington Heights, IL',
      postedDate: '2023-04-18',
      budget: '$2,000 - $3,500',
      category: 'Roofing',
      distance: '6.2 miles away',
      customerRating: 4.5,
      totalBids: 9,
      urgency: 'High',
    },
    {
      id: 'job-6',
      title: 'Landscape Design',
      description:
        'Design and implement complete landscape plan including plants, irrigation, and hardscaping.',
      location: 'Wheaton, IL',
      postedDate: '2023-04-17',
      budget: '$6,000 - $9,000',
      category: 'Landscaping',
      distance: '10.1 miles away',
      customerRating: 4.8,
      totalBids: 11,
      urgency: 'Medium',
    },
  ];

  const categories = [
    'all',
    'Home Renovation',
    'Carpentry',
    'Roofing',
    'Landscaping',
    'Plumbing',
    'Electrical',
    'Painting',
    'Flooring',
  ];

  const locations = [
    'all',
    'Chicago, IL',
    'Evanston, IL',
    'Oak Park, IL',
    'Naperville, IL',
    'Arlington Heights, IL',
    'Wheaton, IL',
  ];

  const filteredJobs = availableJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || job.category === selectedCategory;
    const matchesLocation =
      selectedLocation === 'all' || job.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return theme === 'dark'
          ? 'bg-red-900/20 text-red-300 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return theme === 'dark'
          ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Low':
        return theme === 'dark'
          ? 'bg-green-900/20 text-green-300 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      default:
        return theme === 'dark'
          ? 'bg-gray-900/20 text-gray-300 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      className={`p-4 md:p-8 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className='mb-8'>
        <h1
          className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Available Jobs
        </h1>
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Find jobs that match your skills and start earning
        </p>
      </div>

      {/* Search and Filters */}
      <div className='mb-6 space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search jobs by title or description...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className='w-full sm:w-48'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className='w-full sm:w-48'>
              <SelectValue placeholder='Location' />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className='mb-6'>
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Showing {filteredJobs.length} of {availableJobs.length} available jobs
        </p>
      </div>

      {/* Jobs Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } hover:shadow-lg transition-shadow duration-200`}
          >
            <CardHeader className='pb-3'>
              <div className='flex justify-between items-start mb-3'>
                <div className='min-w-0 flex-1'>
                  <CardTitle
                    className={`text-xl ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {job.title}
                  </CardTitle>
                  <div className='flex items-center gap-2 mt-1'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {job.location} • {job.distance}
                    </span>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className={`${
                    theme === 'dark'
                      ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {job.category}
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 text-yellow-500 fill-current' />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {job.customerRating}
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {job.totalBids} bids
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className={getUrgencyColor(job.urgency)}
                >
                  {job.urgency}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p
                className={`mb-4 line-clamp-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {job.description}
              </p>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-green-500' />
                  <div>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Budget
                    </p>
                    <p
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {job.budget}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-blue-500' />
                  <div>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Posted
                    </p>
                    <p
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {job.postedDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex space-x-3'>
                <Link
                  to={`/vendor-dashboard/jobs/${job.id}/view`}
                  className='flex-1 min-w-0'
                >
                  <Button variant='outline' className='w-full'>
                    View Details
                  </Button>
                </Link>

                <Link
                  to={`/vendor-dashboard/jobs/${job.id}/bid`}
                  className='flex-1 min-w-0'
                >
                  <Button className='w-full bg-bojj-primary hover:bg-bojj-primary/90'>
                    Submit Bid
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <div className='text-center py-12'>
          <div className='mb-4'>
            <Search className='h-12 w-12 mx-auto text-gray-400' />
          </div>
          <h3
            className={`text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            No jobs found
          </h3>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Try adjusting your search criteria or check back later for new
            opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorJobsPage;
