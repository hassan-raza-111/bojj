import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { VendorBid } from '@/config/vendorApi';

interface BidEditModalProps {
  bid: VendorBid | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bidData: {
    amount?: number;
    description?: string;
    timeline?: string;
    notes?: string;
    milestones?: any;
  }) => void;
  isLoading?: boolean;
}

const BidEditModal = ({ bid, isOpen, onClose, onSave, isLoading }: BidEditModalProps) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    timeline: '',
    notes: '',
  });

  useEffect(() => {
    if (bid) {
      setFormData({
        amount: bid.amount.toString(),
        description: bid.description,
        timeline: bid.timeline,
        notes: bid.notes || '',
      });
    }
  }, [bid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      amount: parseFloat(formData.amount),
      description: formData.description,
      timeline: formData.timeline,
      notes: formData.notes,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!bid) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Edit Bid
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Bid Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="timeline" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Timeline
            </Label>
            <Input
              id="timeline"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}
              placeholder="e.g., 2-3 weeks"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}
              rows={3}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidEditModal;
