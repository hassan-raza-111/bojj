import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { vendorApi } from '@/config/vendorApi';
import { toast } from 'sonner';
import { Star, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';

const VendorProfilePage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await vendorApi.getProfile();

        if (response.success && response.data) {
          setProfileData(response.data);
          console.log('📋 Profile Page Data:', response.data);
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div
        className={`container py-8 sm:py-12 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='w-full max-w-4xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-300 rounded w-1/3 mb-4'></div>
            <div className='h-64 bg-gray-300 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div
        className={`container py-8 sm:py-12 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='w-full max-w-4xl mx-auto text-center'>
          <p
            className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            No profile data available
          </p>
        </div>
      </div>
    );
  }

  const vendorProfile = profileData.vendorProfile;
  const userData = profileData;

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
            {vendorProfile?.companyName ||
              `${userData.firstName} ${userData.lastName}`}
          </CardTitle>
          <div className='flex gap-2'>
            <Button className='bg-emerald-600 hover:bg-emerald-700'>
              Contact Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='md:col-span-1'>
              <div className='h-24 w-24 mb-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden'>
                {userData.avatar ? (
                  <img
                    src={getImageUrl(userData.avatar)}
                    alt='Profile Picture'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className='w-full h-full flex items-center justify-center'
                  style={{ display: userData.avatar ? 'none' : 'flex' }}
                >
                  {userData.firstName?.charAt(0) ||
                    userData.email?.charAt(0) ||
                    'V'}
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Badge
                    variant='secondary'
                    className={`${
                      theme === 'dark'
                        ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <Star className='w-3 h-3 mr-1' />
                    {vendorProfile?.rating?.toFixed(1) || '0.0'} (
                    {vendorProfile?.totalReviews || 0} reviews)
                  </Badge>
                  <Badge
                    variant='secondary'
                    className={`${
                      theme === 'dark'
                        ? 'bg-green-900/20 text-green-300 border border-green-700'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    ✓ Verified
                  </Badge>
                </div>

                <div className='flex items-center space-x-2'>
                  <MapPin
                    className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {userData.location || 'Location not provided'}
                  </span>
                </div>

                <div className='flex items-center space-x-2'>
                  <Calendar
                    className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Joined {formatDistanceToNow(new Date(userData.createdAt))}{' '}
                    ago
                  </span>
                </div>

                <div className='flex items-center space-x-2'>
                  <Phone
                    className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {userData.phone || 'Phone not provided'}
                  </span>
                </div>

                <div className='flex items-center space-x-2'>
                  <Mail
                    className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {userData.email}
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
                {vendorProfile?.description || 'No description provided'}
              </p>
              <div className='space-y-2'>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Business Type:{' '}
                  {vendorProfile?.businessType || 'Not specified'}
                </p>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Experience: {vendorProfile?.experience || 0} years
                </p>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Completed Jobs: {vendorProfile?.completedJobs || 0}
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
                  {vendorProfile?.skills && vendorProfile.skills.length > 0 ? (
                    vendorProfile.skills.map((skill: string, index: number) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className={`${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border border-gray-600'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No skills specified
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfilePage;
