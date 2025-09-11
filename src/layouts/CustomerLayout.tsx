import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  CreditCard,
  HeadphonesIcon,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/customer',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
    },
    {
      name: 'Jobs',
      href: '/customer/jobs',
      icon: Briefcase,
      description: 'Manage your jobs',
    },
    {
      name: 'Messages',
      href: '/customer/messages',
      icon: MessageSquare,
      description: 'Communication hub',
    },
    {
      name: 'Support',
      href: '/customer/support',
      icon: HeadphonesIcon,
      description: 'Get help and support',
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: User,
      description: 'Manage your profile',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/customer') {
      return location.pathname === '/customer';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');

    // Call logout function
    logout();

    // Redirect to login
    window.location.href = '/login';
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 to-gray-800'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p
            className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control - only CUSTOMER users can access
  if (user?.role !== 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  const firstName = user?.firstName || 'Customer';
  const lastName = user?.lastName || '';
  const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`;

  return (
    <div
      className={`min-h-screen flex ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div
            className={`flex h-16 items-center justify-between px-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-xl">
                B
              </div>
              <div>
                <h1
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  BOJJ
                </h1>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Customer Portal
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`lg:hidden ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div
            className={`px-6 py-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold text-lg">
                {user?.firstName?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {fullName}
                </p>
                <p
                  className={`text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {user?.email || 'customer@example.com'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      theme === 'dark'
                        ? 'bg-purple-900/20 text-purple-300 border-purple-700'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {user?.status || 'ACTIVE'}
                  </Badge>
                  {user?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate max-w-20">
                        {user.location}
                      </span>
                    </div>
                  )}
                </div>
                {user?.createdAt && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    active
                      ? theme === 'dark'
                        ? 'bg-purple-900/20 text-purple-300 border-r-2 border-purple-500'
                        : 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      active
                        ? theme === 'dark'
                          ? 'text-purple-400'
                          : 'text-purple-600'
                        : theme === 'dark'
                        ? 'text-gray-400 group-hover:text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {active && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600'
                          }`}
                        ></div>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        active
                          ? theme === 'dark'
                            ? 'text-purple-400'
                            : 'text-purple-600'
                          : theme === 'dark'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div
            className={`border-t p-4 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to logout? You will need to sign in
                    again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Fixed Top Header */}
        <header
          className={`fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-sm border-b ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className={`lg:hidden ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page Title */}
            <div className="flex-1 min-w-0 lg:ml-0">
              <h1
                className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Customer Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Welcome back, {firstName}
                </p>
                {user?.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{user.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {user.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className={`relative ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  3
                </span>
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative h-10 w-10 rounded-full p-0 ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white text-sm font-semibold shadow-md">
                        {user?.firstName?.charAt(0) || 'C'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {fullName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || 'customer@example.com'}
                        </p>
                        {user?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {user.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/customer/profile" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleTheme()}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to logout? You will need to
                            sign in again to access your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            Logout
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with proper spacing */}
        <main
          className={`pt-16 min-h-screen ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
