import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, DollarSign, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CounterBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidId: string;
  currentAmount: number;
  vendorName: string;
  onCounterBid: (
    bidId: string,
    counterAmount: number,
    message: string
  ) => Promise<void>;
}

export const CounterBidModal = ({
  isOpen,
  onClose,
  bidId,
  currentAmount,
  vendorName,
  onCounterBid,
}: CounterBidModalProps) => {
  const [counterAmount, setCounterAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Counter Bid Modal Submit:', {
      bidId,
      counterAmount,
      message,
      currentAmount,
    });

    if (!counterAmount || parseFloat(counterAmount) <= 0) {
      console.log('❌ Invalid amount:', counterAmount);
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid counter amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🚀 Calling onCounterBid function...');
      await onCounterBid(bidId, parseFloat(counterAmount), message);
      console.log('✅ Counter bid submitted successfully');
      toast({
        title: 'Counter Bid Sent',
        description: 'Your counter offer has been sent to the vendor.',
      });
      onClose();
      setCounterAmount('');
      setMessage('');
    } catch (error) {
      console.error('❌ Counter bid error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send counter bid. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setCounterAmount('');
      setMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Make Counter Offer
          </DialogTitle>
          <DialogDescription>
            Negotiate the price with {vendorName}. Current bid: $
            {currentAmount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="counterAmount">Your Counter Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="counterAmount"
                type="number"
                step="0.01"
                min="0"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                placeholder="Enter your counter amount"
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
            <p className="text-sm text-gray-500">
              Current bid: ${currentAmount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your counter offer or any conditions..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !counterAmount}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Counter Offer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
