import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
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
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/vendor-dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
    },
    {
      name: 'Available Jobs',
      href: '/vendor-dashboard/jobs',
      icon: Briefcase,
      description: 'Browse and apply for jobs',
    },
    {
      name: 'My Bids',
      href: '/vendor-dashboard/bids',
      icon: Award,
      description: 'Manage your bids',
    },
    {
      name: 'Earnings',
      href: '/vendor-dashboard/earnings',
      icon: CreditCard,
      description: 'Payment history & withdrawals',
    },
    {
      name: 'Messages',
      href: '/vendor-dashboard/messages',
      icon: MessageSquare,
      description: 'Communication hub',
    },
    {
      name: 'Support',
      href: '/vendor-dashboard/support',
      icon: HeadphonesIcon,
      description: 'Get help and support',
    },
    {
      name: 'Profile',
      href: '/vendor-dashboard/profile',
      icon: User,
      description: 'Manage your profile',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/vendor-dashboard') {
      return location.pathname === '/vendor-dashboard';
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
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Role-based access control - only VENDOR users can access
  if (user?.role !== 'VENDOR') {
    return <Navigate to='/' replace />;
  }

  const firstName = user?.firstName || 'Vendor';
  const lastName = user?.lastName || '';
  const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`;

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col'>
          {/* Sidebar Header */}
          <div className='flex h-16 items-center justify-between px-6 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold text-xl'>
                B
              </div>
              <div>
                <h1 className='text-lg font-semibold text-gray-900'>BOJJ</h1>
                <p className='text-xs text-gray-500'>Vendor Portal</p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setSidebarOpen(false)}
            >
              <X className='h-5 w-5' />
            </Button>
          </div>

          {/* User Profile */}
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-semibold text-lg'>
                {user?.firstName?.charAt(0) || 'V'}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {fullName}
                </p>
                <p className='text-xs text-gray-500'>Professional Vendor</p>
                <div className='flex items-center mt-1'>
                  <Badge variant='outline' className='text-xs mr-2'>
                    ⭐ 4.8
                  </Badge>
                  <Badge
                    variant='outline'
                    className='text-xs bg-emerald-50 text-emerald-700 border-emerald-200'
                  >
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 space-y-1 px-3 py-4'>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      active
                        ? 'text-emerald-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span>{item.name}</span>
                      {active && (
                        <div className='w-2 h-2 bg-emerald-600 rounded-full'></div>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        active ? 'text-emerald-600' : 'text-gray-500'
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
          <div className='border-t border-gray-200 p-4'>
            <Button
              variant='ghost'
              className='w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              onClick={handleLogout}
            >
              <LogOut className='mr-3 h-5 w-5' />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 lg:ml-64'>
        {/* Fixed Top Header */}
        <header className='fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white shadow-sm border-b border-gray-200'>
          <div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
            {/* Mobile menu button */}
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className='h-5 w-5' />
            </Button>

            {/* Page Title */}
            <div className='flex-1 min-w-0 lg:ml-0'>
              <h1 className='text-lg font-semibold text-gray-900'>
                Vendor Dashboard
              </h1>
              <p className='text-sm text-gray-500'>Welcome back, {firstName}</p>
            </div>

            {/* Right side actions */}
            <div className='flex items-center space-x-4'>
              {/* Quick Stats */}
              <div className='hidden md:flex items-center space-x-4 text-sm'>
                <div className='flex items-center space-x-1 text-emerald-600'>
                  <TrendingUp className='h-4 w-4' />
                  <span className='font-medium'>$2,450</span>
                </div>
                <div className='flex items-center space-x-1 text-blue-600'>
                  <Calendar className='h-4 w-4' />
                  <span className='font-medium'>12 Jobs</span>
                </div>
              </div>

              {/* Notifications */}
              <Button variant='ghost' size='sm' className='relative'>
                <Bell className='h-5 w-5' />
                <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                  5
                </span>
              </Button>

              {/* User menu */}
              <div className='flex items-center space-x-3'>
                <span className='text-sm font-medium text-gray-700'>
                  {fullName}
                </span>
                <Button variant='ghost' size='sm' onClick={handleLogout}>
                  <LogOut className='h-4 w-4 mr-2' />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with proper spacing */}
        <main className='pt-16 min-h-screen'>
          <div className='p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
