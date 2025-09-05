import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

const VendorProfileSetup = () => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    companyName: '',
    businessType: '',
    phone: '',
    location: '',
    description: '',
    skills: [] as string[],
  });

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
  ];

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='h-24 w-24 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
                V
              </div>
              <Button variant='outline' size='sm'>
                📷 Upload Photo
              </Button>
            </div>
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
                  value={profileData.companyName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      companyName: e.target.value,
                    })
                  }
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
                  value={profileData.businessType}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      businessType: e.target.value,
                    })
                  }
                >
                  <option value=''>Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
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
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
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
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
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
                value={profileData.description}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    description: e.target.value,
                  })
                }
                placeholder='Tell clients about your business...'
                rows={4}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Years of Experience</label>
              <input
                className='w-full p-2 border rounded'
                type='number'
                placeholder='5'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Hourly Rate (USD)</label>
              <input
                className='w-full p-2 border rounded'
                type='number'
                placeholder='50'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Skills & Services</label>
              <div className='grid grid-cols-2 gap-2'>
                {skillCategories.map((skill) => (
                  <label key={skill} className='flex items-center space-x-2'>
                    <input type='checkbox' />
                    <span className='text-sm'>{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className='space-y-4'>
            <div className='text-center py-8'>
              <div className='text-6xl mb-4'>📁</div>
              <p className='text-gray-500 mb-4'>Upload your portfolio images</p>
              <Button variant='outline'>📤 Upload Images</Button>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='bg-gray-200 rounded-md aspect-square flex items-center justify-center'>
                <span className='text-gray-500'>Image 1</span>
              </div>
              <div className='bg-gray-200 rounded-md aspect-square flex items-center justify-center'>
                <span className='text-gray-500'>Image 2</span>
              </div>
              <div className='bg-gray-200 rounded-md aspect-square flex items-center justify-center'>
                <span className='text-gray-500'>Image 3</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-6xl mb-4'>✅</div>
              <h3 className='text-xl font-semibold mb-2'>
                Profile Setup Complete!
              </h3>
              <p className='text-gray-600'>
                Your vendor profile has been created successfully. You can now
                start receiving job opportunities.
              </p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-semibold mb-2'>Profile Summary:</h4>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Company: {profileData.companyName || 'Not provided'}</li>
                <li>
                  • Business Type: {profileData.businessType || 'Not provided'}
                </li>
                <li>• Location: {profileData.location || 'Not provided'}</li>
                <li>• Phone: {profileData.phone || 'Not provided'}</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                <div className='ml-2'>
                  <p className='text-sm font-medium'>{step.title}</p>
                  <p className='text-xs text-gray-500'>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className='w-8 h-0.5 bg-gray-200 mx-4'></div>
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
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button className='bg-emerald-600 hover:bg-emerald-700'>
              Finish Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfileSetup;
