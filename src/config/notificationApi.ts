import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/notifications`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  link?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Get all notifications
export const getNotifications = async (limit = 50): Promise<Notification[]> => {
  const response = await api.get('/', { params: { limit } });
  return response.data.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/unread/count');
  return response.data.data.count;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await api.put('/read-all');
};

// Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await api.delete(`/${notificationId}`);
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
