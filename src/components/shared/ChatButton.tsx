import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { Chat } from '@/components/shared/Chat';
import { useChat } from '@/contexts/ChatContext';

export const ChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { unreadCount } = useChat();

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsChatOpen(true)}
        className='relative'
      >
        <MessageCircle className='h-5 w-5' />
        {unreadCount > 0 && (
          <Badge
            variant='destructive'
            className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};
