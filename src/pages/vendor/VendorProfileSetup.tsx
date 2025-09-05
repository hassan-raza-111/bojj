import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Save,
  Edit,
  Star,
  Briefcase,
  Award,
  CheckCircle,
  Upload,
  Building,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

interface VendorProfileData {
  companyName: string;
  businessType: string;
  experience: number;
  skills: string[];
  location: string;
  phone: string;
  website?: string;
  description: string;
  hourlyRate?: number;
  portfolio: string[];
  documents: string[];
  verified: boolean;
}

const VendorProfileSetup = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState('');

  // Initialize with user data or empty state
  const [profileData, setProfileData] = useState<VendorProfileData>({
    companyName: (user as any)?.vendorProfile?.companyName || '',
    businessType: (user as any)?.vendorProfile?.businessType || '',
    experience: (user as any)?.vendorProfile?.experience || 0,
    skills: (user as any)?.vendorProfile?.skills || [],
    location: user?.location || '',
    phone: user?.phone || '',
    website: '',
    description: '',
    hourlyRate: 0,
    portfolio: [],
    documents: [],
    verified: (user as any)?.vendorProfile?.verified || false,
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

  const handleInputChange = (field: keyof VendorProfileData, value: any) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would make API call to save profile
      // await vendorApi.updateProfile(profileData);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      navigate('/vendor');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          <div className='space-y-6'>
            <div className='text-center'>
              <Avatar className='h-24 w-24 mx-auto mb-4'>
                <AvatarImage src={(user as any)?.profilePicture} />
                <AvatarFallback className='text-2xl'>
                  {user?.firstName?.charAt(0) || 'V'}
                </AvatarFallback>
              </Avatar>
              <Button variant='outline' size='sm'>
                <Camera className='mr-2 h-4 w-4' />
                Upload Photo
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='companyName'>Company Name *</Label>
                <Input
                  id='companyName'
                  value={profileData.companyName}
                  onChange={(e) =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder='Enter your company name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='businessType'>Business Type *</Label>
                <Select
                  value={profileData.businessType}
                  onValueChange={(value) =>
                    handleInputChange('businessType', value)
                  }
                >
                  <SelectTrigger>
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
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder='+1 (555) 123-4567'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='location'>Location *</Label>
                <Input
                  id='location'
                  value={profileData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  placeholder='City, State'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='website'>Website (Optional)</Label>
                <Input
                  id='website'
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder='www.yourwebsite.com'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='hourlyRate'>Hourly Rate (USD)</Label>
                <Input
                  id='hourlyRate'
                  type='number'
                  value={profileData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange('hourlyRate', Number(e.target.value))
                  }
                  placeholder='50'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Business Description *</Label>
              <Textarea
                id='description'
                value={profileData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Tell clients about your business, experience, and what makes you unique...'
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='experience'>Years of Experience *</Label>
                <Input
                  id='experience'
                  type='number'
                  value={profileData.experience}
                  onChange={(e) =>
                    handleInputChange('experience', Number(e.target.value))
                  }
                  placeholder='5'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <Label>Skills & Services *</Label>
              <div className='flex gap-2'>
                <Select value={newSkill} onValueChange={setNewSkill}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Select a skill' />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addSkill} disabled={!newSkill}>
                  Add
                </Button>
              </div>

              <div className='flex flex-wrap gap-2'>
                {profileData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className='ml-1 hover:text-red-500'
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='text-center py-8'>
              <Upload className='h-12 w-12 mx-auto text-gray-400 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Portfolio Upload</h3>
              <p className='text-gray-500 mb-4'>
                Upload images of your previous work to showcase your skills
              </p>
              <Button variant='outline'>
                <Upload className='mr-2 h-4 w-4' />
                Upload Images
              </Button>
            </div>

            <div className='text-center py-8'>
              <Building className='h-12 w-12 mx-auto text-gray-400 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Documents</h3>
              <p className='text-gray-500 mb-4'>
                Upload certifications, licenses, and insurance documents
              </p>
              <Button variant='outline'>
                <Upload className='mr-2 h-4 w-4' />
                Upload Documents
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-8'>
              <CheckCircle className='h-16 w-16 mx-auto text-green-500 mb-4' />
              <h3 className='text-2xl font-bold mb-2'>Profile Complete!</h3>
              <p className='text-gray-500'>
                Review your information before publishing your profile
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium'>Company Name</Label>
                    <p className='text-sm text-gray-600'>
                      {profileData.companyName}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>Business Type</Label>
                    <p className='text-sm text-gray-600'>
                      {profileData.businessType}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>Experience</Label>
                    <p className='text-sm text-gray-600'>
                      {profileData.experience} years
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>Location</Label>
                    <p className='text-sm text-gray-600'>
                      {profileData.location}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>Phone</Label>
                    <p className='text-sm text-gray-600'>{profileData.phone}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>Hourly Rate</Label>
                    <p className='text-sm text-gray-600'>
                      ${profileData.hourlyRate}/hour
                    </p>
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium'>Skills</Label>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {profileData.skills.map((skill) => (
                      <Badge key={skill} variant='secondary'>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium'>Description</Label>
                  <p className='text-sm text-gray-600 mt-2'>
                    {profileData.description}
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

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className='max-w-4xl mx-auto p-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Complete Your Profile</h1>
          <p className='text-gray-600'>
            Set up your vendor profile to start getting jobs
          </p>
        </div>

        {/* Progress Steps */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className='h-5 w-5' />
                  ) : (
                    <span className='text-sm font-medium'>{step.id}</span>
                  )}
                </div>
                <div className='ml-3'>
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? 'text-emerald-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className='text-xs text-gray-500'>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className='p-8'>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex justify-between mt-8'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className='flex gap-2'>
            {currentStep < steps.length ? (
              <Button onClick={nextStep}>Next Step</Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileSetup;
