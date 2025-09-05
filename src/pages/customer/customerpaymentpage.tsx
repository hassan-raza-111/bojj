import { useState, useEffect } from 'react';
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
          icon: <CheckCircle className='h-4 w-4' />,
        });

        onSuccess(result.data.paymentId);
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong with the payment.',
        variant: 'destructive',
        icon: <AlertCircle className='h-4 w-4' />,
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
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch job details
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const result = await response.json();
        setJobDetails(result.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load job details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, toast]);

  const handlePaymentSuccess = (paymentId: string) => {
    navigate(`/customer/jobs/${jobId}/payment-success?paymentId=${paymentId}`);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className='text-center py-10'>
        <h2 className='text-xl font-semibold'>Job not found</h2>
      </div>
    );
  }

  const amount = jobDetails.budget || 0;

  return (
    <div className='max-w-2xl mx-auto px-4 py-10'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Complete Payment</h1>
          <p className='text-gray-600 mt-2'>
            Secure payment for your job: {jobDetails.title}
          </p>
        </div>

        {/* Job Summary */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Job Summary
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-gray-500'>
                  Job Title
                </Label>
                <p className='text-gray-900'>{jobDetails.title}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-500'>
                  Budget
                </Label>
                <p className='text-2xl font-bold text-green-600'>
                  ${amount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div>
                  <span className='text-gray-500'>Platform Fee (5%)</span>
                  <p className='font-medium'>${(amount * 0.05).toFixed(2)}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Escrow Fee (2%)</span>
                  <p className='font-medium'>${(amount * 0.02).toFixed(2)}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Net Amount</span>
                  <p className='font-medium text-green-600'>
                    ${(amount * 0.93).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                customerId={localStorage.getItem('userId') || ''}
                vendorId={jobDetails.assignedVendorId || ''}
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
