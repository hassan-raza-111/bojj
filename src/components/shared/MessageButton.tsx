import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
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
  const { createChatRoom, loadChatRooms, chatRooms, setCurrentChatRoom } =
    useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessageClick = async () => {
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    console.log('MessageButton clicked:', { jobId, vendorId, user: user.id });
    setIsLoading(true);
    try {
      // Try to create a chat room (this will fail if one already exists)
      await createChatRoom(jobId, vendorId);

      // Reload chat rooms to get the latest data
      await loadChatRooms();

      // Find the chat room for this job and vendor
      const chatRoom = chatRooms.find(
        (room) =>
          room.jobId === jobId &&
          ((user.role === 'CUSTOMER' && room.vendorId === vendorId) ||
            (user.role === 'VENDOR' && room.customerId === vendorId))
      );

      if (chatRoom) {
        // Set this as the current chat room
        setCurrentChatRoom(chatRoom);
      }

      toast.success('Chat room opened!');
    } catch (error) {
      console.log(
        'Chat room creation failed (probably already exists):',
        error
      );
      // If chat room already exists, just reload chat rooms and find it
      await loadChatRooms();

      // Find the existing chat room
      const chatRoom = chatRooms.find(
        (room) =>
          room.jobId === jobId &&
          ((user.role === 'CUSTOMER' && room.vendorId === vendorId) ||
            (user.role === 'VENDOR' && room.customerId === vendorId))
      );

      if (chatRoom) {
        setCurrentChatRoom(chatRoom);
      }

      toast.success('Chat room opened!');
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
