import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MessageButtonProps {
  jobId: string;
  vendorId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const MessageButton: React.FC<MessageButtonProps> = ({
  jobId,
  vendorId,
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createChatRoom, loadChatRooms, chatRooms, setCurrentChatRoom } =
    useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessageClick = async () => {
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    console.log('MessageButton clicked:', { jobId, vendorId, user: user.id, role: user.role });
    setIsLoading(true);
    try {
      // For vendors, we need to find existing chat room (vendor can't create chat rooms)
      // For customers, we can try to create a chat room
      if (user.role === 'CUSTOMER') {
        // Try to create a chat room (this will fail if one already exists)
        try {
          await createChatRoom(jobId, vendorId);
        } catch (createError) {
          // Chat room might already exist, that's okay
          console.log('Chat room might already exist:', createError);
        }
      }

      // Reload chat rooms to get the latest data
      await loadChatRooms();

      // Wait a bit for state to update, then find the chat room
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get fresh chat rooms from context after reload
      // For both customer and vendor, navigate with jobId
      // For customer: vendorId is the other party
      // For vendor: vendorId is actually customerId (they're messaging the customer)
      const messagesPath =
        user.role === 'CUSTOMER' ? '/customer/messages' : '/vendor/messages';
      
      // Navigate with query params so MessagesPage can find the chat room
      // For vendors, vendorId param contains the customerId
      navigate(`${messagesPath}?jobId=${jobId}&vendorId=${vendorId}`);
      
      toast.success('Opening chat...');
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleMessageClick}
      disabled={isLoading}
      className={className}
    >
      <MessageSquare className='mr-2 h-4 w-4' />
      {isLoading ? 'Opening...' : 'Message'}
    </Button>
  );
};
