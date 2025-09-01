import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload,
  ChevronRight,
  Calendar,
  Clock,
  X,
  ChevronDown,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import customerAPI from '@/config/customerApi';

interface JobFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: string;
  budgetType: 'FIXED' | 'RANGE' | 'NEGOTIABLE';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  timeline: string;
  date: string;
  time: string;
  additionalRequests: string;
  contactPreference: 'email' | 'phone' | 'both';
  requirements: string[];
  estimatedDuration: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isRemote: boolean;
  images: string[];
}

const JobPostingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isEditing = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [backendErrors, setBackendErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceCategories: Record<string, string[]> = {
    'Home Maintenance and Repairs': [
      'Plumbing',
      'Electrical Work',
      'HVAC Service',
      'Appliance Service',
      'General Handymen Service',
      'Roofing',
      'Painting',
      'Flooring',
    ],
    'Cleaning Services': [
      'Residential Cleaning',
      'Commercial Cleaning',
      'Window Cleaning',
      'Move-in/Move-out Cleaning',
      'Pest Control Services',
      'Carpet Cleaning',
      'Deep Cleaning',
    ],
    'Landscaping and Outdoor Services': [
      'Lawn Mowing and Maintenance',
      'Tree Trimming and Removal',
      'Garden Design and Installation',
      'Seasonal Cleanup',
      'Swimming Pool Cleaning and Maintenance',
      'Irrigation Systems',
      'Outdoor Lighting',
    ],
    'Home Renovation': [
      'Kitchen Remodeling',
      'Bathroom Remodeling',
      'Basement Finishing',
      'Room Additions',
      'Deck and Patio Construction',
      'Garage Conversion',
      'Whole House Renovation',
    ],
    'Other Services': [
      'Moving Services',
      'Interior Design',
      'Home Security',
      'Smart Home Installation',
      'Home Inspection',
      'Furniture Assembly',
      'Pet Services',
    ],
  };

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    budget: '',
    budgetType: 'FIXED',
    street: '',
    city: '',
    state: 'Illinois',
    zipCode: '',
    timeline: 'ASAP',
    date: '',
    time: '',
    additionalRequests: '',
    contactPreference: 'email',
    requirements: [],
    estimatedDuration: '',
    urgency: 'MEDIUM',
    priority: 'MEDIUM',
    isRemote: false,
    images: [],
  });

  // Create/Update job mutation
  const jobMutation = useMutation({
    mutationFn: (jobData: any) => {
      if (isEditing && id) {
        return customerAPI.updateJob(id, jobData);
      } else {
        return customerAPI.createJob(jobData);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing
          ? 'Job Updated Successfully!'
          : 'Job Posted Successfully!',
        description: isEditing
          ? 'Your job has been updated.'
          : 'Your job has been posted and is now visible to vendors.',
      });
      queryClient.invalidateQueries({ queryKey: ['customerJobs'] });
      setIsSubmitting(false);
      setBackendErrors({});
      navigate('/customer/jobs');
    },
    onError: (error: any) => {
      console.log('🔍 Full error object:', error);
      console.log('🔍 Error details:', error.details);
      console.log('🔍 Error message:', error.message);
      console.log('🔍 Error status:', error.statusCode);
      console.log('🔍 Error apiResponse:', error.apiResponse);

      // Clear previous errors
      setBackendErrors({});
      console.log('🔍 Cleared previous errors');

      // Parse backend validation errors - check multiple possible locations
      let errorDetails = null;

      if (error.details && Array.isArray(error.details)) {
        errorDetails = error.details;
        console.log('🔍 Found error.details:', errorDetails);
      } else if (
        error.apiResponse &&
        error.apiResponse.details &&
        Array.isArray(error.apiResponse.details)
      ) {
        errorDetails = error.apiResponse.details;
        console.log('🔍 Found error.apiResponse.details:', errorDetails);
      } else if (
        error.response &&
        error.response.details &&
        Array.isArray(error.response.details)
      ) {
        errorDetails = error.response.details;
        console.log('🔍 Found error.response.details:', errorDetails);
      }

      if (errorDetails) {
        const newErrors: { [key: string]: string } = {};

        errorDetails.forEach((detail: any) => {
          console.log('🔍 Processing error detail:', detail);
          if (detail.field && detail.message) {
            newErrors[detail.field] = detail.message;
            console.log(
              `🔍 Added error for field "${detail.field}": ${detail.message}`
            );
          }
        });

        console.log('🔍 Final newErrors object:', newErrors);
        setBackendErrors(newErrors);
        console.log('🔍 Backend validation errors set in state:', newErrors);
      } else {
        console.log('🔍 No error details found in any location');
        console.log('🔍 error.details type:', typeof error.details);
        console.log('🔍 error.details value:', error.details);
        console.log('🔍 error.apiResponse:', error.apiResponse);
      }

      // Show general error toast
      toast({
        title: 'Job Submission Failed',
        description:
          'Please fix the validation errors shown below and try again.',
        variant: 'destructive',
        duration: 5000,
      });

      setIsSubmitting(false);
      console.log('🔍 Set isSubmitting to false');
    },
  });

  // Load existing job data for editing
  useEffect(() => {
    if (id && isEditing) {
      // Load job data from API
      customerAPI.getJobById(id).then((job) => {
        if (job) {
          setFormData({
            title: job.title || '',
            description: job.description || '',
            category: job.category || '',
            subcategory: job.subcategory || '',
            budget: job.budget?.toString() || '',
            budgetType: job.budgetType || 'FIXED',
            street: job.street || '',
            city: job.city || '',
            state: job.state || 'Illinois',
            zipCode: job.zipCode || '',
            timeline: job.timeline || 'ASAP',
            date: job.date || '',
            time: job.time || '',
            additionalRequests: job.additionalRequests || '',
            contactPreference: job.contactPreference || 'email',
            requirements: job.requirements || [],
            estimatedDuration: job.estimatedDuration || '',
            urgency: job.urgency || 'MEDIUM',
            priority: job.priority || 'MEDIUM',
            isRemote: job.isRemote || false,
            images: job.images || [],
          });
        }
      });
    }
  }, [id, isEditing]);

  const handleChange = (field: keyof JobFormData, value: any) => {
    setFormData((prevData) => {
      const newData = { ...prevData, [field]: value };
      console.log('🔍 After update - newData:', newData);
      return newData;
    });

    // Force a re-render by updating a different field temporarily
    setTimeout(() => {
      console.log('🔍 After timeout - current formData:', formData);
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + images.length > 5) {
        toast({
          title: 'Maximum 5 images allowed',
          description: 'Please select fewer images',
          variant: 'destructive',
        });
        return;
      }
      const newUrls = filesArray.map((file) => URL.createObjectURL(file));
      setImages([...images, ...filesArray]);
      setImageUrls([...imageUrls, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages(images.filter((_, i) => i !== index));
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !formData.requirements.includes(newRequirement.trim())
    ) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.category && formData.description);
      case 2:
        return !!(formData.street && formData.city && formData.zipCode);
      case 3:
        return !!(formData.budget || formData.budgetType === 'NEGOTIABLE');
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields before proceeding',
        variant: 'destructive',
      });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 1) {
      navigate('/customer/jobs');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Clear previous backend errors
    setBackendErrors({});
    setIsSubmitting(true);

    // Pre-submission validation and data cleaning
    const validationErrors = [];

    // Check required fields
    if (!formData.title?.trim()) validationErrors.push('Job title is required');
    if (!formData.description?.trim())
      validationErrors.push('Job description is required');
    if (!formData.category)
      validationErrors.push('Service category is required');
    if (!formData.street?.trim())
      validationErrors.push('Street address is required');
    if (!formData.city?.trim()) validationErrors.push('City is required');
    if (!formData.zipCode?.trim())
      validationErrors.push('ZIP code is required');

    // Check data types and formats
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      validationErrors.push('Budget must be a valid number');
    }

    // Check date validation when timeline is "Specific date"
    if (formData.timeline === 'Specific date') {
      if (!formData.date || formData.date.trim() === '') {
        validationErrors.push(
          'Preferred date is required when selecting specific date'
        );
      } else {
        // Validate date format
        const selectedDate = new Date(formData.date);
        if (isNaN(selectedDate.getTime())) {
          validationErrors.push('Please select a valid date');
        }
        // Check if date is in the past
        if (selectedDate < new Date()) {
          validationErrors.push('Preferred date cannot be in the past');
        }
      }
    }

    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Errors',
        description: validationErrors.join('\n'),
        variant: 'destructive',
        duration: 8000,
      });
      setIsSubmitting(false);
      return;
    }

    // Create clean job data without date/time fields initially
    const jobData: any = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      budgetType: formData.budgetType,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      timeline: formData.timeline,
      additionalRequests: formData.additionalRequests,
      contactPreference: formData.contactPreference,
      requirements: formData.requirements,
      estimatedDuration: formData.estimatedDuration,
      urgency: formData.urgency,
      priority: formData.priority,
      isRemote: formData.isRemote,
      customerId: user?.id,
      location: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      tags: formData.subcategory
        ? [formData.category, formData.subcategory]
        : [formData.category],
      images: imageUrls,
    };

    // Only add date and time if timeline is "Specific date" and they have values
    if (
      formData.timeline === 'Specific date' &&
      formData.date &&
      formData.date.trim()
    ) {
      jobData.date = formData.date;
      if (formData.time && formData.time.trim()) {
        jobData.time = formData.time;
      }
    }

    console.log('🔍 Submitting job data:', jobData);
    console.log('🔍 Tags array:', jobData.tags);
    console.log('🔍 Date and time fields:', {
      timeline: formData.timeline,
      date: jobData.date,
      time: jobData.time,
      hasDate: 'date' in jobData,
      hasTime: 'time' in jobData,
    });

    jobMutation.mutate(jobData);
  };

  const getStepStatus = (step: number) => {
    if (currentStep > step) return 'completed';
    if (currentStep === step) return 'current';
    return 'pending';
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/customer/jobs')}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Jobs
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              {isEditing ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              Tell us what you need and get quotes from qualified professionals
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className='mb-8'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center space-x-8'>
            {[
              { number: 1, title: 'Job Details' },
              { number: 2, title: 'Location' },
              { number: 3, title: 'Budget & Timeline' },
              { number: 4, title: 'Additional Info' },
            ].map((step) => (
              <div key={step.number} className='flex items-center'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    getStepStatus(step.number) === 'completed'
                      ? 'bg-green-500 text-white'
                      : getStepStatus(step.number) === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getStepStatus(step.number) === 'completed' ? (
                    <CheckCircle className='h-5 w-5' />
                  ) : (
                    step.number
                  )}
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {step.title}
                  </p>
                </div>
                {step.number < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      getStepStatus(step.number) === 'completed'
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className='max-w-4xl mx-auto'>
        <CardContent className='p-6'>
          {/* Step 1: Job Details */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              <div>
                <Label htmlFor='title' className='text-base font-medium'>
                  Job Title *
                </Label>
                <Input
                  id='title'
                  placeholder='e.g., Kitchen Renovation, Plumbing Repair'
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className='mt-2'
                />
              </div>

              <div>
                <Label htmlFor='category' className='text-base font-medium'>
                  Service Category *
                </Label>

                {/* Working HTML select with UI styling */}
                <div className='relative mt-2'>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      console.log('🔍 Category selected:', e.target.value);
                      handleChange('category', e.target.value);
                      handleChange('subcategory', '');
                    }}
                    className='w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer'
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value=''>Select a category</option>
                    {Object.keys(serviceCategories).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.category && (
                <div>
                  <Label
                    htmlFor='subcategory'
                    className='text-base font-medium'
                  >
                    Service Type
                  </Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) =>
                      handleChange('subcategory', value)
                    }
                  >
                    <SelectTrigger className='mt-2'>
                      <SelectValue placeholder='Select a service type' />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories[formData.category]?.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor='description' className='text-base font-medium'>
                  Job Description *
                </Label>
                <Textarea
                  id='description'
                  placeholder='Describe what you need in detail...'
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className='mt-2 min-h-[120px]'
                />
              </div>

              <div>
                <Label className='text-base font-medium'>Requirements</Label>
                <div className='mt-2 space-y-2'>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <Badge variant='secondary' className='flex-1'>
                        {req}
                      </Badge>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeRequirement(index)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                  <div className='flex space-x-2'>
                    <Input
                      placeholder='Add a requirement...'
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button onClick={addRequirement} variant='outline'>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='street' className='text-base font-medium'>
                    Street Address *
                  </Label>
                  <Input
                    id='street'
                    placeholder='123 Main St'
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className='mt-2'
                  />
                </div>
                <div>
                  <Label htmlFor='city' className='text-base font-medium'>
                    City *
                  </Label>
                  <Input
                    id='city'
                    placeholder='Chicago'
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className='mt-2'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='state' className='text-base font-medium'>
                    State
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleChange('state', value)}
                  >
                    <SelectTrigger className='mt-2'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Illinois'>Illinois</SelectItem>
                      <SelectItem value='Indiana'>Indiana</SelectItem>
                      <SelectItem value='Michigan'>Michigan</SelectItem>
                      <SelectItem value='Wisconsin'>Wisconsin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='zipCode' className='text-base font-medium'>
                    ZIP Code *
                  </Label>
                  <Input
                    id='zipCode'
                    placeholder='60601'
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className='mt-2'
                  />
                </div>
                <div className='flex items-center space-x-2 mt-8'>
                  <Checkbox
                    id='isRemote'
                    checked={formData.isRemote}
                    onCheckedChange={(checked) =>
                      handleChange('isRemote', checked)
                    }
                  />
                  <Label htmlFor='isRemote'>Remote work possible</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Timeline */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              <div>
                <Label className='text-base font-medium'>Budget Type *</Label>
                <div className='mt-2 space-y-2'>
                  {[
                    { value: 'FIXED', label: 'Fixed Price' },
                    { value: 'RANGE', label: 'Price Range' },
                    { value: 'NEGOTIABLE', label: 'Negotiable' },
                  ].map((type) => (
                    <div
                      key={type.value}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='radio'
                        id={type.value}
                        name='budgetType'
                        value={type.value}
                        checked={formData.budgetType === type.value}
                        onChange={(e) =>
                          handleChange('budgetType', e.target.value)
                        }
                      />
                      <Label htmlFor={type.value}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.budgetType !== 'NEGOTIABLE' && (
                <div>
                  <Label htmlFor='budget' className='text-base font-medium'>
                    Budget{' '}
                    {formData.budgetType === 'RANGE' ? 'Range' : 'Amount'} *
                  </Label>
                  <Input
                    id='budget'
                    type='number'
                    placeholder={
                      formData.budgetType === 'RANGE'
                        ? 'e.g., 1000-2000'
                        : 'e.g., 1500'
                    }
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className='mt-2'
                  />
                </div>
              )}

              <div>
                <Label htmlFor='timeline' className='text-base font-medium'>
                  Timeline
                </Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => handleChange('timeline', value)}
                >
                  <SelectTrigger className='mt-2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ASAP'>ASAP</SelectItem>
                    <SelectItem value='Within a week'>Within a week</SelectItem>
                    <SelectItem value='Within a month'>
                      Within a month
                    </SelectItem>
                    <SelectItem value='Flexible'>Flexible</SelectItem>
                    <SelectItem value='Specific date'>Specific date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.timeline === 'Specific date' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='date' className='text-base font-medium'>
                      Preferred Date
                    </Label>
                    <Input
                      id='date'
                      type='date'
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className='mt-2'
                    />
                  </div>
                  <div>
                    <Label htmlFor='time' className='text-base font-medium'>
                      Preferred Time
                    </Label>
                    <Input
                      id='time'
                      type='time'
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className='mt-2'
                    />
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='estimatedDuration'
                    className='text-base font-medium'
                  >
                    Estimated Duration
                  </Label>
                  <Select
                    value={formData.estimatedDuration}
                    onValueChange={(value) =>
                      handleChange('estimatedDuration', value)
                    }
                  >
                    <SelectTrigger className='mt-2'>
                      <SelectValue placeholder='Select duration' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1-2 days'>1-2 days</SelectItem>
                      <SelectItem value='3-5 days'>3-5 days</SelectItem>
                      <SelectItem value='1-2 weeks'>1-2 weeks</SelectItem>
                      <SelectItem value='1-2 months'>1-2 months</SelectItem>
                      <SelectItem value='3+ months'>3+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='urgency' className='text-base font-medium'>
                    Urgency Level
                  </Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) => handleChange('urgency', value)}
                  >
                    <SelectTrigger className='mt-2'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='LOW'>Low</SelectItem>
                      <SelectItem value='MEDIUM'>Medium</SelectItem>
                      <SelectItem value='HIGH'>High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {currentStep === 4 && (
            <div className='space-y-6'>
              <div>
                <Label
                  htmlFor='additionalRequests'
                  className='text-base font-medium'
                >
                  Additional Requests or Special Instructions
                </Label>
                <Textarea
                  id='additionalRequests'
                  placeholder='Any special requirements, preferences, or additional information...'
                  value={formData.additionalRequests}
                  onChange={(e) =>
                    handleChange('additionalRequests', e.target.value)
                  }
                  className='mt-2 min-h-[100px]'
                />
              </div>

              <div>
                <Label className='text-base font-medium'>
                  Contact Preference
                </Label>
                <div className='mt-2 space-y-2'>
                  {[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'both', label: 'Both' },
                  ].map((pref) => (
                    <div
                      key={pref.value}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='radio'
                        id={pref.value}
                        name='contactPreference'
                        value={pref.value}
                        checked={formData.contactPreference === pref.value}
                        onChange={(e) =>
                          handleChange('contactPreference', e.target.value)
                        }
                      />
                      <Label htmlFor={pref.value}>{pref.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className='text-base font-medium'>
                  Images (Optional)
                </Label>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  Upload up to 5 images to help vendors understand your project
                  better
                </p>
                <div className='mt-2'>
                  <Input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                    id='image-upload'
                  />
                  <Label
                    htmlFor='image-upload'
                    className='cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    Choose Images
                  </Label>
                </div>
                {imageUrls.length > 0 && (
                  <div className='mt-4 grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {imageUrls.map((url, index) => (
                      <div key={index} className='relative'>
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className='w-full h-24 object-cover rounded-lg'
                        />
                        <Button
                          variant='destructive'
                          size='sm'
                          className='absolute top-1 right-1 w-6 h-6 p-0'
                          onClick={() => removeImage(index)}
                        >
                          <X className='h-3 w-3' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backend Validation Errors Display */}
          {Object.keys(backendErrors).length > 0 && (
            <div className='px-6 pb-4'>
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                <div className='flex items-start space-x-3'>
                  <AlertCircle className='h-5 w-5 text-red-500 mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <h3 className='text-sm font-medium text-red-800 dark:text-red-200'>
                      Please fix the following validation errors:
                    </h3>
                    <div className='mt-2 space-y-1'>
                      {Object.entries(backendErrors).map(([field, message]) => {
                        // Convert field names to user-friendly labels
                        const fieldLabels: { [key: string]: string } = {
                          budget: 'Budget',
                          date: 'Date',
                          title: 'Job Title',
                          description: 'Job Description',
                          category: 'Service Category',
                          street: 'Street Address',
                          city: 'City',
                          zipCode: 'ZIP Code',
                          timeline: 'Timeline',
                          requirements: 'Requirements',
                        };

                        const fieldLabel = fieldLabels[field] || field;
                        return (
                          <div
                            key={field}
                            className='text-sm text-red-700 dark:text-red-300'
                          >
                            <span className='font-medium'>• {fieldLabel}:</span>{' '}
                            {message}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-between p-6'>
          <Button
            variant='outline'
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <Button
            onClick={handleNextStep}
            disabled={jobMutation.isPending || isSubmitting}
            className='ml-auto'
          >
            {jobMutation.isPending || isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                {isEditing ? 'Updating...' : 'Posting...'}
              </>
            ) : currentStep === 4 ? (
              isEditing ? (
                'Update Job'
              ) : (
                'Post Job'
              )
            ) : (
              <>
                Next
                <ChevronRight className='h-4 w-4 ml-2' />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobPostingForm;
