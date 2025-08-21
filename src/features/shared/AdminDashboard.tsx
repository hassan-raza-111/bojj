import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  Layers,
  LogOut,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Menu,
  FileText,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Simple test component
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        toast({
          title: '✅ Backend Connected',
          description: 'Backend server is running successfully!',
        });
      } else {
        toast({
          title: '❌ Backend Error',
          description: `Backend error: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Connection Failed',
        description: 'Backend server is not running',
        variant: 'destructive',
      });
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">BOJJ Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={testBackend}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🧪 Test Backend
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4">
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <Home className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === 'vendors' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('vendors')}
              >
                <Users className="h-4 w-4 mr-2" />
                Vendors
              </Button>
              <Button
                variant={activeTab === 'customers' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('customers')}
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <Button
                variant={activeTab === 'jobs' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('jobs')}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
              </Button>
              <Button
                variant={activeTab === 'payments' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('payments')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Payments
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('categories')}
              >
                <Layers className="h-4 w-4 mr-2" />
                Categories
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground">+0% from last month</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No recent activity to display.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vendors Tab */}
            <TabsContent value="vendors">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Vendor management features will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Customer management features will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Job Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Job management features will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Payment management features will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Category management features will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
