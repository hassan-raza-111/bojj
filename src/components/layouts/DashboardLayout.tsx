// DashboardLayout.tsx

import { ReactNode } from 'react';
import {
  // Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar-components';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Users,
  DollarSign,
  MessageSquare,
  LifeBuoy,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'customer' | 'vendor';
}

const dashboardNav = (userType) => [
  {
    label: 'Dashboard',
    icon: <Home />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}`,
  },
  {
    label: 'Jobs',
    icon: <Briefcase />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}/jobs`,
  },
  {
    label: 'Messages',
    icon: <MessageSquare />,
    path: `/${
      userType === 'vendor' ? 'vendor-dashboard' : 'customer'
    }/messages`,
  },
  {
    label: userType === 'vendor' ? 'Earnings' : 'Payments',
    icon: <DollarSign />,
    path: `/${
      userType === 'vendor' ? 'vendor-dashboard/earnings' : 'customer/payments'
    }`,
  },
  {
    label: 'Support',
    icon: <LifeBuoy />,
    path: `/${userType === 'vendor' ? 'vendor-dashboard' : 'customer'}/support`,
  },
];

const Sidebar = ({ userType, isOpen, onClose, setSidebarOpen }) => {
  const location = useLocation();
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
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-border flex flex-col shadow-md
          transition-transform duration-200 md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className='flex items-center justify-center h-16 border-b border-border'>
          <span className='text-2xl font-bold text-primary'>
            BOJJ {userType === 'vendor' ? 'Vendor' : 'Customer'}
          </span>
          <button
            type='button'
            onClick={() => window.history.back()}
            className='ml-3 hidden md:inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-border'
            aria-label='Back'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='w-5 h-5 text-primary'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5L8.25 12l7.5-7.5'
              />
            </svg>
          </button>
          <button
            type='button'
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            className='ml-auto md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-border'
            aria-label='Close sidebar'
            style={{ marginRight: 8 }}
          >
            <X className='w-5 h-5 text-primary' />
          </button>
        </div>
        <nav className='flex-1 py-4'>
          <ul className='space-y-1'>
            {dashboardNav(userType).map((item) => {
              let isActive = false;
              if (item.label === 'Dashboard') {
                isActive = location.pathname === item.path;
              } else {
                isActive = location.pathname.startsWith(item.path);
              }
              return (
                <li key={item.label}>
                  <Button
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 px-4 py-2 rounded-none transition group ${
                      isActive ? '!bg-secondary text-secondary-foreground' : ''
                    }`}
                  >
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className='flex items-center gap-2 w-full'
                    >
                      {item.icon}
                      <span className='flex-1 text-left group-hover:text-primary transition-colors'>
                        {item.label}
                      </span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';
  const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`;
  const businessName =
    userType === 'vendor' ? `${firstName}'s Construction!` : '';

  return (
    <SidebarProvider>
      <div className='flex min-h-screen bg-background text-foreground'>
        {/* Sidebar: drawer on mobile, sticky on desktop */}
        <Sidebar
          userType={userType}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Main Content */}
        <div className='flex flex-col flex-1 w-full overflow-x-hidden'>
          {/* Mobile Hamburger Only */}
          <div className='sticky top-0 z-30 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-border flex items-center justify-between px-4 py-2'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className='p-2 rounded-lg bg-muted hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary transition md:hidden'
                aria-label='Open sidebar'
              >
                <Menu className='h-6 w-6 text-primary' />
              </button>
              <span className='text-base font-semibold text-primary'>
                {userType === 'vendor' ? 'BOJJ Vendor' : 'BOJJ Customer'}
              </span>
            </div>
            <Link to='/' tabIndex={-1} className='ml-auto'>
              <Button
                variant='ghost'
                className='gap-2 px-4 py-2 rounded-lg backdrop-blur bg-white/60 dark:bg-gray-900/60 border border-border shadow hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors'
              >
                <Globe className='w-5 h-5' />
                <span>Explore Site</span>
              </Button>
            </Link>
          </div>
          {/* Main Page */}
          <main className='flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 w-full bg-background'>
            <div className='max-w-7xl mx-auto w-full'>
              <div className='w-full'>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
