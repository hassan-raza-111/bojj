// DashboardLayout.tsx

import { ReactNode } from 'react';
import {
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar-components';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Menu, X, LogOut, Home, Briefcase, Users, DollarSign, MessageSquare, LifeBuoy, Globe, Settings, User, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'customer' | 'vendor';
}

const dashboardNav = (userType: 'customer' | 'vendor') => [
  {
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}`,
    description: 'Overview and analytics',
  },
  {
    label: 'Jobs',
    icon: <Briefcase className="w-5 h-5" />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}/jobs`,
    description: 'Manage your jobs',
  },
  {
    label: 'Messages',
    icon: <MessageSquare className="w-5 h-5" />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}/messages`,
    description: 'Communication hub',
  },
  {
    label: userType === 'vendor' ? 'Earnings' : 'Payments',
    icon: <DollarSign className="w-5 h-5" />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard/earnings' : 'customer/payments'}`,
    description: userType === 'vendor' ? 'Track your income' : 'Payment history',
  },
  {
    label: 'Support',
    icon: <LifeBuoy className="w-5 h-5" />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}/support`,
    description: 'Get help and support',
  },
  {
    label: 'Profile',
    icon: <User className="w-5 h-5" />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}/profile`,
    description: 'Manage your profile',
  },
];

const Sidebar = ({ userType, isOpen, onClose, setSidebarOpen }: { 
  userType: 'customer' | 'vendor'; 
  isOpen: boolean; 
  onClose: () => void; 
  setSidebarOpen: (open: boolean) => void;
}) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Overlay for mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-72 bg-gradient-to-b from-background to-muted/20 border-r border-border/40 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className='flex items-center justify-between h-20 px-6 border-b border-border/40 bg-gradient-to-r from-bojj-primary/5 to-bojj-secondary/5'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bojj-primary to-bojj-secondary text-white font-bold text-xl shadow-lg'>
              B
            </div>
            <div className='flex flex-col'>
              <span className='text-lg font-bold bg-gradient-to-r from-bojj-primary to-bojj-secondary bg-clip-text text-transparent'>
                BOJJ
              </span>
              <span className='text-xs text-muted-foreground capitalize'>
                {userType} Portal
              </span>
            </div>
          </div>
          
          <button
            type='button'
            onClick={() => setSidebarOpen(false)}
            className='md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
            aria-label='Close sidebar'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* User Info */}
        <div className='px-6 py-4 border-b border-border/40 bg-gradient-to-r from-bojj-primary/5 to-bojj-secondary/5'>
          <div className='flex items-center space-x-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-bojj-primary to-bojj-secondary text-white font-medium'>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-foreground truncate'>
                {user?.firstName} {user?.lastName}
              </p>
              <p className='text-xs text-muted-foreground capitalize'>
                {user?.role?.toLowerCase()}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 py-6 px-4'>
          <ul className='space-y-2'>
            {dashboardNav(userType).map((item) => {
              const isActive = item.label === 'Dashboard' 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-bojj-primary/10 to-bojj-secondary/10 text-bojj-primary border border-bojj-primary/20 shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-br from-bojj-primary to-bojj-secondary text-white shadow-lg' 
                        : 'bg-muted group-hover:bg-bojj-primary/10 group-hover:text-bojj-primary'
                      }
                    `}>
                      {item.icon}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className={`font-medium transition-colors ${isActive ? 'text-bojj-primary' : ''}`}>
                        {item.label}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className='w-2 h-2 rounded-full bg-gradient-to-r from-bojj-primary to-bojj-secondary animate-pulse' />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className='p-4 border-t border-border/40'>
          <Link to='/' className='w-full'>
            <Button
              variant='outline'
              className='w-full border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10 hover:border-bojj-primary/30 transition-all duration-200'
            >
              <Globe className='w-4 h-4 mr-2' />
              Explore Site
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
};

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-bojj-primary border-t-transparent mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Role-based access control
  if (userType === 'customer' && user?.role !== 'CUSTOMER') {
    return <Navigate to='/' replace />;
  }

  if (userType === 'vendor' && user?.role !== 'VENDOR') {
    return <Navigate to='/' replace />;
  }

  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';
  const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`;

  return (
    <SidebarProvider>
      <div className='flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20'>
        {/* Sidebar */}
        <Sidebar
          userType={userType}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          setSidebarOpen={setSidebarOpen}
        />
        
        {/* Main Content */}
        <div className='flex flex-col flex-1 w-full overflow-x-hidden'>
          {/* Top Header */}
          <div className='sticky top-0 z-30 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40'>
            <div className='flex items-center justify-between px-4 py-3 md:px-6 md:py-4'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className='p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors md:hidden'
                  aria-label='Open sidebar'
                >
                  <Menu className='h-5 w-5' />
                </button>
                
                <div className='hidden md:block'>
                  <h1 className='text-lg font-semibold text-foreground'>
                    {userType === 'vendor' ? 'Vendor Dashboard' : 'Customer Dashboard'}
                  </h1>
                  <p className='text-sm text-muted-foreground'>
                    Welcome back, {fullName}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                {/* Notifications */}
                <Button
                  variant='ghost'
                  size='sm'
                  className='relative p-2 hover:bg-muted/50'
                >
                  <Bell className='h-5 w-5' />
                  <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs'>
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <div className='flex items-center gap-2'>
                  <span className='hidden sm:block text-sm text-muted-foreground'>
                    {fullName}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('user');
                      localStorage.removeItem('isAuthenticated');
                      window.location.href = '/login';
                    }}
                    className='gap-2 px-3 py-2 text-sm hover:bg-muted/50'
                  >
                    <LogOut className='w-4 h-4' />
                    <span className='hidden md:inline'>Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Page Content */}
          <main className='flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 w-full'>
            <div className='max-w-7xl mx-auto w-full'>
              <div className='w-full animate-fade-in'>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
