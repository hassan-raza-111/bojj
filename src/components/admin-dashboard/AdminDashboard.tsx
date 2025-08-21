import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  Layers,
  LogOut,
  Menu,
  Settings,
  BarChart3,
  Search,
  Bell,
  User,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import all admin page components
import DashboardOverview from './DashboardOverview';
import VendorManagement from './VendorManagement';
import CustomerManagement from './CustomerManagement';
import JobManagement from './JobManagement';
import PaymentManagement from './PaymentManagement';
import CategoryManagement from './CategoryManagement';
import AnalyticsReports from './AnalyticsReports';
import SettingsManagement from './SettingsManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='lg:hidden'
            >
              <Menu className='h-5 w-5' />
            </Button>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>B</span>
              </div>
              <h1 className='text-xl font-semibold text-gray-900'>
                BOJJ Admin
              </h1>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            {/* Search */}
            <div className='relative hidden md:block'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>

            {/* Notifications */}
            <Button variant='ghost' size='sm' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
            </Button>

            {/* User Menu */}
            <div className='flex items-center space-x-3'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className='bg-blue-100 text-blue-600'>
                  {currentUser.firstName?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className='hidden md:block'>
                <p className='text-sm font-medium text-gray-900'>
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className='text-xs text-gray-500'>Administrator</p>
              </div>
              <Button variant='ghost' size='sm' onClick={handleLogout}>
                <LogOut className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static lg:translate-x-0 z-30 w-64 bg-white border-r border-gray-200 h-screen transition-transform duration-300 ease-in-out lg:block`}
        >
          <nav className='p-6'>
            <div className='space-y-2'>
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('overview')}
              >
                <Home className='h-4 w-4 mr-3' />
                Dashboard Overview
              </Button>

              <Button
                variant={activeTab === 'vendors' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('vendors')}
              >
                <Users className='h-4 w-4 mr-3' />
                Vendors Management
              </Button>

              <Button
                variant={activeTab === 'customers' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('customers')}
              >
                <User className='h-4 w-4 mr-3' />
                Customers Management
              </Button>

              <Button
                variant={activeTab === 'jobs' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('jobs')}
              >
                <Briefcase className='h-4 w-4 mr-3' />
                Jobs Management
              </Button>

              <Button
                variant={activeTab === 'payments' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('payments')}
              >
                <DollarSign className='h-4 w-4 mr-3' />
                Payments Management
              </Button>

              <Button
                variant={activeTab === 'categories' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('categories')}
              >
                <Layers className='h-4 w-4 mr-3' />
                Categories Management
              </Button>

              <Button
                variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className='h-4 w-4 mr-3' />
                Analytics & Reports
              </Button>

              <Button
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setActiveTab('settings')}
              >
                <Settings className='h-4 w-4 mr-3' />
                Settings
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-6'>
          {/* Page Header */}
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'vendors' && 'Vendors Management'}
              {activeTab === 'customers' && 'Customers Management'}
              {activeTab === 'jobs' && 'Jobs Management'}
              {activeTab === 'payments' && 'Payments Management'}
              {activeTab === 'categories' && 'Categories Management'}
              {activeTab === 'analytics' && 'Analytics & Reports'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
            <p className='text-gray-600'>
              {activeTab === 'overview' &&
                'Monitor your platform performance and recent activities'}
              {activeTab === 'vendors' &&
                'Manage vendor accounts, approvals, and verifications'}
              {activeTab === 'customers' &&
                'Manage customer accounts and preferences'}
              {activeTab === 'jobs' &&
                'Oversee job postings, assignments, and completions'}
              {activeTab === 'payments' &&
                'Monitor transactions, escrow, and payment releases'}
              {activeTab === 'categories' &&
                'Manage service categories and subcategories'}
              {activeTab === 'analytics' &&
                'View detailed reports and platform analytics'}
              {activeTab === 'settings' &&
                'Configure platform settings and preferences'}
            </p>
          </div>

          {/* Page Content */}
          <div className='space-y-6'>
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'vendors' && <VendorManagement />}
            {activeTab === 'customers' && <CustomerManagement />}
            {activeTab === 'jobs' && <JobManagement />}
            {activeTab === 'payments' && <PaymentManagement />}
            {activeTab === 'categories' && <CategoryManagement />}
            {activeTab === 'analytics' && <AnalyticsReports />}
            {activeTab === 'settings' && <SettingsManagement />}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
