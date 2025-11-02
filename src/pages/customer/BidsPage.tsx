import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageButton } from '@/components/shared/MessageButton';
import { Loader2 } from 'lucide-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { useToast } from '@/components/ui/use-toast';

// Types
interface Bid {
  id: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  amount: number;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
}

const BidsPage = () => {
  const { id } = useParams();
  const { fetchJobBids, acceptBid, rejectBid } = useCustomer();
  const { toast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBids();
    }
  }, [id]);

  const loadBids = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const jobBids = await fetchJobBids(id);
      setBids(jobBids);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bids',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!id) return;
    try {
      const success = await acceptBid(id, bidId);
      if (success) {
        await loadBids(); // Refresh bids
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept bid',
        variant: 'destructive',
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!id) return;
    try {
      const success = await rejectBid(id, bidId);
      if (success) {
        await loadBids(); // Refresh bids
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject bid',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-venbid-primary" />
        <span className="ml-2 text-gray-600">Loading bids...</span>
      </div>
    );
  }

  const bidsContent = (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Bids for Job</CardTitle>
          <CardDescription>
            Review and manage all bids for this job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No bids found for this job.
            </div>
          ) : (
            <div className="space-y-6">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50 dark:bg-gray-900"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {bid.vendor.firstName} {bid.vendor.lastName}
                        {bid.vendor.rating && (
                          <span className="ml-2 text-sm text-gray-500">
                            ⭐ {bid.vendor.rating}
                          </span>
                        )}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 capitalize"
                      >
                        {bid.status}
                      </Badge>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-1">
                      {bid.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted:{' '}
                      {new Date(bid.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <div className="font-bold text-lg mb-2 md:mb-0">
                      ${bid.amount.toLocaleString()}
                    </div>
                    {bid.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAcceptBid(bid.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectBid(bid.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {bid.status === 'ACCEPTED' && (
                      <MessageButton
                        jobId={id || ''}
                        vendorId={bid.vendor.id}
                        variant="outline"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8">
            <Link to="/customer/jobs">
              <Button variant="outline">Back to Jobs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidsPage;
