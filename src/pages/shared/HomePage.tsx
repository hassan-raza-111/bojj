import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
} from 'lucide-react';
// import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';
import AuthPromptModal from '@/components/shared/AuthPromptModal';
import { useAuth } from '@/hooks/useAuth';

const HomePage = () => {
  // Add new state variables for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentCarouselSlide, setCurrentCarouselSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  // Add these new state variables at the top with other state declarations
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  // const userRole = localStorage.getItem("userRole");

  const { isAuthenticated, user } = useAuth();
  const isVendor = user?.role === 'VENDOR';
  const isCustomer = user?.role === 'CUSTOMER';

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Update current slide when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onChange = () => {
      setCurrentCarouselSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onChange);

    // Get initial position
    onChange();

    // Cleanup
    return () => {
      carouselApi.off('select', onChange);
    };
  }, [carouselApi]);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselApi]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Search initiated',
      description: `Searching for ${service} services in ${
        location || 'your area'
      }`,
    });
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const howItWorks = [
    {
      step: 1,
      title: 'Post Your Job',
      description: 'Describe your task & set your budget',
    },
    {
      step: 2,
      title: 'Get Bids',
      description: 'Vendors will send you offers quickly',
    },
    {
      step: 3,
      title: 'Compare & Choose',
      description: 'Pick the best offer that fits your needs',
    },
    {
      step: 4,
      title: 'Get It Done',
      description: 'The vendor completes the job to your satisfaction',
    },
    {
      step: 5,
      title: 'Pay Securely',
      description: 'Secure payment process',
    },
  ];

  const testimonials = [
    {
      quote:
        'Found an amazing contractor within hours. The whole process was seamless.',
      name: 'Sarah Johnson',
      role: 'Customer',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      location: 'New York, NY',
    },
    {
      quote:
        "Bojj has transformed my business. I'm getting new clients every week now.",
      name: 'Michael Williams',
      role: 'Vendor',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'Seattle, WA',
    },
    {
      quote:
        'I needed a plumber urgently and found one within an hour. Amazing service!',
      name: 'Emma Rodriguez',
      role: 'Customer',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/63.jpg',
      location: 'Austin, TX',
    },
    {
      quote:
        'As a small business owner, Bojj has helped me reach more clients than I ever could before.',
      name: 'David Chen',
      role: 'Vendor',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/men/11.jpg',
      location: 'Chicago, IL',
    },
    {
      quote:
        'The quality of professionals on this platform is outstanding. Very satisfied!',
      name: 'Olivia Thompson',
      role: 'Customer',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/26.jpg',
      location: 'Denver, CO',
    },
    {
      quote:
        "I've been able to grow my landscaping company by 40% since joining Bojj last year.",
      name: 'James Wilson',
      role: 'Vendor',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
      location: 'Portland, OR',
    },
  ];

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={16}
          className={
            index < rating
              ? 'fill-bojj-primary text-bojj-primary'
              : 'text-gray-300'
          }
        />
      ));
  };

  // function handleSendOTP(event: React.MouseEvent<HTMLButtonElement>): void {
  //   throw new Error("Function not implemented.");
  // }

  const serviceCategories = {
    'Home Maintenance and Repairs': [
      'Plumbing',
      'Electrical Work',
      'HVAC Service',
      'Appliance Service',
      'General Handymen Service',
    ],
    'Cleaning Services': [
      'Residential Cleaning',
      'Commercial Cleaning',
      'Window Cleaning',
      'Move-in/Move-out Cleaning',
      'Pest Control Services',
    ],
    'Landscaping and Outdoor Services': [
      'Lawn Mowing and Maintenance',
      'Tree Trimming and Removal',
      'Garden Design and Installation',
      'Seasonal Cleanup',
      'Swimming Pool Cleaning and Maintenance',
    ],
    'Other Services': [
      'Moving Services',
      'Interior Design',
      'Home Security',
      'Smart Home Installation',
      'Home Inspection',
    ],
  };

  // const handleFormSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!isAuthenticated) {
  //     setIsModalOpen(true); // Show login modal
  //     return;
  //   }

  //   if (isVendor) {
  //     toast({
  //       title: "Access Denied",
  //       description: "Vendors cannot request services. Please log in as a customer.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (isCustomer) {
  //     // Proceed with form submission
  //     // Add your form submission logic here
  //     console.log("Form submitted successfully!");
  //   }
  // };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('this is the function of the HandleFormSubmit');
    e.preventDefault();

    const isVendor = user?.role === 'VENDOR';
    const isCustomer = user?.role === 'CUSTOMER';

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in as a customer to request services.',
        variant: 'destructive',
      });
      navigate('/login?type=customer');
      return;
    }

    if (isVendor) {
      toast({
        title: 'Action Not Allowed',
        description:
          'Vendors cannot request services. Please log in as a customer.',
        variant: 'destructive',
      });
      return;
    }

    if (isCustomer) {
      toast({
        title: 'Service Request Submitted',
        description: `Your request for ${service} has been received.`,
      });

      // ✅ Add real submission logic (e.g., API call)
      console.log('Service request submitted:', {
        firstName,
        lastName,
        phoneNumber,
        service,
        location,
      });
    }
  };

  return (
    <div className='min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300'>
      {/* Hero Section */}
      <section className='py-10 md:py-14 bg-gradient-to-b from-white via-gray-50/50 to-gray-50 dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-900'>
        <div className='container mx-auto px-4 md:px-6'>
          <div className='flex flex-col-reverse lg:flex-row gap-8 items-center'>
            {/* Form Side */}
            {/* <motion.div className="w-full lg:w-1/2"> */}
            <div className='w-full lg:w-1/2'>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 text-center lg:text-left'>
                Get the Job Done – On Your Terms
              </h1>
              <p className='text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 text-center lg:text-left'>
                Tell us what you need, set your budget, and get competitive bids
                from trusted vendors in your area.
              </p>

              {/* <motion.form onSubmit={handleFormSubmit} className="flex flex-col gap-4"> */}
              <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    type='text'
                    placeholder='First Name'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className='h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-bojj-primary/20 placeholder:text-gray-500 dark:placeholder:text-gray-400'
                    required
                  />
                  <Input
                    type='text'
                    placeholder='Last Name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className='h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-bojj-primary/20 placeholder:text-gray-500 dark:placeholder:text-gray-400'
                    required
                  />
                </div>

                {/* Service Dropdown */}
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className='h-12 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white'
                  >
                    <span
                      className={`${
                        service
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {service || 'What Service Do You Need?'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className='absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700'>
                      {Object.entries(serviceCategories).map(
                        ([category, services]) => (
                          <div
                            key={category}
                            className='group relative'
                            onMouseEnter={() => setActiveCategory(category)}
                            onMouseLeave={() => setActiveCategory(null)}
                          >
                            <button
                              type='button'
                              className='w-full text-left px-4 py-2.5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between'
                            >
                              <span>{category}</span>
                              <ChevronRight className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                            </button>

                            <div
                              className={`absolute left-full top-0 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700
                            ${activeCategory === category ? 'block' : 'hidden'}
                            lg:group-hover:block`}
                            >
                              {services.map((service) => (
                                <button
                                  key={service}
                                  type='button'
                                  onClick={() => {
                                    setService(service);
                                    setIsDropdownOpen(false);
                                  }}
                                  className='w-full text-left px-4 py-2.5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm'
                                >
                                  {service}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Location and Phone Inputs */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    type='text'
                    placeholder='ZIP Code'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className='h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-bojj-primary/20 placeholder:text-gray-500 dark:placeholder:text-gray-400'
                  />
                  <div className='flex gap-2'>
                    <Input
                      type='tel'
                      placeholder='Phone Number'
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className='h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-bojj-primary/20 placeholder:text-gray-500 dark:placeholder:text-gray-400'
                      required
                    />
                    {/* <Button
                      type="button"
                      onClick={handleSendOTP}
                      variant="outline"
                      className="h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white"
                    >
                      Send OTP
                    </Button> */}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (isAuthenticated) {
                      // If user is logged in, go to customer dashboard
                      navigate('/customer/jobs/new');
                    } else {
                      // If user is not logged in, redirect to login with customer type
                      navigate('/login?type=customer&redirect=/customer/jobs/new');
                    }
                  }}
                  className='h-12 bg-bojj-primary hover:bg-bojj-primary/90 text-white dark:text-white px-6 w-full transition-all duration-200'
                >
                  Get Bids Now
                </Button>

                {/* Login/Signup Buttons */}
                <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                  <Link to='/signup?type=customer' className='flex-1'>
                    <Button
                      variant='outline'
                      className='h-12 w-full border-bojj-primary text-bojj-primary hover:bg-bojj-primary/10 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'
                    >
                      Sign Up as Customer
                    </Button>
                  </Link>
                  <Link to='/signup?type=vendor' className='flex-1'>
                    <Button
                      variant='outline'
                      className='h-12 w-full border-bojj-primary text-bojj-primary hover:bg-bojj-primary/10 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'
                    >
                      Sign Up as Vendor
                    </Button>
                  </Link>
                </div>

                <div className='text-center mt-4'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    Already have an account?{' '}
                  </span>
                  <Link
                    to='/login?type=customer'
                    className='text-bojj-primary hover:underline font-medium'
                  >
                    Login here
                  </Link>
                </div>
              </form>
            </div>

            {/* Image Side */}
            {/* <motion.div className="w-full lg:w-1/2 flex justify-center"> */}
            <div className='w-full lg:w-1/2 flex justify-center'>
              <img
                src='https://images.unsplash.com/photo-1676311396794-f14881e9daaa?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                alt='Professional Services'
                className='rounded-lg shadow-lg w-full max-w-[600px] h-auto dark:opacity-90 dark:shadow-gray-800/30'
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className='py-12 md:py-16 bg-white dark:bg-gray-900'>
        <div className='container mx-auto px-4 md:px-6'>
          {/* <motion.div className="text-center mb-8 md:mb-12"> */}
          <div className='text-center mb-8 md:mb-12'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>
              How It Works
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-8'>
            {howItWorks.map((item, i) => (
              <div key={item.step} className='text-center relative'>
                <div className='bg-bojj-primary dark:bg-bojj-primary/90 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto'>
                  {item.step}
                </div>
                <h3 className='mt-3 md:mt-4 font-medium text-lg text-gray-900 dark:text-white'>
                  {item.title}
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-12 md:py-16 bg-gray-50 dark:bg-gray-800/50'>
        <div className='container mx-auto px-4 md:px-6'>
          {/* <motion.div className="text-center mb-8 md:mb-12"> */}
          <div className='text-center mb-8 md:mb-12'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>
              What People Say
            </h2>
            <p className='text-gray-600 dark:text-gray-300 mt-2'>
              Real experiences from our community
            </p>
          </div>

          <Carousel
            className='w-full'
            opts={{
              align: 'start',
              loop: true,
            }}
            setApi={setCarouselApi}
          >
            <CarouselContent className='-ml-2 md:-ml-4'>
              {testimonials.map((testimonial, i) => (
                <CarouselItem
                  key={i}
                  className='pl-2 md:pl-4 sm:basis-1/1 md:basis-1/2 lg:basis-1/3'
                >
                  <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 h-full'>
                    <div className='flex items-center gap-4'>
                      <div className='h-12 w-12 rounded-full overflow-hidden'>
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {testimonial.name}
                        </p>
                        <p className='text-sm text-bojj-primary dark:text-bojj-primary/90'>
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className='flex mt-4'>
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className='mt-4 text-gray-600 dark:text-gray-300'>
                      {testimonial.quote}
                    </p>
                    <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                      {testimonial.location}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className='mt-6 flex justify-center gap-2'>
              <CarouselPrevious
                className='relative static transform-none mx-2 transition-all hover:scale-110'
                variant='outline'
              />
              <CarouselNext
                className='relative static transform-none mx-2 transition-all hover:scale-110'
                variant='outline'
              />
            </div>
            <div className='flex justify-center gap-1 mt-4'>
              {testimonials
                .slice(0, Math.min(6, Math.ceil(testimonials.length / 3)))
                .map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                      Math.floor(currentCarouselSlide / 3) === i
                        ? 'bg-bojj-primary'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}

      <section className='py-12 md:py-16 bg-bojj-primary dark:bg-bojj-primary/90'>
        <div className='container mx-auto px-4 md:px-6 text-center'>
          <h2 className='text-2xl md:text-3xl font-bold text-white mb-4'>
            Ready to Get Started?
          </h2>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/signup?type=customer'>
              <Button
                variant='outline'
                className='bg-white text-bojj-primary border border-white 
                   dark:bg-transparent dark:text-white dark:border-white 
                   transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg 
                   hover:bg-gray-50 dark:hover:bg-white/10'
              >
                I Need a Service
              </Button>
            </Link>
            <Link to='/signup?type=vendor'>
              <Button
                className='bg-white text-bojj-primary 
                   dark:bg-white dark:text-bojj-primary 
                   transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg 
                   hover:bg-gray-100 dark:hover:bg-gray-200'
              >
                I'm a Service Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <AuthPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
