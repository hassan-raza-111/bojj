import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

const VendorProfileManagement = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Convert avatar URL to full URL if needed
  const getAvatarUrl = (avatar: string | undefined) => {
    if (!avatar) return null;
    return avatar.startsWith('/uploads/')
      ? `${
          import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
        }${avatar}`
      : avatar;
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className='max-w-4xl mx-auto p-6'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Profile Management
            </h1>
            <p
              className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Manage your vendor profile and business information
            </p>
          </div>
          <Button
            className={
              theme === 'dark'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }
          >
            Edit Profile
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Profile Overview */}
          <div className='lg:col-span-1'>
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader className='text-center'>
                <div className='h-24 w-24 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                  {user?.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar) || ''}
                      alt='Profile'
                      className='w-full h-full rounded-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={user?.avatar ? 'hidden' : ''}>
                    {user?.firstName?.charAt(0) || 'V'}
                  </span>
                </div>
                <CardTitle
                  className={`text-xl ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Vendor Name
                </CardTitle>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  vendor@example.com
                </p>

                <div className='flex flex-wrap gap-2 justify-center mt-4'>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    ⭐ 4.5 (25 reviews)
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
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4 text-center'>
                  <div>
                    <p className='text-2xl font-bold text-emerald-600'>12</p>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Jobs Completed
                    </p>
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>5</p>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Years Experience
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Basic Information */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Company Name
                    </label>
                    <input
                      className={`w-full p-2 border rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      value='My Company'
                      readOnly
                      placeholder='Enter company name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Business Type
                    </label>
                    <select
                      className={`w-full p-2 border rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      disabled
                    >
                      <option value='Small Business'>Small Business</option>
                    </select>
                  </div>
                  <div className='space-y-2'>
                    <label
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Phone Number
                    </label>
                    <input
                      className={`w-full p-2 border rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      value='+1 (555) 123-4567'
                      readOnly
                      placeholder='+1 (555) 123-4567'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Location
                    </label>
                    <input
                      className={`w-full p-2 border rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      value='New York, NY'
                      readOnly
                      placeholder='City, State'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Business Description
                  </label>
                  <textarea
                    className={`w-full p-2 border rounded ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    value='Experienced vendor providing quality services...'
                    readOnly
                    placeholder='Tell clients about your business...'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Skills & Services
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileManagement;
