import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2,
  Lock,
  CreditCard,
  ExternalLink,
  Banknote,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Simple PayPal Icon Component
const PayPalIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M20.067 8.478c.492.315.844.825.844 1.478 0 .653-.352 1.163-.844 1.478-.492.315-1.163.478-1.844.478H16.5v-2.956h1.723c.681 0 1.352.163 1.844.478zM20.067 8.478c-.492-.315-1.163-.478-1.844-.478H16.5v2.956h1.723c.681 0 1.352-.163 1.844-.478.492-.315.844-.825.844-1.478 0-.653-.352-1.163-.844-1.478z' />
  </svg>
);

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
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

      const { data } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
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
        // Process payment
        await fetch(`/api/payments/${data.paymentId}/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            paymentMethod: 'STRIPE',
            transactionId: paymentIntent.id,
            customerId,
          }),
        });

        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been processed and is held in escrow.',
        });

        onSuccess(data.paymentId);
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
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='card-element'>Card Details</Label>
        <div className='border rounded-md p-3'>
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

      <Button type='submit' disabled={!stripe || loading} className='w-full'>
        {loading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Processing...
          </>
        ) : (
          <>
            <Lock className='mr-2 h-4 w-4' />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

// PayPal Payment Form Component
const PayPalPaymentForm = ({
  amount,
  jobId,
  customerId,
  vendorId,
  onSuccess,
}: PaymentFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePayPalPayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/paypal/create', {
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

      const { data } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create PayPal payment');
      }

      // Redirect to PayPal
      window.location.href = data.approvalUrl;
    } catch (error: any) {
      toast({
        title: 'PayPal Payment Failed',
        description:
          error.message || 'Something went wrong with PayPal payment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='text-center'>
        <PayPalIcon className='h-12 w-12 mx-auto mb-2 text-blue-600' />
        <p className='text-sm text-muted-foreground'>
          You will be redirected to PayPal to complete your payment securely.
        </p>
      </div>

      <Button
        onClick={handlePayPalPayment}
        disabled={loading}
        className='w-full bg-blue-600 hover:bg-blue-700'
      >
        {loading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Redirecting to PayPal...
          </>
        ) : (
          <>
            <PayPalIcon className='mr-2 h-4 w-4' />
            Pay with PayPal
          </>
        )}
      </Button>
    </div>
  );
};

// Manual Payment Form Component
const ManualPaymentForm = ({
  amount,
  jobId,
  customerId,
  vendorId,
  onSuccess,
}: PaymentFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: '',
    referenceNumber: '',
    notes: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/payments/manual/create', {
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
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber,
          notes: formData.notes,
        }),
      });

      const { data } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create manual payment');
      }

      toast({
        title: 'Manual Payment Created',
        description:
          'Your manual payment has been recorded. Admin will verify and process it.',
      });

      onSuccess(data.paymentId);
    } catch (error: any) {
      toast({
        title: 'Manual Payment Failed',
        description:
          error.message || 'Something went wrong with manual payment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='payment-method'>Payment Method</Label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(value) =>
            setFormData({ ...formData, paymentMethod: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Select payment method' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
            <SelectItem value='CASH'>Cash</SelectItem>
            <SelectItem value='CHECK'>Check/Money Order</SelectItem>
            <SelectItem value='OTHER'>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='reference-number'>Reference Number (Optional)</Label>
        <Input
          id='reference-number'
          placeholder='Transaction ID, check number, etc.'
          value={formData.referenceNumber}
          onChange={(e) =>
            setFormData({ ...formData, referenceNumber: e.target.value })
          }
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes'>Additional Notes (Optional)</Label>
        <Textarea
          id='notes'
          placeholder='Any additional information about the payment...'
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button
        type='submit'
        disabled={!formData.paymentMethod || loading}
        className='w-full'
      >
        {loading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Creating Payment...
          </>
        ) : (
          <>
            <Banknote className='mr-2 h-4 w-4' />
            Submit Manual Payment
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
  const [paymentMethod, setPaymentMethod] = useState('stripe');
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
        const data = await response.json();
        setJobDetails(data.data);
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

  const paymentContent = (
    <div className='max-w-4xl mx-auto px-4 py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Complete Payment
        </h1>
        <p className='text-muted-foreground'>
          Secure payment for: <strong>{jobDetails.title}</strong>
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Payment Summary */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <span>Job Amount:</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Platform Fee (5%):</span>
                <span>-${(amount * 0.05).toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Escrow Fee (2%):</span>
                <span>-${(amount * 0.02).toFixed(2)}</span>
              </div>
              <div className='border-t pt-2'>
                <div className='flex justify-between font-semibold'>
                  <span>Vendor Receives:</span>
                  <span>${(amount * 0.93).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>
                Select your preferred payment method to complete the transaction
                securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className='w-full'
              >
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger
                    value='stripe'
                    className='flex items-center gap-2'
                  >
                    <CreditCard className='h-4 w-4' />
                    Card
                  </TabsTrigger>
                  <TabsTrigger
                    value='paypal'
                    className='flex items-center gap-2'
                  >
                    <PayPalIcon className='h-4 w-4' />
                    PayPal
                  </TabsTrigger>
                  <TabsTrigger
                    value='manual'
                    className='flex items-center gap-2'
                  >
                    <Banknote className='h-4 w-4' />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='stripe' className='mt-6'>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={amount}
                      jobId={jobId!}
                      customerId={localStorage.getItem('userId') || ''}
                      vendorId={jobDetails.assignedVendorId || ''}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </TabsContent>

                <TabsContent value='paypal' className='mt-6'>
                  <PayPalPaymentForm
                    amount={amount}
                    jobId={jobId!}
                    customerId={localStorage.getItem('userId') || ''}
                    vendorId={jobDetails.assignedVendorId || ''}
                    onSuccess={handlePaymentSuccess}
                  />
                </TabsContent>

                <TabsContent value='manual' className='mt-6'>
                  <ManualPaymentForm
                    amount={amount}
                    jobId={jobId!}
                    customerId={localStorage.getItem('userId') || ''}
                    vendorId={jobDetails.assignedVendorId || ''}
                    onSuccess={handlePaymentSuccess}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Protection Info */}
      <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
        <h3 className='text-sm font-medium text-blue-800 mb-2'>
          <Lock className='inline h-4 w-4 mr-1' />
          Payment Protection
        </h3>
        <p className='text-sm text-blue-700'>
          Your payment is protected by our secure escrow system. Funds are held
          safely until you confirm the job is completed to your satisfaction. If
          there are any issues, our support team is here to help.
        </p>
      </div>
    </div>
  );

  return paymentContent;
};

export default CustomerPaymentPage;
