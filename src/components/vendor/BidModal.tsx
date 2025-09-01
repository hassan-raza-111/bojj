import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { Loader2, DollarSign, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  category: string;
  location: string;
  customer: {
    firstName: string;
    lastName: string;
  };
}

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSubmitBid: (bidData: BidData) => Promise<void>;
}

interface BidData {
  jobId: string;
  amount: number;
  description: string;
  timeline: string;
  milestones?: string;
}

const BidModal = ({ isOpen, onClose, job, onSubmitBid }: BidModalProps) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BidData>({
    jobId: '',
    amount: 0,
    description: '',
    timeline: '',
    milestones: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) return;

    if (formData.amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a detailed proposal');
      return;
    }

    if (!formData.timeline) {
      toast.error('Please select a timeline');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitBid({
        ...formData,
        jobId: job.id,
      });
      toast.success('Bid submitted successfully!');
      onClose();
      setFormData({
        jobId: '',
        amount: 0,
        description: '',
        timeline: '',
        milestones: '',
      });
    } catch (error) {
      toast.error('Failed to submit bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[600px] ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
          >
            Submit Bid for "{job.title}"
          </DialogTitle>
          <DialogDescription
            className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
          >
            Provide your proposal and bid amount for this job
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Job Details */}
          <div
            className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <h4
              className={`font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Job Details
            </h4>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Category:
                </span>
                <p
                  className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {job.category}
                </p>
              </div>
              <div>
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Location:
                </span>
                <p
                  className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {job.location}
                </p>
              </div>
              <div>
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Budget:
                </span>
                <p
                  className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {formatCurrency(job.budget)} ({job.budgetType})
                </p>
              </div>
              <div>
                <span
                  className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Client:
                </span>
                <p
                  className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {job.customer.firstName} {job.customer.lastName}
                </p>
              </div>
            </div>
            <div className='mt-3'>
              <span
                className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Description:
              </span>
              <p
                className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {job.description}
              </p>
            </div>
          </div>

          {/* Bid Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label
                  htmlFor='amount'
                  className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  Bid Amount
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='amount'
                    type='number'
                    placeholder='0.00'
                    value={formData.amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className='pl-10'
                    required
                  />
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                  Suggested: {formatCurrency(job.budget * 0.8)} -{' '}
                  {formatCurrency(job.budget * 1.2)}
                </p>
              </div>

              <div>
                <Label
                  htmlFor='timeline'
                  className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  Timeline
                </Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) =>
                    setFormData({ ...formData, timeline: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select timeline' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1-3 days'>1-3 days</SelectItem>
                    <SelectItem value='1 week'>1 week</SelectItem>
                    <SelectItem value='2 weeks'>2 weeks</SelectItem>
                    <SelectItem value='1 month'>1 month</SelectItem>
                    <SelectItem value='2-3 months'>2-3 months</SelectItem>
                    <SelectItem value='3+ months'>3+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor='description'
                className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
              >
                Proposal Description
              </Label>
              <Textarea
                id='description'
                placeholder="Describe your approach, experience, and why you're the best fit for this job..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                required
              />
            </div>

            <div>
              <Label
                htmlFor='milestones'
                className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
              >
                Milestones (Optional)
              </Label>
              <Textarea
                id='milestones'
                placeholder='Break down the project into key milestones and deliverables...'
                value={formData.milestones}
                onChange={(e) =>
                  setFormData({ ...formData, milestones: e.target.value })
                }
                rows={3}
              />
            </div>
          </form>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='bg-bojj-primary hover:bg-bojj-primary/90'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              <>
                <DollarSign className='mr-2 h-4 w-4' />
                Submit Bid
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
