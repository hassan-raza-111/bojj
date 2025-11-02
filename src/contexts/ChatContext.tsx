import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { ENV_CONFIG } from '@/config/env';

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
      const newSocket = io(ENV_CONFIG.BACKEND_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        // Reload chat rooms when reconnected
        loadChatRooms();
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on(
        'new_message',
        (data: { message: ChatMessage; chatRoomId: string }) => {
          console.log('New message received:', data);

          // Update chat rooms to show latest message first
          setChatRooms((prev) =>
            prev.map((room) => {
              if (room.id === data.chatRoomId) {
                const existingMessages = room.messages || [];
                // Remove duplicate if exists, then add new message
                const filtered = existingMessages.filter(
                  (msg) => msg.id !== data.message.id
                );
                return {
                  ...room,
                  messages: [...filtered, data.message],
                  updatedAt: data.message.createdAt,
                };
              }
              return room;
            })
          );

          // Update messages if we're viewing this chat room (use functional update)
          setCurrentChatRoom((currentRoom) => {
            // Update messages if we're viewing this chat room
            setMessages((prevMessages) => {
              const isViewingRoom = currentRoom?.id === data.chatRoomId;
              if (isViewingRoom) {
                // Check if message already exists to avoid duplicates
                const exists = prevMessages.some(
                  (msg) => msg.id === data.message.id
                );
                if (!exists) {
                  // Mark as read if we're currently viewing this chat
                  if (data.message.sender.id !== user?.id) {
                    setTimeout(() => markAsRead(data.chatRoomId), 100);
                  }
                  return [...prevMessages, data.message];
                }
              }
              return prevMessages;
            });

            // Update unread count (only if not viewing this chat room)
            if (data.message.sender.id !== user?.id) {
              if (!currentRoom || currentRoom.id !== data.chatRoomId) {
                setUnreadCount((prev) => prev + 1);
              }
            }

            return currentRoom; // Return unchanged
          });
        }
      );

      // Handle when someone sends a message (refresh chat rooms)
      newSocket.on('message_sent', () => {
        // Refresh chat rooms list to get latest updates
        setTimeout(() => {
          loadChatRooms();
        }, 500);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token, isAuthenticated]);

  // Join socket room when current chat room changes
  useEffect(() => {
    if (socket && currentChatRoom && isConnected) {
      console.log('Joining chat room:', currentChatRoom.id);
      socket.emit('join_room', { chatRoomId: currentChatRoom.id });

      // Load messages when joining room
      loadMessages(currentChatRoom.id);
      markAsRead(currentChatRoom.id);

      const roomId = currentChatRoom.id;
      return () => {
        console.log('Leaving chat room:', roomId);
        socket.emit('leave_room', { chatRoomId: roomId });
      };
    }
  }, [socket, currentChatRoom?.id, isConnected]);

  // Load chat rooms
  const loadChatRooms = async () => {
    if (!token) return;

    console.log('Loading chat rooms...');
    try {
      const response = await fetch(`${ENV_CONFIG.BACKEND_URL}/api/chat/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chat rooms loaded:', data);
        setChatRooms(data.chatRooms || []);

        // Load unread count
        try {
          const unreadResponse = await fetch(
            `${ENV_CONFIG.BACKEND_URL}/api/chat/unread-count`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (unreadResponse.ok) {
            const unreadData = await unreadResponse.json();
            setUnreadCount(unreadData.unreadCount || 0);
          }
        } catch (unreadError) {
          console.error('Error loading unread count:', unreadError);
          // Calculate unread from messages if API fails - use functional update
          setCurrentChatRoom((currentRoom) => {
            const totalUnread = (data.chatRooms || []).reduce(
              (count: number, room: ChatRoom) => {
                if (room.messages && room.id !== currentRoom?.id) {
                  return (
                    count +
                    room.messages.filter(
                      (msg: ChatMessage) =>
                        !msg.isRead && msg.sender.id !== user?.id
                    ).length
                  );
                }
                return count;
              },
              0
            );
            setUnreadCount(totalUnread);
            return currentRoom; // Return unchanged
          });
        }
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
        `${ENV_CONFIG.BACKEND_URL}/api/chat/rooms/${chatRoomId}/messages`,
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
        `${ENV_CONFIG.BACKEND_URL}/api/chat/messages`,
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
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Update chat rooms to show latest message
        setChatRooms((prev) =>
          prev.map((room) => {
            if (room.id === currentChatRoom.id) {
              return {
                ...room,
                messages: room.messages
                  ? [...room.messages, newMessage]
                  : [newMessage],
                updatedAt: newMessage.createdAt,
              };
            }
            return room;
          })
        );

        // Emit socket event to notify other clients
        if (socket) {
          socket.emit('message_sent', {
            chatRoomId: currentChatRoom.id,
            message: newMessage,
          });
        }
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
        `${ENV_CONFIG.BACKEND_URL}/api/chat/rooms/${chatRoomId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reload unread count after marking as read
      try {
        const unreadResponse = await fetch(
          `${ENV_CONFIG.BACKEND_URL}/api/chat/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json();
          setUnreadCount(unreadData.unreadCount || 0);
        }
      } catch (error) {
        // Fallback: decrease unread count for this room
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Create a new chat room
  const createChatRoom = async (jobId: string, vendorId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${ENV_CONFIG.BACKEND_URL}/api/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          vendorId,
        }),
      });

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

  // Periodically refresh chat rooms to stay in sync
  useEffect(() => {
    if (user && isAuthenticated && isConnected) {
      const interval = setInterval(() => {
        loadChatRooms();
      }, 30000); // Refresh every 30 seconds (less aggressive)

      return () => clearInterval(interval);
    }
  }, [user?.id, isAuthenticated, isConnected]);

  // Load messages is now handled in the socket room join effect above

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
