import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const VendorProfilePage = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`container py-8 sm:py-12 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <Card
        className={`w-full max-w-4xl mx-auto ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-2'>
          <CardTitle
            className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Sarah's Handyman Services
          </CardTitle>
          <Button className='bg-emerald-600 hover:bg-emerald-700'>
            Contact Vendor
          </Button>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='md:col-span-1'>
              <div className='h-24 w-24 mb-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                S
              </div>

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    ⭐ 4.8 (125 reviews)
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-green-900/20 text-green-300 border border-green-700'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    ✓ Verified
                  </span>
                </div>

                <div className='flex items-center space-x-2'>
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    📍 123 Main St, Anytown
                  </span>
                </div>

                <div className='flex items-center space-x-2'>
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    📅 Joined Jan 2020
                  </span>
                </div>
              </div>
            </div>
            <div className='md:col-span-2'>
              <p
                className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Experienced handyman providing top-notch home renovation
                services. Licensed and insured.
              </p>
              <div className='space-y-2'>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Business Type: Home Renovation
                </p>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Experience: 5 years
                </p>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Hourly Rate: $50/hour
                </p>
              </div>

              <div className='mt-4'>
                <h4
                  className={`font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Skills & Services
                </h4>
                <div className='flex flex-wrap gap-2'>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Home Renovation
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Plumbing
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Electrical
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Painting
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <h3
              className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Portfolio
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              <div
                className={`rounded-md aspect-square flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gray-700 border border-gray-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Work sample 1
                </span>
              </div>
              <div
                className={`rounded-md aspect-square flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gray-700 border border-gray-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Work sample 2
                </span>
              </div>
              <div
                className={`rounded-md aspect-square flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gray-700 border border-gray-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Work sample 3
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfilePage;
