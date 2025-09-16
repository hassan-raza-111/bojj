import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  UserPlus,
  CreditCard,
  HeadphonesIcon,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'System overview and analytics',
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      description: 'Manage all platform users',
    },
    {
      name: 'Job Management',
      href: '/admin/jobs',
      icon: Briefcase,
      description: 'Monitor and manage jobs',
    },
    {
      name: 'Vendor Management',
      href: '/admin/vendors',
      icon: UserCheck,
      description: 'Vendor approvals and management',
    },
    {
      name: 'Customer Management',
      href: '/admin/customers',
      icon: UserPlus,
      description: 'Customer support and management',
    },
    {
      name: 'Support Tickets',
      href: '/admin/support',
      icon: HeadphonesIcon,
      description: 'Handle support requests',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control - only ADMIN users can access
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const firstName = user?.firstName || 'Admin';
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl">
                A
              </div>
              <div>
                <h1
                  className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  BOJJ
                </h1>
                <p className="text-xs text-blue-600 font-medium">
                  Admin Portal
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
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
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={fullName}
                  className="h-12 w-12 rounded-full object-cover border border-blue-200"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold text-lg">
                  {user?.firstName?.charAt(0) || 'A'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {fullName}
                </p>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {user?.email}
                </p>
                <div className="flex items-center mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      theme === 'dark'
                        ? 'bg-blue-900/20 text-blue-300 border-blue-700'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role || 'ADMIN'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ml-2 ${
                      theme === 'dark'
                        ? 'bg-green-900/20 text-green-300 border-green-700'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
                        ? 'bg-blue-900/20 text-blue-300 border-r-2 border-blue-500'
                        : 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
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
                          ? 'text-blue-400'
                          : 'text-blue-600'
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
                            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
                          }`}
                        ></div>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        active
                          ? theme === 'dark'
                            ? 'text-blue-400'
                            : 'text-blue-600'
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
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
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
              className="lg:hidden"
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
                Admin Dashboard
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Welcome back, {firstName}
              </p>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User dropdown (match customer style) */}
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
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={fullName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-sm font-semibold">
                        {user?.firstName?.charAt(0) || 'A'}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
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
                          Are you sure you want to logout? You will need to sign
                          in again to access your account.
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

export default AdminLayout;
