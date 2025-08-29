import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
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
} from 'lucide-react';

const VendorProfileManagement = () => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock vendor data - in real app this would come from API/context
  const [vendorData, setVendorData] = useState({
    name: 'Michael Anderson',
    company: 'Anderson Home Services',
    email: 'michael@andersonhomes.com',
    phone: '+1 (555) 123-4567',
    website: 'www.andersonhomes.com',
    location: 'Chicago, IL',
    address: '123 Business Ave, Chicago, IL 60601',
    category: 'Home Renovation',
    subcategories: [
      'Kitchen Remodeling',
      'Bathroom Renovation',
      'Custom Cabinetry',
    ],
    experience: '12',
    description:
      'Specializing in custom home renovations with a focus on kitchen and bathroom remodeling. Licensed contractor with over a decade of experience delivering high-quality craftsmanship.',
    services: [
      'Kitchen Remodeling',
      'Bathroom Renovation',
      'Custom Cabinetry',
      'Flooring Installation',
      'Painting Services',
      'Electrical Work',
    ],
    certifications: ['Licensed Contractor', 'EPA Certified', 'OSHA Trained'],
    insurance: 'Yes',
    availability: 'Available',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  });

  const serviceCategories = [
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
    'Other',
  ];

  const subcategories = {
    'Home Renovation': [
      'Kitchen Remodeling',
      'Bathroom Renovation',
      'Basement Finishing',
      'Room Addition',
    ],
    Plumbing: [
      'Pipe Repair',
      'Fixture Installation',
      'Drain Cleaning',
      'Water Heater',
    ],
    Electrical: [
      'Wiring',
      'Panel Upgrade',
      'Lighting Installation',
      'Outlet Repair',
    ],
    HVAC: ['AC Installation', 'Heating Repair', 'Duct Cleaning', 'Thermostat'],
    Landscaping: ['Lawn Care', 'Garden Design', 'Tree Service', 'Irrigation'],
    Roofing: [
      'Shingle Replacement',
      'Roof Repair',
      'Gutter Installation',
      'Skylight',
    ],
    Painting: [
      'Interior Painting',
      'Exterior Painting',
      'Cabinet Painting',
      'Wallpaper',
    ],
    Flooring: [
      'Hardwood Installation',
      'Tile Installation',
      'Carpet Installation',
      'Laminate',
    ],
    Carpentry: [
      'Custom Furniture',
      'Deck Building',
      'Fence Installation',
      'Trim Work',
    ],
    Cleaning: [
      'House Cleaning',
      'Deep Cleaning',
      'Move-in/out Cleaning',
      'Carpet Cleaning',
    ],
    Other: ['Custom Service'],
  };

  const handleInputChange = (field: string, value: string) => {
    setVendorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceToggle = (service: string) => {
    setVendorData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsEditing(false);
    setSaving(false);
    // In real app, show success toast
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
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
          Profile Management
        </h1>
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Manage your profile information and business details
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column - Profile Overview */}
        <div className='lg:col-span-1'>
          <Card
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-6`}
          >
            <CardHeader className='text-center'>
              <div className='relative inline-block'>
                <Avatar className='h-24 w-24 mx-auto border-4 border-bojj-primary'>
                  <AvatarImage
                    src={vendorData.avatarUrl}
                    alt={vendorData.name}
                  />
                  <AvatarFallback className='text-2xl'>
                    {vendorData.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0'
                  >
                    <Camera className='h-4 w-4' />
                  </Button>
                )}
              </div>
              <CardTitle
                className={`mt-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {vendorData.name}
              </CardTitle>
              <CardDescription
                className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
              >
                {vendorData.company}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Star className='h-4 w-4 text-yellow-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    4.8 Rating (127 reviews)
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Briefcase className='h-4 w-4 text-blue-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {vendorData.experience} years experience
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Award className='h-4 w-4 text-green-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {vendorData.certifications.length} certifications
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle
                className={`text-lg ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Jobs Completed
                </span>
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  243
                </span>
              </div>
              <div className='flex justify-between'>
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Response Rate
                </span>
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  98%
                </span>
              </div>
              <div className='flex justify-between'>
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Avg. Response Time
                </span>
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  2 hours
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Editable Form */}
        <div className='lg:col-span-2'>
          <Card className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Business Information
                </CardTitle>
                <CardDescription
                  className={
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }
                >
                  Update your business details and service offerings
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleCancel} variant='outline'>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className='mr-2 h-4 w-4' />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    value={vendorData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='company'>Company Name</Label>
                  <Input
                    id='company'
                    value={vendorData.company}
                    onChange={(e) =>
                      handleInputChange('company', e.target.value)
                    }
                    disabled={!isEditing}
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={vendorData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='phone'>Phone</Label>
                  <Input
                    id='phone'
                    value={vendorData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='website'>Website</Label>
                  <Input
                    id='website'
                    value={vendorData.website}
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    disabled={!isEditing}
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='experience'>Years of Experience</Label>
                  <Input
                    id='experience'
                    value={vendorData.experience}
                    onChange={(e) =>
                      handleInputChange('experience', e.target.value)
                    }
                    disabled={!isEditing}
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor='address'>Business Address</Label>
                <Input
                  id='address'
                  value={vendorData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  className={
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                  }
                />
              </div>

              {/* Service Category */}
              <div>
                <Label htmlFor='category'>Primary Service Category</Label>
                <Select
                  value={vendorData.category}
                  onValueChange={(value) =>
                    handleInputChange('category', value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    className={
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                    }
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Services Offered */}
              <div>
                <Label>Services Offered</Label>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
                  {subcategories[
                    vendorData.category as keyof typeof subcategories
                  ]?.map((service) => (
                    <div key={service} className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id={service}
                        checked={vendorData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        disabled={!isEditing}
                        className='rounded border-gray-300'
                      />
                      <Label htmlFor={service} className='text-sm'>
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor='description'>Business Description</Label>
                <Textarea
                  id='description'
                  value={vendorData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  disabled={!isEditing}
                  rows={4}
                  className={
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
                  }
                />
              </div>

              {/* Certifications */}
              <div>
                <Label>Certifications & Insurance</Label>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {vendorData.certifications.map((cert, index) => (
                    <Badge key={index} variant='outline' className='text-sm'>
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileManagement;
