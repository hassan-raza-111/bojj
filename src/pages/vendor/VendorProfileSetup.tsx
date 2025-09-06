import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { vendorApi } from '@/config/vendorApi';
import { toast } from 'sonner';
import { Plus, X, Upload, Check } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

interface VendorProfileData {
  companyName: string;
  businessType: string;
  experience: number;
  skills: string[];
  location: string;
  phone: string;
  website?: string;
  description: string;
  hourlyRate: number;
  portfolio: string[];
  documents: string[];
  verified: boolean;
  avatar?: string;
}

const VendorProfileSetup = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const [profileData, setProfileData] = useState<VendorProfileData>({
    companyName: '',
    businessType: '',
    experience: 0,
    skills: [],
    location: user?.location || '',
    phone: user?.phone || '',
    website: '',
    description: '',
    hourlyRate: 0,
    portfolio: [],
    documents: [],
    verified: false,
    avatar: (user as any)?.avatar || '',
  });

  const businessTypes = [
    'Individual Contractor',
    'Small Business (2-10 employees)',
    'Medium Business (11-50 employees)',
    'Large Business (50+ employees)',
    'Freelancer',
    'Consultant',
  ];

  const skillCategories = [
    'Home Renovation',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'Roofing',
    'Painting',
    'Flooring',
    'Carpentry',
    'Cleaning',
    'Web Development',
    'Graphic Design',
    'Marketing',
    'Consulting',
    'Other',
  ];

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Company and contact details' },
    {
      id: 2,
      title: 'Skills & Experience',
      description: 'Your expertise areas',
    },
    { id: 3, title: 'Portfolio', description: 'Showcase your work' },
    { id: 4, title: 'Review & Complete', description: 'Final review' },
  ];

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await vendorApi.getProfile();

        if (response.success && response.data) {
          const userData = response.data;
          const existingProfile = userData.vendorProfile;

          setProfileData((prev) => ({
            ...prev,
            // Load user basic info
            location: userData.location || user?.location || '',
            phone: userData.phone || user?.phone || '',
            avatar: userData.avatar || (user as any)?.avatar || '',
            // Load vendor profile info
            companyName: existingProfile?.companyName || '',
            businessType: existingProfile?.businessType || '',
            experience: existingProfile?.experience || 0,
            skills: existingProfile?.skills || [],
            description: existingProfile?.description || '',
            hourlyRate: existingProfile?.hourlyRate || 0,
            portfolio: existingProfile?.portfolio || [],
            documents: existingProfile?.documents || [],
            verified: existingProfile?.verified || false,
          }));
        } else {
          // Even if API fails, show user's basic info
          setProfileData((prev) => ({
            ...prev,
            location: user?.location || '',
            phone: user?.phone || '',
            avatar: (user as any)?.avatar || '',
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load existing profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleUploadPicture = async (file: File) => {
    try {
      setUploadingPicture(true);
      const response = await vendorApi.uploadProfilePicture(file);

      if (response.success) {
        toast.success('Profile picture uploaded successfully!');
        // Update local state with new avatar URL
        setProfileData((prev) => ({
          ...prev,
          avatar: response.data.avatar,
        }));
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

  const handleUploadPortfolio = async (files: File[]) => {
    try {
      setUploadingPortfolio(true);
      const response = await vendorApi.uploadPortfolioImages(files);

      if (response.success) {
        setProfileData((prev) => ({
          ...prev,
          portfolio: response.data.portfolio,
        }));
        toast.success('Portfolio images uploaded successfully!');
      } else {
        toast.error('Failed to upload portfolio images');
      }
    } catch (error) {
      console.error('Error uploading portfolio:', error);
      toast.error('Failed to upload portfolio images');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const response = await vendorApi.updateProfile({
        ...profileData,
        location: profileData.location,
        phone: profileData.phone,
      });

      if (response.success) {
        toast.success('Profile saved successfully!');
        navigate('/vendor/dashboard');
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              {/* Main Profile Picture - Using simple img instead of Avatar component */}
              <div className='relative mb-4'>
                {profileData.avatar ? (
                  <img
                    src={getImageUrl(profileData.avatar) || ''}
                    alt='Profile Picture'
                    className='w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-300 shadow-lg'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Show fallback
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback circle with initial */}
                <div
                  className={`w-24 h-24 rounded-full mx-auto border-4 border-gray-300 shadow-lg flex items-center justify-center text-2xl font-bold bg-gray-200 text-gray-600 ${
                    profileData.avatar ? 'hidden' : ''
                  }`}
                >
                  {user?.firstName?.charAt(0) || 'V'}
                </div>
              </div>

              <Button
                variant='outline'
                size='sm'
                className='mb-4'
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
                <Upload className='w-4 h-4 mr-2' />
                {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='companyName'>Company Name *</Label>
                <Input
                  id='companyName'
                  value={profileData.companyName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      companyName: e.target.value,
                    })
                  }
                  placeholder='Enter company name'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='businessType'>Business Type *</Label>
                <Select
                  value={profileData.businessType}
                  onValueChange={(value) =>
                    setProfileData({
                      ...profileData,
                      businessType: value,
                    })
                  }
                >
                  <SelectTrigger
                    className={
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }
                  >
                    <SelectValue placeholder='Select business type' />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number *</Label>
                <Input
                  id='phone'
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder='+1 (555) 123-4567'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='location'>Location *</Label>
                <Input
                  id='location'
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  placeholder='City, State'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Business Description *</Label>
              <Textarea
                id='description'
                value={profileData.description}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    description: e.target.value,
                  })
                }
                placeholder='Tell clients about your business...'
                rows={4}
                className={
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='experience'>Years of Experience *</Label>
                <Input
                  id='experience'
                  type='number'
                  value={profileData.experience}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      experience: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder='5'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='hourlyRate'>Hourly Rate (USD) *</Label>
                <Input
                  id='hourlyRate'
                  type='number'
                  value={profileData.hourlyRate}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      hourlyRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder='50'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <Label>Skills & Services *</Label>

              {/* Add new skill */}
              <div className='flex gap-2'>
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder='Add a skill...'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size='sm'>
                  <Plus className='w-4 h-4' />
                </Button>
              </div>

              {/* Selected skills */}
              <div className='flex flex-wrap gap-2'>
                {profileData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {skill}
                    <X
                      className='w-3 h-3 cursor-pointer hover:text-red-500'
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>

              {/* Quick add skills */}
              <div className='space-y-2'>
                <Label className='text-sm text-gray-500'>
                  Quick Add Skills:
                </Label>
                <div className='grid grid-cols-2 gap-2'>
                  {skillCategories.map((skill) => (
                    <label
                      key={skill}
                      className='flex items-center space-x-2 cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={profileData.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (!profileData.skills.includes(skill)) {
                              setProfileData((prev) => ({
                                ...prev,
                                skills: [...prev.skills, skill],
                              }));
                            }
                          } else {
                            removeSkill(skill);
                          }
                        }}
                        className='rounded'
                      />
                      <span
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='text-center py-8'>
              <div className='text-6xl mb-4'>📁</div>
              <p
                className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Upload your portfolio images
              </p>
              <Button
                variant='outline'
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = Array.from(
                      (e.target as HTMLInputElement).files || []
                    );
                    if (files.length > 0) {
                      handleUploadPortfolio(files);
                    }
                  };
                  input.click();
                }}
                disabled={uploadingPortfolio}
              >
                <Upload className='w-4 h-4 mr-2' />
                {uploadingPortfolio ? 'Uploading...' : 'Upload Images'}
              </Button>
            </div>

            {profileData.portfolio.length > 0 && (
              <div className='grid grid-cols-3 gap-4'>
                {profileData.portfolio.map((image, index) => {
                  // Convert relative URL to full URL if needed
                  const imageUrl = getImageUrl(image);

                  return (
                    <div
                      key={index}
                      className={`rounded-md aspect-square overflow-hidden ${
                        theme === 'dark'
                          ? 'bg-gray-700 border border-gray-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`Portfolio ${index + 1}`}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        } hidden`}
                      >
                        Portfolio {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <div className='text-6xl mb-4'>✅</div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Review Your Profile
              </h3>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Please review your information before completing the setup.
              </p>
            </div>

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
                  {profileData.companyName || 'Company Name'}
                </CardTitle>
                <p
                  className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {profileData.businessType || 'Business Type'}
                </p>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Location:
                    </p>
                    <p
                      className={`${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {profileData.location || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Phone:
                    </p>
                    <p
                      className={`${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {profileData.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Experience:
                    </p>
                    <p
                      className={`${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {profileData.experience} years
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Hourly Rate:
                    </p>
                    <p
                      className={`${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      ${profileData.hourlyRate}/hour
                    </p>
                  </div>
                </div>

                <div>
                  <p
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Skills:
                  </p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {profileData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant='secondary'
                        className='text-xs'
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Description:
                  </p>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {profileData.description || 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          profileData.companyName &&
          profileData.businessType &&
          profileData.phone &&
          profileData.location &&
          profileData.description
        );
      case 2:
        return (
          profileData.experience > 0 &&
          profileData.hourlyRate > 0 &&
          profileData.skills.length > 0
        );
      case 3:
        return true; // Portfolio is optional
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4'></div>
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

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className='max-w-4xl mx-auto p-6'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1
            className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Setup Your Vendor Profile
          </h1>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Complete your profile to start receiving job opportunities
          </p>
        </div>

        {/* Progress Steps */}
        <div className='flex justify-center mb-8'>
          <div className='flex items-center space-x-4'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.id
                      ? 'bg-emerald-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className='w-4 h-4' />
                  ) : (
                    step.id
                  )}
                </div>
                <div className='ml-2'>
                  <p
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-4 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card
          className={`${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex justify-between mt-6'>
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant='outline'
          >
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep} disabled={!isStepValid()}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSaveProfile}
              disabled={saving || !isStepValid()}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {saving ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfileSetup;
