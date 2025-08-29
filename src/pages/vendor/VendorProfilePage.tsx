import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
// import { motion } from "framer-motion";

const VendorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();

  // Mock data for a single vendor (replace with actual data fetching)
  const vendor = {
    id: id || 'vendor-1',
    name: "Sarah's Handyman Services",
    avatarUrl:
      'https://images.unsplash.com/photo-1573496800636-fa28ef86ebf8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80',
    rating: 4.8,
    reviews: 125,
    category: 'Home Renovation',
    yearsInBusiness: 5,
    location: '123 Main St, Anytown',
    description:
      'Experienced handyman providing top-notch home renovation services. Licensed and insured.',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad6c153916?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1475&q=80',
      'https://images.unsplash.com/photo-1583608225688-87a5250f1988?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3e7f148ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    ],
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    // <motion.div
    //   className="container py-8 sm:py-12"
    //   variants={pageVariants}
    //   initial="initial"
    //   animate="animate"
    //   exit="exit"
    //   transition={{ duration: 0.3 }}
    // >
    <Card
      className={`w-full max-w-4xl mx-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-2'>
        <CardTitle
          className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {vendor.name}
        </CardTitle>
        <Button
          className={
            theme === 'dark'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }
        >
          Contact Vendor
        </Button>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-1 flex flex-col items-center md:items-start'>
            <Avatar className='h-24 w-24 sm:h-32 sm:w-32 rounded-full border-2 border-bojj-primary'>
              <AvatarImage src={vendor.avatarUrl} alt={vendor.name} />
              <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className='mt-4 w-full text-center md:text-left'>
              <div className='flex items-center justify-center md:justify-start space-x-2'>
                <Badge
                  variant='secondary'
                  className={
                    theme === 'dark'
                      ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }
                >
                  {vendor.rating} Rating
                </Badge>
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  ({vendor.reviews} reviews)
                </span>
              </div>
              <p
                className={`mt-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <MapPin
                  className={`mr-2 inline-block h-4 w-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                {vendor.location}
              </p>
            </div>
          </div>
          <div className='md:col-span-2'>
            <CardDescription
              className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
            >
              {vendor.description}
            </CardDescription>
            <div className='mt-4'>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Category: {vendor.category}
              </p>
              <p
                className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Years in Business: {vendor.yearsInBusiness}
              </p>
            </div>
          </div>
        </div>
        <div className='mt-8'>
          <h3
            className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Gallery
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {vendor.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Work sample ${index + 1}`}
                className='rounded-md object-cover aspect-square border border-gray-200 dark:border-gray-700'
                loading='lazy'
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    // </motion.div>
  );
};

export default VendorProfilePage;
