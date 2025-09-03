import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ChatRoom {
  id: string;
  jobId: string;
  customerId: string;
  vendorId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  job: {
    id: string;
    title: string;
    status: string;
  };
  messages: ChatMessage[];
}

interface ChatContextType {
  socket: Socket | null;
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  messages: ChatMessage[];
  unreadCount: number;
  isConnected: boolean;
  setCurrentChatRoom: (room: ChatRoom | null) => void;
  sendMessage: (
    content: string,
    messageType?: 'TEXT' | 'IMAGE' | 'FILE'
  ) => void;
  markAsRead: (chatRoomId: string) => void;
  createChatRoom: (jobId: string, vendorId: string) => Promise<void>;
  loadChatRooms: () => Promise<void>;
  loadMessages: (chatRoomId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');

  // Initialize socket connection
  useEffect(() => {
    if (user && token && isAuthenticated) {
      const newSocket = io(
        import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',
        {
          auth: {
            token: token,
          },
        }
      );

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on(
        'new_message',
        (data: { message: ChatMessage; chatRoomId: string }) => {
          console.log('New message received:', data);

          // Update messages if we're in the current chat room
          if (currentChatRoom && data.chatRoomId === currentChatRoom.id) {
            setMessages((prev) => [...prev, data.message]);
          }

          // Update chat rooms to show latest message
          setChatRooms((prev) =>
            prev.map((room) => {
              if (room.id === data.chatRoomId) {
                return {
                  ...room,
                  messages: [data.message],
                  updatedAt: data.message.createdAt,
                };
              }
              return room;
            })
          );

          // Update unread count
          if (data.message.sender.id !== user.id) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      );

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token, isAuthenticated, currentChatRoom]);

  // Load chat rooms
  const loadChatRooms = async () => {
    if (!token) return;

    console.log('Loading chat rooms...');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Chat rooms loaded:', data);
        setChatRooms(data.chatRooms);
      } else {
        console.error(
          'Failed to load chat rooms:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  // Load messages for a specific chat room
  const loadMessages = async (chatRoomId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/chat/rooms/${chatRoomId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send a message
  const sendMessage = async (
    content: string,
    messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ) => {
    if (!currentChatRoom || !token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatRoomId: currentChatRoom.id,
            content,
            messageType,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Message sent successfully:', data);

        // Add the message to the current messages immediately
        const newMessage = data.data;
        setMessages((prev) => [...prev, newMessage]);

        // Update chat rooms to show latest message
        setChatRooms((prev) =>
          prev.map((room) => {
            if (room.id === currentChatRoom.id) {
              return {
                ...room,
                messages: [newMessage],
                updatedAt: newMessage.createdAt,
              };
            }
            return room;
          })
        );
      } else {
        console.error(
          'Failed to send message:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mark messages as read
  const markAsRead = async (chatRoomId: string) => {
    if (!token) return;

    try {
      await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/rooms/${chatRoomId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Create a new chat room
  const createChatRoom = async (jobId: string, vendorId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/rooms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobId,
            vendorId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatRooms((prev) => [data.chatRoom, ...prev]);
        return data.chatRoom;
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  // Load chat rooms when user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      loadChatRooms();
    }
  }, [user, isAuthenticated]);

  // Load messages when current chat room changes
  useEffect(() => {
    if (currentChatRoom) {
      loadMessages(currentChatRoom.id);
      markAsRead(currentChatRoom.id);
    }
  }, [currentChatRoom]);

  const value: ChatContextType = {
    socket,
    chatRooms,
    currentChatRoom,
    messages,
    unreadCount,
    isConnected,
    setCurrentChatRoom,
    sendMessage,
    markAsRead,
    createChatRoom,
    loadChatRooms,
    loadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
