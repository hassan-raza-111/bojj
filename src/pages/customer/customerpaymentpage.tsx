import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2,
  Lock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51S3hZxJcfjcbwpnXyour_key_here'
);

interface JobDetails {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  assignedVendor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface PaymentFormProps {
  amount: number;
  jobId: string;
  customerId: string;
  vendorId: string;
  onSuccess: (paymentId: string) => void;
}

// Stripe Payment Form Component
const StripePaymentForm = ({
  amount,
  jobId,
  customerId,
  vendorId,
  onSuccess,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          jobId,
          customerId,
          vendorId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        result.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been processed and is held in escrow.',
        });

        onSuccess(result.data.paymentId);
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong with the payment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-4'>
        <div>
          <Label htmlFor='card-element' className='text-base font-medium'>
            Card Details
          </Label>
          <div className='mt-2 border rounded-lg p-4 bg-white'>
            <CardElement
              id='card-element'
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className='bg-blue-50 p-4 rounded-lg'>
          <div className='flex items-start space-x-3'>
            <Lock className='h-5 w-5 text-blue-600 mt-0.5' />
            <div>
              <h4 className='font-medium text-blue-900'>Secure Payment</h4>
              <p className='text-sm text-blue-700 mt-1'>
                Your payment is processed securely through Stripe and held in
                escrow until the job is completed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        type='submit'
        disabled={!stripe || loading}
        className='w-full h-12 text-lg font-medium'
      >
        {loading ? (
          <>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className='mr-2 h-5 w-5' />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

const CustomerPaymentPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('Job ID is required');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching job details for ID:', jobId);

        // For development/testing - use mock data if backend is not available
        const useMockData = true; // Set to false when backend is running

        if (useMockData) {
          console.log('Using mock data for development');
          const mockJob: JobDetails = {
            id: jobId!,
            title: 'Website Development Project',
            description:
              'Create a modern responsive website with React and Node.js',
            budget: 1500,
            status: 'IN_PROGRESS',
            assignedVendor: {
              id: 'vendor-123',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john.smith@example.com',
            },
            customer: {
              id: 'customer-456',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane.doe@example.com',
            },
            createdAt: new Date().toISOString(),
          };
          setJobDetails(mockJob);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/jobs/${jobId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);

          // Check if response is HTML (error page)
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
            throw new Error(
              'Server returned HTML instead of JSON. Please check if backend server is running.'
            );
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('Non-JSON response:', responseText);
          throw new Error(
            'Server returned non-JSON response. Please check if backend server is running.'
          );
        }

        const result = await response.json();
        console.log('Job details response:', result);

        if (result.success && result.data) {
          const job = result.data.job || result.data;
          if (job) {
            setJobDetails(job);
          } else {
            throw new Error('Job data not found in response');
          }
        } else {
          throw new Error(result.message || 'Invalid response format');
        }
      } catch (error: any) {
        console.error('Error fetching job details:', error);
        setError(error.message || 'Failed to load job details');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load job details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, toast]);

  const handlePaymentSuccess = (paymentId: string) => {
    navigate(`/customer/jobs/${jobId}/payment-success?paymentId=${paymentId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
      <div className='max-w-2xl mx-auto px-4 py-10'>
        <div className='text-center'>
          <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Job Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            {error ||
              'The job you are looking for does not exist or you do not have access to it.'}
          </p>
          <div className='space-x-4'>
            <Button onClick={() => navigate('/customer/jobs')}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Jobs
            </Button>
            <Button variant='outline' onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const amount = jobDetails.budget || 0;
  const platformFee = amount * 0.05; // 5%
  const escrowFee = amount * 0.02; // 2%
  const netAmount = amount - platformFee - escrowFee;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Complete Payment
            </h1>
            <p className='text-gray-600 mt-2'>
              Secure payment for your job: {jobDetails.title}
            </p>
          </div>
          <Button variant='outline' onClick={() => navigate('/customer/jobs')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Jobs
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Job Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Job Summary
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div>
                  <Label className='text-sm font-medium text-gray-500'>
                    Job Title
                  </Label>
                  <p className='text-gray-900 font-medium'>
                    {jobDetails.title}
                  </p>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-500'>
                    Description
                  </Label>
                  <p className='text-gray-700 text-sm'>
                    {jobDetails.description}
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Job Status
                    </Label>
                    <p className='text-gray-900 capitalize'>
                      {jobDetails.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Created Date
                    </Label>
                    <p className='text-gray-900'>
                      {formatDate(jobDetails.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {jobDetails.assignedVendor && (
                <div className='pt-4 border-t'>
                  <Label className='text-sm font-medium text-gray-500'>
                    Assigned Vendor
                  </Label>
                  <div className='flex items-center space-x-3 mt-2'>
                    <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                      <User className='h-4 w-4 text-purple-600' />
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {jobDetails.assignedVendor.firstName}{' '}
                        {jobDetails.assignedVendor.lastName}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {jobDetails.assignedVendor.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Job Budget:</span>
                  <span className='text-2xl font-bold text-green-600'>
                    {formatCurrency(amount)}
                  </span>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Platform Fee (5%):</span>
                    <span className='font-medium'>
                      {formatCurrency(platformFee)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Escrow Fee (2%):</span>
                    <span className='font-medium'>
                      {formatCurrency(escrowFee)}
                    </span>
                  </div>
                  <div className='flex justify-between pt-2 border-t'>
                    <span className='text-gray-500'>Net Amount to Vendor:</span>
                    <span className='font-bold text-green-600'>
                      {formatCurrency(netAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-yellow-50 p-4 rounded-lg'>
                <div className='flex items-start space-x-3'>
                  <Lock className='h-5 w-5 text-yellow-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-yellow-900'>
                      Escrow Protection
                    </h4>
                    <p className='text-sm text-yellow-700 mt-1'>
                      Your payment is held securely until the job is completed
                      and you approve the work.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Enter your card details to complete the payment securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                amount={amount}
                jobId={jobId!}
                customerId={jobDetails.customer.id}
                vendorId={jobDetails.assignedVendor?.id || ''}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
