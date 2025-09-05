import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from './sidebar-components';
import {
  Home,
  Briefcase,
  MessageSquare,
  DollarSign,
  LifeBuoy,
} from 'lucide-react';

interface SidebarProps {
  userType: 'customer' | 'vendor';
}

export const Sidebar = ({ userType }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const baseRoute = userType === 'customer' ? '/customer' : '/vendor';

  // Define navigation items based on user type
  const navItems =
    userType === 'customer'
      ? [
          { name: 'Dashboard', path: baseRoute, icon: <Home size={20} /> },
          {
            name: 'Jobs',
            path: `${baseRoute}/jobs`,
            icon: <Briefcase size={20} />,
          },
          {
            name: 'Messages',
            path: `${baseRoute}/messages`,
            icon: <MessageSquare size={20} />,
          },
          {
            name: 'Payments',
            path: `${baseRoute}/payments`,
            icon: <DollarSign size={20} />,
          },
          {
            name: 'Support',
            path: `${baseRoute}/support`,
            icon: <LifeBuoy size={20} />,
          },
        ]
      : [
          { name: 'Dashboard', path: baseRoute, icon: <Home size={20} /> },
          {
            name: 'Jobs',
            path: `${baseRoute}/jobs`,
            icon: <Briefcase size={20} />,
          },
          {
            name: 'Messages',
            path: `${baseRoute}/messages`,
            icon: <MessageSquare size={20} />,
          },
          {
            name: 'Earnings',
            path: `${baseRoute}/earnings`,
            icon: <DollarSign size={20} />,
          },
          {
            name: 'Support',
            path: `${baseRoute}/support`,
            icon: <LifeBuoy size={20} />,
          },
        ];

  // Check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <ShadcnSidebar
      variant='sidebar'
      collapsible='offcanvas'
      side='left'
      style={
        {
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '3rem',
        } as React.CSSProperties
      }
    >
      <SidebarHeader className='p-4 border-b'>
        <div className='flex justify-center items-center h-10'>
          <span className='text-2xl font-bold text-bojj-primary'>BOJJ</span>
        </div>
      </SidebarHeader>
      <SidebarContent className='p-4'>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 ${
                isActive(item.path)
                  ? 'bg-bojj-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              data-active={isActive(item.path)}
            >
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className='p-4 border-t'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-bojj-primary rounded-full flex items-center justify-center text-white text-sm font-medium'>
              {user?.firstName?.charAt(0) || userType.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className='text-sm font-medium'>
                {user?.firstName ||
                  (userType === 'customer' ? 'Customer' : 'Vendor')}
              </p>
              <p className='text-xs text-gray-500'>{user?.email}</p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={logout}
            className='ml-auto'
          >
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
