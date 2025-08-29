import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Paperclip,
  Send,
  Phone,
  Video,
  Search,
  MoreVertical,
  MapPin,
  DollarSign,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Pin,
  Archive,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { format, isToday, isYesterday } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
  attachments?: string[];
  read: boolean;
}

interface Conversation {
  id: string;
  participant: {
    name: string;
    avatar?: string;
    jobTitle: string;
    jobId: string;
    location: string;
    budget: string;
    status: 'active' | 'completed' | 'pending';
    rating?: number;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    read: boolean;
  };
  messages: Message[];
  unreadCount: number;
  isPinned?: boolean;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MessagesPage = () => {
  const query = useQuery();
  const jobId = query.get('jobId');
  const client = query.get('client');
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'completed' | 'pending'
  >('all');

  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        participant: {
          name: 'Sarah Miller',
          jobTitle: 'Kitchen Renovation',
          jobId: 'job-001',
          location: 'Chicago, IL',
          budget: '$8,000 - $12,000',
          status: 'active',
          rating: 4.8,
        },
        lastMessage: {
          content:
            'I can do tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?',
          timestamp: new Date('2023-04-29T10:37:00'),
          read: false,
        },
        messages: [
          {
            id: 'msg-1',
            sender: 'Michael Anderson',
            content:
              'Hi Sarah, I received your request about the kitchen renovation. Would you like to schedule a consultation?',
            timestamp: new Date('2023-04-29T10:30:00'),
            isCurrentUser: true,
            read: true,
          },
          {
            id: 'msg-2',
            sender: 'Sarah Miller',
            content:
              'Yes, that would be great! When are you available this week?',
            timestamp: new Date('2023-04-29T10:35:00'),
            isCurrentUser: false,
            read: true,
          },
          {
            id: 'msg-3',
            sender: 'Michael Anderson',
            content:
              'I can do tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?',
            timestamp: new Date('2023-04-29T10:37:00'),
            isCurrentUser: true,
            read: false,
          },
        ],
        unreadCount: 1,
        isPinned: true,
      },
      {
        id: 'conv-2',
        participant: {
          name: 'Jennifer Davis',
          jobTitle: 'Bathroom Remodel',
          jobId: 'job-002',
          location: 'Evanston, IL',
          budget: '$5,000 - $7,500',
          status: 'pending',
          rating: 4.6,
        },
        lastMessage: {
          content:
            "Thank you for the detailed quote. I'll review and get back to you soon.",
          timestamp: new Date('2023-04-28T16:45:00'),
          read: true,
        },
        messages: [
          {
            id: 'msg-4',
            sender: 'Jennifer Davis',
            content:
              "Thank you for the detailed quote. I'll review and get back to you soon.",
            timestamp: new Date('2023-04-28T16:45:00'),
            isCurrentUser: false,
            read: true,
          },
        ],
        unreadCount: 0,
      },
      {
        id: 'conv-3',
        participant: {
          name: 'Michael Thompson',
          jobTitle: 'Deck Construction',
          jobId: 'job-003',
          location: 'Oak Park, IL',
          budget: '$3,000 - $4,500',
          status: 'completed',
          rating: 4.9,
        },
        lastMessage: {
          content: 'The deck looks amazing! Thank you for the excellent work.',
          timestamp: new Date('2023-04-25T14:20:00'),
          read: true,
        },
        messages: [
          {
            id: 'msg-5',
            sender: 'Michael Thompson',
            content:
              'The deck looks amazing! Thank you for the excellent work.',
            timestamp: new Date('2023-04-25T14:20:00'),
            isCurrentUser: false,
            read: true,
          },
        ],
        unreadCount: 0,
      },
      {
        id: 'conv-4',
        participant: {
          name: 'Lisa Garcia',
          jobTitle: 'Landscape Design',
          jobId: 'job-004',
          location: 'Wheaton, IL',
          budget: '$6,000 - $9,000',
          status: 'active',
          rating: 4.7,
        },
        lastMessage: {
          content:
            'Can you send me some examples of your previous landscape work?',
          timestamp: new Date('2023-04-27T11:15:00'),
          read: false,
        },
        messages: [
          {
            id: 'msg-6',
            sender: 'Lisa Garcia',
            content:
              'Can you send me some examples of your previous landscape work?',
            timestamp: new Date('2023-04-27T11:15:00'),
            isCurrentUser: false,
            read: false,
          },
        ],
        unreadCount: 1,
      },
    ];

    if (jobId && client) {
      let found = mockConversations.find(
        (conv) =>
          conv.participant.name === client &&
          conv.participant.jobTitle.toLowerCase().includes(jobId)
      );
      if (!found) {
        found = {
          id: `conv-${jobId}-${client}`,
          participant: {
            name: client,
            jobTitle: `Job ${jobId}`,
            jobId: jobId,
            location: 'Location not specified',
            budget: 'Budget not specified',
            status: 'active',
          },
          lastMessage: {
            content: '',
            timestamp: new Date(),
            read: true,
          },
          messages: [],
          unreadCount: 0,
        };
        mockConversations.unshift(found);
      }
      setConversations(mockConversations);
      setSelectedConversation(found);
    } else {
      setConversations(mockConversations);
      setSelectedConversation(mockConversations[0]);
    }
  }, [jobId, client]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'Michael Anderson',
      content: newMessage,
      timestamp: new Date(),
      isCurrentUser: true,
      read: false,
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: {
        content: newMessage,
        timestamp: new Date(),
        read: false,
      },
      unreadCount: 0,
    };

    setSelectedConversation(updatedConversation);
    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-blue-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-600' />;
    }
  };

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'p');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participant.jobTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || conv.participant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-50' : 'bg-gray-50'
      }`}
    >
      <div className='flex h-screen'>
        {/* Left Sidebar - Chat Cards */}
        <div className='w-96 border-r border-gray-200 bg-white flex flex-col'>
          {/* Header */}
          <div className='p-6 border-b border-gray-200 bg-white'>
            <div className='flex items-center justify-between mb-4'>
              <h1 className='text-2xl font-bold text-gray-900'>Messages</h1>
              {totalUnread > 0 && (
                <Badge className='bg-red-500 text-white px-2 py-1 rounded-full'>
                  {totalUnread}
                </Badge>
              )}
            </div>

            {/* Search */}
            <div className='relative mb-4'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search conversations...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 bg-gray-50 border-gray-200 focus:bg-white'
              />
            </div>

            {/* Filter Buttons */}
            <div className='flex gap-2'>
              {(['all', 'active', 'pending', 'completed'] as const).map(
                (status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setFilterStatus(status)}
                    className='text-xs capitalize h-8'
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Chat Cards List */}
          <div className='flex-1 overflow-y-auto p-4 space-y-3'>
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedConversation?.id === conversation.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                } ${
                  conversation.isPinned ? 'border-l-4 border-l-yellow-400' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    {/* Avatar with unread indicator */}
                    <div className='relative'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage src={conversation.participant.avatar} />
                        <AvatarFallback className='bg-blue-100 text-blue-600 text-lg font-semibold'>
                          {conversation.participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white'>
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-1'>
                        <h3 className='font-semibold text-gray-900 truncate'>
                          {conversation.participant.name}
                        </h3>
                        <div className='flex items-center gap-1'>
                          {conversation.isPinned && (
                            <Pin className='h-3 w-3 text-yellow-500' />
                          )}
                          <span className='text-xs text-gray-500'>
                            {formatTimestamp(
                              conversation.lastMessage.timestamp
                            )}
                          </span>
                        </div>
                      </div>

                      <p className='text-sm font-medium text-blue-600 mb-1'>
                        {conversation.participant.jobTitle}
                      </p>

                      <p
                        className={`text-sm truncate mb-2 ${
                          conversation.lastMessage.read
                            ? 'text-gray-500'
                            : 'text-gray-900 font-medium'
                        }`}
                      >
                        {conversation.lastMessage.content}
                      </p>

                      {/* Job Details */}
                      <div className='flex items-center gap-3 text-xs text-gray-500 mb-2'>
                        <div className='flex items-center gap-1'>
                          <MapPin className='h-3 w-3' />
                          {conversation.participant.location}
                        </div>
                        <div className='flex items-center gap-1'>
                          <DollarSign className='h-3 w-3' />
                          {conversation.participant.budget}
                        </div>
                      </div>

                      {/* Status and Rating */}
                      <div className='flex items-center justify-between'>
                        <Badge
                          variant='outline'
                          className={`text-xs ${getStatusColor(
                            conversation.participant.status
                          )}`}
                        >
                          <div className='flex items-center gap-1'>
                            {getStatusIcon(conversation.participant.status)}
                            {conversation.participant.status}
                          </div>
                        </Badge>
                        {conversation.participant.rating && (
                          <div className='flex items-center gap-1 text-xs text-gray-500'>
                            <Star className='h-3 w-3 text-yellow-500 fill-current' />
                            {conversation.participant.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side - Chat Conversation */}
        <div className='flex-1 flex flex-col bg-white'>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className='p-6 border-b border-gray-200 bg-white'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-14 w-14'>
                      <AvatarImage
                        src={selectedConversation.participant.avatar}
                      />
                      <AvatarFallback className='bg-blue-100 text-blue-600 text-xl font-semibold'>
                        {selectedConversation.participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className='text-xl font-bold text-gray-900'>
                        {selectedConversation.participant.name}
                      </h2>
                      <p className='text-gray-600'>
                        {selectedConversation.participant.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='outline'
                      className={`${getStatusColor(
                        selectedConversation.participant.status
                      )}`}
                    >
                      <div className='flex items-center gap-1'>
                        {getStatusIcon(selectedConversation.participant.status)}
                        {selectedConversation.participant.status}
                      </div>
                    </Badge>
                    <Button variant='outline' size='icon'>
                      <Phone className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='icon'>
                      <Video className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='icon'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {/* Job Summary */}
                <div className='mt-4 grid grid-cols-3 gap-4'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='h-4 w-4 text-blue-500' />
                    {selectedConversation.participant.location}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <DollarSign className='h-4 w-4 text-green-500' />
                    {selectedConversation.participant.budget}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Star className='h-4 w-4 text-yellow-500' />
                    {selectedConversation.participant.rating
                      ? `${selectedConversation.participant.rating}/5`
                      : 'No rating'}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
                <div className='space-y-4'>
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          msg.isCurrentUser ? 'order-2' : 'order-1'
                        }`}
                      >
                        {!msg.isCurrentUser && (
                          <div className='flex items-center gap-2 mb-2'>
                            <Avatar className='h-6 w-6'>
                              <AvatarImage
                                src={selectedConversation.participant.avatar}
                              />
                              <AvatarFallback className='text-xs bg-blue-100 text-blue-600'>
                                {selectedConversation.participant.name.charAt(
                                  0
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className='text-xs font-medium text-gray-600'>
                              {selectedConversation.participant.name}
                            </span>
                          </div>
                        )}

                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.isCurrentUser
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                          }`}
                        >
                          <p className='text-sm leading-relaxed'>
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center justify-between mt-2 ${
                              msg.isCurrentUser
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            <span className='text-xs'>
                              {format(msg.timestamp, 'p')}
                            </span>
                            {msg.isCurrentUser && (
                              <span className='text-xs'>
                                {msg.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className='p-6 border-t border-gray-200 bg-white'>
                <div className='flex gap-3 items-end'>
                  <Button
                    variant='outline'
                    size='icon'
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <Paperclip className='h-5 w-5' />
                  </Button>

                  <div className='flex-1'>
                    <Input
                      placeholder='Type your message...'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className='min-h-[44px]'
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className='bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // No conversation selected
            <div className='flex-1 flex items-center justify-center bg-gray-50'>
              <div className='text-center'>
                <div className='mb-4'>
                  <MessageSquare className='h-20 w-20 mx-auto text-gray-300' />
                </div>
                <h3 className='text-xl font-medium text-gray-900 mb-2'>
                  No conversation selected
                </h3>
                <p className='text-gray-500'>
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
