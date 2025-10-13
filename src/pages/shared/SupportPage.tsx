import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { motion } from "framer-motion";
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle2,
  LifeBuoy,
  Mail,
  TicketCheck,
  ChevronDown,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Link } from 'react-router-dom';
import React from 'react';
import { apiService } from '@/services/api';

// Define ticket schema
const ticketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

// Service categories (same as HomePage)
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

const SupportPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const isLoggedIn = !!user;
  const [loading, setLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Determine if we're in a dashboard or main layout
  const isDashboard =
    location.pathname.includes('customer') ||
    location.pathname.includes('vendor');
  const layoutClass = isDashboard
    ? ''
    : 'container max-w-6xl mx-auto py-12 px-6';

  // Pre-fill form if user is logged in
  const defaultValues = {
    subject: '',
    category: '',
    message: '',
    email: user?.email || '',
    name: user ? `${user.firstName} ${user.lastName}` : '',
  };

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues,
  });

  const onSubmit = async (values: TicketFormValues) => {
    setLoading(true);

    try {
      const ticketData = {
        title: values.subject,
        description: values.message,
        category: values.category,
        priority: 'MEDIUM', // Default priority
        userId: user?.id,
      };

      const response = await apiService.support.createTicket(ticketData);

      if (response.success) {
        setLoading(false);
        setTicketCreated(true);
        setTicketId(response.data.id);

        // Show toast notification
        toast({
          title: 'Support ticket created!',
          description: `Your ticket ID is ${response.data.id.slice(
            0,
            8
          )}. We'll get back to you soon.`,
        });

        // Reset form
        form.reset(defaultValues);
      } else {
        throw new Error(response.message || 'Failed to create ticket');
      }
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create support ticket',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={layoutClass}>
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      > */}
      <>
        <h1 className="text-3xl font-bold">Customer Support</h1>
        <p className="text-gray-600 mt-2">
          Need help? Submit a ticket and our team will get back to you shortly.
        </p>
      </>
      {/* </motion.div> */}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Support Ticket Form */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        > */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              {!ticketCreated ? (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <TicketCheck className="h-6 w-6 text-venbid-primary" />
                    <h2 className="text-2xl font-semibold">
                      Create a Support Ticket
                    </h2>
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your email"
                                  type="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setIsDropdownOpen((open) => !open)
                                }
                                className="h-12 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white"
                              >
                                <span
                                  className={`${
                                    field.value
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  {field.value || 'What Service Do You Need?'}
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                                    isDropdownOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                              {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                                  {Object.entries(serviceCategories).map(
                                    ([category, services]) => (
                                      <div
                                        key={category}
                                        className="group relative"
                                        onMouseEnter={() =>
                                          setActiveCategory(category)
                                        }
                                        onMouseLeave={() =>
                                          setActiveCategory(null)
                                        }
                                      >
                                        <button
                                          type="button"
                                          className="w-full text-left px-4 py-2.5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between"
                                        >
                                          <span>{category}</span>
                                          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                        <div
                                          className={`absolute left-full top-0 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 ${
                                            activeCategory === category
                                              ? 'block'
                                              : 'hidden'
                                          } lg:group-hover:block`}
                                        >
                                          {services.map((service) => (
                                            <button
                                              key={service}
                                              type="button"
                                              onClick={() => {
                                                field.onChange(service);
                                                setIsDropdownOpen(false);
                                              }}
                                              className="w-full text-left px-4 py-2.5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm"
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Brief description of your issue"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please describe your issue in detail"
                                rows={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-venbid-primary hover:bg-venbid-primary/90"
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                      </Button>
                    </form>
                  </Form>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">
                      Ticket Created Successfully!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Your support ticket has been submitted. We'll get back to
                      you as soon as possible.
                    </p>
                    <div className="p-4 bg-accent rounded-lg text-left mb-6 max-w-md mx-auto">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm text-muted-foreground">
                          Ticket ID:
                        </p>
                        <p className="text-sm font-medium text-right text-foreground">
                          {ticketId}
                        </p>
                        <p className="text-sm text-muted-foreground">Status:</p>
                        <p className="text-sm font-medium text-right">
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            Open
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created:
                        </p>
                        <p className="text-sm font-medium text-right text-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setTicketCreated(false)}
                        className="text-foreground"
                      >
                        Create Another Ticket
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        {/* </motion.div> */}

        {/* Support Information */}
        {/* <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-1"
        > */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center gap-2 mb-4">
                <div className="bg-venbid-primary/10 p-3 rounded-full">
                  <LifeBuoy className="h-6 w-6 text-venbid-primary" />
                </div>
                <h3 className="font-medium text-lg">How Can We Help?</h3>
                <p className="text-sm text-gray-600">
                  Our support team is here to assist you with any questions or
                  issues you may have.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Response Times</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">General Inquiries:</span>
                    <span>24-48 hours</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Technical Issues:</span>
                    <span>12-24 hours</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Urgent Matters:</span>
                    <span>4-8 hours</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">support@venbid.com</span>
                </div>
                <p className="text-xs text-gray-600">
                  Our support hours are Monday to Friday, 9:00 AM - 5:00 PM CT.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Frequently Asked Questions</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link
                      // to="/faq?category=Account%20%26%20Profile&question=How%20do%20I%20reset%20my%20password"
                      to="/faq?category=Account%20%26%20Profile&question=How%20do%20I%20reset%20my%20password"
                      className="text-venbid-primary hover:underline cursor-pointer"
                    >
                      How do I reset my password?
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq?category=Account%20%26%20Profile&question=Where%20can%20I%20find%20my%20invoice"
                      className="text-venbid-primary hover:underline cursor-pointer"
                    >
                      Where can I find my invoice?
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq?category=Account%20%26%20Profile&question=How%20to%20update%20my%20profile"
                      className="text-venbid-primary hover:underline cursor-pointer"
                    >
                      How to update my profile?
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-venbid-primary hover:underline cursor-pointer"
                    >
                      View all FAQs →
                    </Link>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* </motion.div> */}
      </div>
    </div>
  );
};

export default SupportPage;
