import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, MessageCircle, X, User, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Chat: React.FC<ChatProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    chatRooms,
    currentChatRoom,
    messages,
    unreadCount,
    isConnected,
    setCurrentChatRoom,
    sendMessage,
    loadChatRooms,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat room changes
  useEffect(() => {
    if (currentChatRoom) {
      inputRef.current?.focus();
    }
  }, [currentChatRoom]);

  const handleSendMessage = () => {
    if (newMessage.trim() && currentChatRoom) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (chatRoom: any) => {
    if (user?.role === 'CUSTOMER') {
      return chatRoom.vendor;
    } else {
      return chatRoom.customer;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-background rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <MessageCircle className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>Messages</h2>
            {unreadCount > 0 && (
              <Badge variant='destructive' className='ml-2'>
                {unreadCount}
              </Badge>
            )}
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className='ml-2'
            >
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex flex-1 overflow-hidden'>
          {/* Chat Rooms List */}
          <div className='w-1/3 border-r'>
            <ScrollArea className='h-full'>
              <div className='p-4'>
                <h3 className='font-medium mb-4'>Conversations</h3>
                {chatRooms.length === 0 ? (
                  <div className='text-center text-muted-foreground py-8'>
                    <MessageCircle className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {chatRooms.map((room) => {
                      const otherUser = getOtherUser(room);
                      const lastMessage = room.messages[0];
                      const isActive = currentChatRoom?.id === room.id;

                      return (
                        <Card
                          key={room.id}
                          className={`cursor-pointer transition-colors ${
                            isActive ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                          onClick={() => setCurrentChatRoom(room)}
                        >
                          <CardContent className='p-3'>
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-10 w-10'>
                                <AvatarImage src={otherUser.avatar} />
                                <AvatarFallback>
                                  {getInitials(
                                    otherUser.firstName,
                                    otherUser.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between'>
                                  <p className='font-medium truncate'>
                                    {otherUser.firstName} {otherUser.lastName}
                                  </p>
                                  {lastMessage && (
                                    <span className='text-xs text-muted-foreground'>
                                      {format(
                                        new Date(lastMessage.createdAt),
                                        'HH:mm'
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground truncate'>
                                  {room.job.title}
                                </p>
                                {lastMessage && (
                                  <p className='text-xs text-muted-foreground truncate'>
                                    {lastMessage.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Messages */}
          <div className='flex-1 flex flex-col'>
            {currentChatRoom ? (
              <>
                {/* Chat Header */}
                <div className='p-4 border-b'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={getOtherUser(currentChatRoom).avatar} />
                      <AvatarFallback>
                        {getInitials(
                          getOtherUser(currentChatRoom).firstName,
                          getOtherUser(currentChatRoom).lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>
                        {getOtherUser(currentChatRoom).firstName}{' '}
                        {getOtherUser(currentChatRoom).lastName}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {currentChatRoom.job.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className='flex-1 p-4'>
                  <div className='space-y-4'>
                    {messages.map((message) => {
                      const isOwnMessage = message.sender.id === user?.id;
                      const isSystemMessage = message.messageType === 'SYSTEM';

                      if (isSystemMessage) {
                        return (
                          <div key={message.id} className='flex justify-center'>
                            <Badge variant='secondary' className='text-xs'>
                              {message.content}
                            </Badge>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`flex gap-2 max-w-[70%] ${
                              isOwnMessage ? 'flex-row-reverse' : ''
                            }`}
                          >
                            {!isOwnMessage && (
                              <Avatar className='h-8 w-8 mt-1'>
                                <AvatarImage src={message.sender.avatar} />
                                <AvatarFallback>
                                  {getInitials(
                                    message.sender.firstName,
                                    message.sender.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-3 py-2 ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className='text-sm'>{message.content}</p>
                              <p className='text-xs opacity-70 mt-1'>
                                {format(new Date(message.createdAt), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className='p-4 border-t'>
                  <div className='flex gap-2'>
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Type your message...'
                      className='flex-1'
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center'>
                <div className='text-center text-muted-foreground'>
                  <MessageCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
