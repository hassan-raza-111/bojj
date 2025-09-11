import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, User, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const MessagesPage = () => {
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  if (!user) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card>
          <CardContent className='p-8 text-center'>
            <MessageCircle className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
            <h2 className='text-2xl font-bold mb-2'>Messages</h2>
            <p className='text-muted-foreground'>
              Please log in to view your messages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Messages</h1>
          <p className='text-muted-foreground'>
            Communicate with your{' '}
            {user.role === 'CUSTOMER' ? 'vendors' : 'customers'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
          {unreadCount > 0 && (
            <Badge variant='destructive'>{unreadCount} unread</Badge>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Chat Rooms List */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageCircle className='h-5 w-5' />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[600px]'>
              {chatRooms.length === 0 ? (
                <div className='text-center py-8'>
                  <MessageCircle className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                  <p className='text-muted-foreground'>No conversations yet</p>
                  <p className='text-sm text-muted-foreground mt-2'>
                    {user.role === 'CUSTOMER'
                      ? 'Accept a vendor bid to start chatting'
                      : 'Wait for customers to accept your bids'}
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {chatRooms.map((room) => {
                    const otherUser = getOtherUser(room);
                    const lastMessage = room.messages[0];
                    const isActive = currentChatRoom?.id === room.id;

                    return (
                      <div
                        key={room.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isActive ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setCurrentChatRoom(room)}
                      >
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
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className='lg:col-span-2'>
          <CardContent className='p-0 h-[600px] flex flex-col'>
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
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className='p-4 border-t'>
                  <div className='flex gap-2'>
                    <Input
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
