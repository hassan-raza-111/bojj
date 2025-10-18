import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from '@/config/notificationApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  DollarSign,
  MessageSquare,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [notifs, count] = await Promise.all([
        getNotifications(100), // Get more notifications for the page
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      console.log('📄 NotificationsPage - Notification clicked:', notification);
      console.log(
        '📄 NotificationsPage - Notification link:',
        notification.link
      );
      console.log('📄 NotificationsPage - Current user role:', user?.role);

      // Mark as read
      if (!notification.isRead) {
        await markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      // Navigate to link if exists
      if (notification.link) {
        // Handle old chat links - redirect to appropriate messages page
        if (notification.link.startsWith('/chat/')) {
          const messagesPath =
            user?.role === 'CUSTOMER'
              ? '/customer/messages'
              : user?.role === 'VENDOR'
              ? '/vendor/messages'
              : '/messages';
          console.log(
            '📄 NotificationsPage - Old chat link detected, redirecting to:',
            messagesPath
          );
          navigate(messagesPath);
        } else {
          console.log(
            '📄 NotificationsPage - Navigating to:',
            notification.link
          );
          navigate(notification.link);
        }
      } else {
        console.log('📄 NotificationsPage - No link provided for notification');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 dark:text-red-400';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400';
      case 'MEDIUM':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'MEDIUM':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_BID':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'BID_ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'BID_REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'JOB_COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PAYMENT_RELEASED':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'ACCOUNT_VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'SUPPORT_TICKET_REPLY':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'ALL' || notification.type === filterType;
    const matchesPriority =
      filterPriority === 'ALL' || notification.priority === filterPriority;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'READ' && notification.isRead) ||
      (filterStatus === 'UNREAD' && !notification.isRead);

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} unread notifications`
                : 'All caught up!'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="NEW_BID">New Bids</SelectItem>
                <SelectItem value="BID_ACCEPTED">Bid Accepted</SelectItem>
                <SelectItem value="NEW_MESSAGE">Messages</SelectItem>
                <SelectItem value="PAYMENT_RELEASED">Payments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="UNREAD">Unread</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchNotifications}
              className="h-10 px-3"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="h-10 px-3"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {searchTerm ||
              filterType !== 'ALL' ||
              filterPriority !== 'ALL' ||
              filterStatus !== 'ALL'
                ? 'Try adjusting your filters to see more notifications.'
                : "You're all caught up! No notifications to show."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-600'
                  : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className={`font-semibold ${
                          !notification.isRead
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(notification.priority)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="h-8 px-2"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Showing {filteredNotifications.length} of {notifications.length}{' '}
            notifications
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
