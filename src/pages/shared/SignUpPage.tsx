import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/api';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'customer';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [serviceTypesList, setServiceTypesList] = useState<string[]>([]);

  // Fetch cities and service types on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch UK cities
        const citiesResponse = await fetch(
          `${API_CONFIG.BASE_URL}/api/data/uk-cities`
        );
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          setCities(citiesData.data.cities);
        }

        // Fetch service types
        const serviceTypesResponse = await fetch(
          `${API_CONFIG.BASE_URL}/api/data/service-types`
        );
        if (serviceTypesResponse.ok) {
          const serviceTypesData = await serviceTypesResponse.json();
          setServiceTypesList(serviceTypesData.data.serviceTypes);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: 'Terms and Conditions',
        description: 'Please accept the Terms and Conditions to proceed.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Validation
      if (!city) {
        toast({
          title: 'City Required',
          description: 'Please select your city.',
          variant: 'destructive',
        });
        return;
      }

      if (userType === 'vendor' && serviceTypes.length === 0) {
        toast({
          title: 'Service Types Required',
          description: 'Please select at least one service type.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare user data for backend
      const userData = {
        email,
        password,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || 'User',
        role: userType.toUpperCase(),
        phone: phoneNumber,
        city: city,
        bio:
          userType === 'vendor'
            ? `Service Category: ${category}, Experience: ${experienceLevel}`
            : undefined,
        location: '', // Can be added later
        // Vendor-specific data
        ...(userType === 'vendor' && {
          businessName: businessName || undefined,
          serviceTypes: serviceTypes,
          experienceLevel: experienceLevel,
        }),
      };

      // Backend API Registration
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast({
        title: 'Registration successful!',
        description:
          'Your account has been created successfully. Please sign in.',
      });

      // Store additional vendor info if needed
      if (userType === 'vendor' && businessName) {
        localStorage.setItem('businessName', businessName);
      }

      // Redirect to login page
      navigate(`/login?type=${userType}`);
    } catch (err: any) {
      toast({
        title: 'Sign up failed',
        description: err.message || 'An error occurred during sign up.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const serviceCategories = [
    'Home Renovation',
    'Plumbing',
    'Electrical',
    'Landscaping',
    'Cleaning',
    'Painting',
    'Carpentry',
    'HVAC',
    'Roofing',
    'Other',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-white dark:bg-gray-950">
      <>
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-center mb-4">
              {userType === 'vendor'
                ? 'Join venbid as a Verified Vendor'
                : 'Create Your Customer Account'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {userType === 'vendor' && (
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              {/* City Selection - Required for both customers and vendors */}
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={city} onValueChange={setCity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {cities.map((cityName) => (
                        <SelectItem key={cityName} value={cityName}>
                          {cityName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {userType === 'vendor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Service Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {serviceCategories.map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Types Selection - Required for vendors */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceTypes">
                      Service Types * (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {serviceTypesList.map((serviceType) => (
                        <div
                          key={serviceType}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={serviceType}
                            value={serviceType}
                            checked={serviceTypes.includes(serviceType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiceTypes([...serviceTypes, serviceType]);
                              } else {
                                setServiceTypes(
                                  serviceTypes.filter(
                                    (type) => type !== serviceType
                                  )
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={serviceType} className="text-sm">
                            {serviceType}
                          </label>
                        </div>
                      ))}
                    </div>
                    {serviceTypes.length === 0 && (
                      <p className="text-sm text-red-500">
                        Please select at least one service type
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Experience Level</Label>
                    <RadioGroup
                      value={experienceLevel}
                      onValueChange={setExperienceLevel}
                      className="flex justify-between"
                    >
                      {['Beginner', 'Intermediate', 'Expert'].map((level) => (
                        <div
                          key={level}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={level} id={level} />
                          <Label htmlFor={level}>{level}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to venbid's{' '}
                  <Link
                    to="/terms"
                    className="text-venbid-primary hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link
                to={`/login?type=${userType}`}
                className="text-venbid-primary hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </>
    </div>
  );
};

export default SignUpPage;
