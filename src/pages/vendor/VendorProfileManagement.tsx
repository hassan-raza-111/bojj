import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/utils/imageUtils';
import { vendorApi } from '@/config/vendorApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Upload } from 'lucide-react';

const VendorProfileManagement = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await vendorApi.getProfile();

        if (response.success && response.data) {
          setProfileData(response.data);
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

  // Handle profile picture upload
  const handleUploadPicture = async (file: File) => {
    try {
      setUploadingPicture(true);
      const response = await vendorApi.uploadProfilePicture(file);

      if (response.success) {
        toast.success('Profile picture uploaded successfully!');
        // Reload profile data
        const updatedResponse = await vendorApi.getProfile();
        if (updatedResponse.success && updatedResponse.data) {
          setProfileData(updatedResponse.data);
        }
      } else {
        toast.error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Loading profile data...
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="text-center">
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            No profile data found. Please complete your profile setup.
          </p>
        </div>
      </div>
    );
  }

  const vendorProfile = profileData.vendorProfile;
  const fullName =
    `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() ||
    'Vendor';

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
            onClick={() => navigate('/vendor/profile/setup')}
            className={
              theme === 'dark'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader className="text-center">
                <div className="relative h-24 w-24 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData?.avatar ? (
                    <img
                      src={getImageUrl(profileData.avatar) || ''}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={profileData?.avatar ? 'hidden' : ''}>
                    {profileData?.firstName?.charAt(0) || 'V'}
                  </span>

                  {/* Upload Button */}
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 shadow-md hover:shadow-lg"
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleUploadPicture(file);
                        }
                      };
                      input.click();
                    }}
                    disabled={uploadingPicture}
                  >
                    <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                </div>
                <CardTitle
                  className={`text-xl ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {vendorProfile?.companyName || fullName}
                </CardTitle>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {profileData.email || 'vendor@example.com'}
                </p>

                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    ⭐ {vendorProfile?.rating?.toFixed(1) || '0.0'} (
                    {vendorProfile?.totalReviews || 0} reviews)
                  </span>
                  {vendorProfile?.verified && (
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        theme === 'dark'
                          ? 'bg-green-900/20 text-green-300 border border-green-700'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {vendorProfile?.completedJobs || 0}
                    </p>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Jobs Completed
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {vendorProfile?.experience || 0}
                    </p>
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
          <div className="lg:col-span-2 space-y-6">
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                      value={vendorProfile?.companyName || ''}
                      readOnly
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Business Type
                    </label>
                    <input
                      className={`w-full p-2 border rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      value={vendorProfile?.businessType || ''}
                      readOnly
                      placeholder="Business type"
                    />
                  </div>
                  <div className="space-y-2">
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
                      value={profileData.phone || ''}
                      readOnly
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
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
                      value={profileData.location || ''}
                      readOnly
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div className="space-y-2">
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
                    value={vendorProfile?.description || ''}
                    readOnly
                    placeholder="Tell clients about your business..."
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
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {vendorProfile?.skills?.length > 0 ? (
                    vendorProfile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 border border-gray-600'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No skills added yet
                    </p>
                  )}
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
