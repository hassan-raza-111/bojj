import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const VendorDetailPage = () => {
  const { theme } = useTheme();
  const reviews = [
    {
      name: 'Sarah M.',
      rating: 5,
      text: 'Exceptional work on our kitchen renovation. Michael was professional, punctual, and delivered outstanding results.',
      time: '2 weeks ago',
    },
    {
      name: 'James P.',
      rating: 5,
      text: 'Very satisfied with the bathroom remodel. Great attention to detail and excellent communication throughout.',
      time: '1 month ago',
    },
    {
      name: 'Linda K.',
      rating: 5,
      text: 'Professional service and quality work. Would recommend for any home renovation project.',
      time: '2 months ago',
    },
  ];

  return (
    <div
      className={`max-w-5xl mx-auto py-10 px-6 space-y-10 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Vendor Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
        <div
          className={`w-32 h-32 sm:w-48 sm:h-48 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        />
        <div className='flex-1 space-y-2'>
          <h1
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Michael Anderson
          </h1>
          <p
            className={
              theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
            }
          >
            Anderson Home Services
          </p>
          <div className='flex flex-wrap gap-4 mt-2'>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                }`}
              >
                Service Category
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Home Renovation
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                }`}
              >
                Experience
              </p>
              <p
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                12 years
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                }`}
              >
                Response Time
              </p>
              <Badge
                className={`text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                variant='default'
              >
                Fast
              </Badge>
            </div>
          </div>
        </div>
        <div className='flex gap-3 mt-4 sm:mt-0'>
          <Button className='bg-bojj-primary text-white'>
            Request a Quote
          </Button>
          <Button
            variant='outline'
            className={
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          >
            Chat Now
          </Button>
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Specializing in custom home renovations with a focus on kitchen and
          bathroom remodeling. Licensed contractor with over a decade of
          experience delivering high-quality craftsmanship.
        </p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {[
            'Kitchen Remodeling',
            'Bathroom Renovation',
            'Custom Cabinetry',
            'Flooring Installation',
          ].map((tag) => (
            <Badge
              key={tag}
              variant='outline'
              className={
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='reviews' className='w-full'>
        <TabsList
          className={`overflow-x-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <TabsTrigger
            value='reviews'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value='portfolio'
            className={`${
              theme === 'dark'
                ? 'data-[state=active]:bg-gray-700'
                : 'data-[state=active]:bg-white'
            }`}
          >
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Reviews */}
        <TabsContent value='reviews' className='mt-6'>
          <div className='flex items-center gap-6 mb-6'>
            <div
              className={`text-4xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              4.8
            </div>
            <div>
              <div className='flex gap-1 text-yellow-500'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill='currentColor' />
                ))}
              </div>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                }`}
              >
                127 reviews
              </p>
            </div>
            <div className='ml-auto text-right'>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                }`}
              >
                Jobs Completed
              </p>
              <p className='text-xl font-semibold text-bojj-primary'>243</p>
            </div>
          </div>

          <div className='space-y-6'>
            {reviews.map((review, index) => (
              <div key={index}>
                <div
                  className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {review.name}
                </div>
                <div className='flex items-center gap-1 text-yellow-500 text-sm mb-1'>
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} fill='currentColor' />
                  ))}
                </div>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                  }`}
                >
                  {review.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'
                  }`}
                >
                  {review.time}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Portfolio Placeholder */}
        <TabsContent
          value='portfolio'
          className={`mt-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
          }`}
        >
          Portfolio will be shown here soon...
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDetailPage;
