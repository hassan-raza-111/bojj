import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Download, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('paymentId');
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) return;

      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setPaymentDetails(data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load payment details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, toast]);

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    const receipt = `
      BOJJ Payment Receipt
      ===================
      
      Payment ID: ${paymentDetails?.id}
      Date: ${new Date(paymentDetails?.createdAt).toLocaleDateString()}
      Amount: $${paymentDetails?.amount}
      Status: ${paymentDetails?.status}
      
      Job: ${paymentDetails?.job?.title}
      Vendor: ${paymentDetails?.vendor?.firstName} ${
      paymentDetails?.vendor?.lastName
    }
      
      Thank you for using BOJJ!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-receipt-${paymentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Successful - BOJJ',
        text: `I just completed a payment of $${paymentDetails?.amount} on BOJJ!`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Payment success link copied to clipboard.',
      });
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-10'>
      <div className='text-center mb-8'>
        <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Payment Successful!
        </h1>
        <p className='text-muted-foreground'>
          Your payment has been processed and is securely held in escrow.
        </p>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Payment ID</p>
              <p className='font-medium'>{paymentDetails?.id}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Amount</p>
              <p className='font-medium'>${paymentDetails?.amount}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Status</p>
              <p className='font-medium capitalize'>
                {paymentDetails?.status?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Date</p>
              <p className='font-medium'>
                {new Date(paymentDetails?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {paymentDetails?.job && (
            <div className='border-t pt-4'>
              <p className='text-sm text-muted-foreground mb-2'>Job Details</p>
              <p className='font-medium'>{paymentDetails.job.title}</p>
              <p className='text-sm text-muted-foreground'>
                {paymentDetails.job.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <Button
          onClick={handleDownloadReceipt}
          variant='outline'
          className='flex-1'
        >
          <Download className='mr-2 h-4 w-4' />
          Download Receipt
        </Button>
        <Button onClick={handleShare} variant='outline' className='flex-1'>
          <Share2 className='mr-2 h-4 w-4' />
          Share
        </Button>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <h3 className='font-medium text-blue-800 mb-2'>What happens next?</h3>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Your payment is securely held in escrow</li>
          <li>• The vendor will start working on your job</li>
          <li>• You can track progress in your dashboard</li>
          <li>• Payment will be released when you confirm completion</li>
        </ul>
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <Button
          onClick={() => navigate('/customer/dashboard')}
          variant='outline'
          className='flex-1'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Dashboard
        </Button>
        <Button
          onClick={() => navigate(`/customer/jobs/${jobId}`)}
          className='flex-1'
        >
          View Job Details
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
