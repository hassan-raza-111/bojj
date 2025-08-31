import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { VendorBid } from '@/config/vendorApi';
import {
  DollarSign,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface BidDetailsModalProps {
  bid: VendorBid | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onWithdraw?: () => void;
}

const BidDetailsModal = ({
  bid,
  isOpen,
  onClose,
  onEdit,
  onWithdraw,
}: BidDetailsModalProps) => {
  const { theme } = useTheme();

  if (!bid) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return theme === 'dark'
          ? 'bg-green-900/20 text-green-300 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return theme === 'dark'
          ? 'bg-red-900/20 text-red-300 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'WITHDRAWN':
        return theme === 'dark'
          ? 'bg-gray-900/20 text-gray-300 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
      case 'PENDING':
        return theme === 'dark'
          ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return theme === 'dark'
          ? 'bg-gray-900/20 text-gray-300 border-gray-700'
          : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'REJECTED':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'WITHDRAWN':
        return <XCircle className='h-4 w-4 text-gray-500' />;
      case 'PENDING':
        return <AlertCircle className='h-4 w-4 text-yellow-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
          >
            Bid Details
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Job Information */}
          <div className='space-y-4'>
            <h3
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Job Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4
                  className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {bid.job.title}
                </h4>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {bid.job.description}
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {bid.job.location || `${bid.job.city}, ${bid.job.state}`}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-gray-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {bid.job.deadline
                      ? formatDate(bid.job.deadline)
                      : 'No deadline set'}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge
                variant='outline'
                className={
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }
              >
                {bid.job.category}
              </Badge>
              {bid.job.subcategory && (
                <Badge
                  variant='outline'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }
                >
                  {bid.job.subcategory}
                </Badge>
              )}
              {bid.job.budget && (
                <Badge
                  variant='outline'
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }
                >
                  Budget: {formatCurrency(bid.job.budget)}
                </Badge>
              )}
            </div>
          </div>

          {/* Bid Information */}
          <div className='space-y-4'>
            <h3
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Bid Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-green-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Bid Amount:
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {formatCurrency(bid.amount)}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-blue-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Timeline:
                  </span>
                  <span
                    className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {bid.timeline}
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-gray-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Submitted:
                  </span>
                  <span
                    className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {formatDate(bid.createdAt)}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={getStatusColor(bid.status)}
                  >
                    {getStatusIcon(bid.status)}
                    <span className='ml-1'>{bid.status}</span>
                  </Badge>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <h4
                className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Description:
              </h4>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {bid.description}
              </p>
            </div>

            {bid.notes && (
              <div className='space-y-2'>
                <h4
                  className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Additional Notes:
                </h4>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {bid.notes}
                </p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className='space-y-4'>
            <h3
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Customer Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-gray-500' />
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {bid.job.customer.firstName} {bid.job.customer.lastName}
                </span>
              </div>

              {bid.job.customer.location && (
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {bid.job.customer.location}
                  </span>
                </div>
              )}
            </div>

            {bid.job.customer.customerProfile && (
              <div className='text-sm text-gray-500'>
                <span>
                  Total jobs posted:{' '}
                  {bid.job.customer.customerProfile.totalJobsPosted}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>

            {bid.status === 'PENDING' && onEdit && (
              <Button onClick={onEdit}>Edit Bid</Button>
            )}

            {bid.status === 'PENDING' && onWithdraw && (
              <Button variant='destructive' onClick={onWithdraw}>
                Withdraw Bid
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidDetailsModal;
