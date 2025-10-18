import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import CustomerProvider from '@/contexts/CustomerContext';
import { ChatProvider } from '@/contexts/ChatContext';

// Layout Components
import MainLayout from './layouts/MainLayout';
import CustomerLayout from './layouts/CustomerLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Protected Route Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Pages
import HomePage from './pages/shared/HomePage';
import LoginPage from './pages/shared/LoginPage';
import SignUpPage from './pages/shared/SignUpPage';
import AboutPage from './pages/shared/AboutPage';
import FAQPage from './pages/shared/FAQPage';
import ContactPage from './pages/shared/ContactPage';
import SupportPage from './pages/shared/SupportPage';
import NotFound from './pages/shared/NotFound';

// Admin Features - Import admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';
import VendorManagement from './pages/admin/VendorManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import AdminSupportTickets from './pages/admin/SupportTickets';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import CustomerSupportTickets from './pages/customer/SupportTickets';
import VendorSupportTickets from './pages/vendor/SupportTickets';

// Customer Features
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerJobsPage from './pages/customer/CustomerJobsPage';
import JobPostingForm from './pages/customer/JobPostingForm';
import JobDetailsPage from './pages/customer/JobDetailsPage';
import BidsPage from './pages/customer/BidsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Vendor Features
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorJobsPage from './pages/vendor/VendorJobsPage';
import VendorBidsPage from './pages/vendor/VendorBidsPage';
import VendorProfileManagement from './pages/vendor/VendorProfileManagement';
import VendorProfilePage from './pages/vendor/VendorProfilePage';
import VendorProfileSetup from './pages/vendor/VendorProfileSetup';
import VendorJobDetailPage from './pages/vendor/VendorJobDetailPage';
import SubmitBidPage from './pages/vendor/SubmitBidPage';

// Shared Features
import MessagesPage from './pages/shared/MessagesPage';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <ChatProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route
                    path="/vendor/public/:id"
                    element={<VendorProfilePage />}
                  />
                </Route>

                {/* Protected Admin routes - Only ADMIN users can access */}
                <Route element={<AdminProtectedRoute />}>
                  <Route
                    path="/admin/*"
                    element={
                      <AdminLayout>
                        <Routes>
                          <Route path="/" element={<AdminDashboard />} />
                          <Route path="/users" element={<UserManagement />} />
                          <Route path="/jobs" element={<JobManagement />} />
                          <Route
                            path="/vendors"
                            element={<VendorManagement />}
                          />
                          <Route
                            path="/customers"
                            element={<CustomerManagement />}
                          />
                          <Route
                            path="/support"
                            element={<AdminSupportTickets />}
                          />
                          <Route
                            path="/profile"
                            element={<AdminProfilePage />}
                          />
                        </Routes>
                      </AdminLayout>
                    }
                  />
                </Route>

                {/* Protected customer routes - Only authenticated CUSTOMER users can access */}
                <Route element={<RoleBasedRoute allowedRoles={['CUSTOMER']} />}>
                  <Route
                    path="/customer/*"
                    element={
                      <CustomerProvider>
                        <CustomerLayout>
                          <Routes>
                            <Route path="/" element={<CustomerDashboard />} />
                            <Route
                              path="/jobs"
                              element={<CustomerJobsPage />}
                            />
                            <Route
                              path="/jobs/post"
                              element={<JobPostingForm />}
                            />
                            <Route
                              path="/jobs/:id/details"
                              element={<JobDetailsPage />}
                            />
                            <Route
                              path="/messages"
                              element={<MessagesPage />}
                            />
                            <Route
                              path="/support"
                              element={<CustomerSupportTickets />}
                            />
                            <Route
                              path="/support/contact"
                              element={<SupportPage />}
                            />
                            <Route
                              path="/jobs/new"
                              element={<JobPostingForm />}
                            />
                            <Route
                              path="/jobs/:id/edit"
                              element={<JobPostingForm />}
                            />
                            <Route
                              path="/jobs/:id"
                              element={<JobDetailsPage />}
                            />
                            <Route
                              path="/jobs/:id/bids"
                              element={<BidsPage />}
                            />
                            <Route
                              path="/jobs/:id/bid"
                              element={<SubmitBidPage />}
                            />
                            <Route
                              path="/profile"
                              element={<CustomerProfilePage />}
                            />
                          </Routes>
                        </CustomerLayout>
                      </CustomerProvider>
                    }
                  />
                </Route>

                {/* Protected vendor routes - Only authenticated VENDOR users can access */}
                <Route element={<RoleBasedRoute allowedRoles={['VENDOR']} />}>
                  <Route
                    path="/vendor/*"
                    element={
                      <VendorLayout>
                        <Routes>
                          <Route path="/" element={<VendorDashboard />} />
                          <Route path="/jobs" element={<VendorJobsPage />} />
                          <Route
                            path="/jobs/search"
                            element={<VendorJobsPage />}
                          />
                          <Route path="/bids" element={<VendorBidsPage />} />
                          <Route
                            path="/profile"
                            element={<VendorProfileManagement />}
                          />
                          <Route
                            path="/profile/setup"
                            element={<VendorProfileSetup />}
                          />
                          <Route path="/messages" element={<MessagesPage />} />
                          <Route
                            path="/support"
                            element={<VendorSupportTickets />}
                          />
                          <Route
                            path="/support/contact"
                            element={<SupportPage />}
                          />
                          <Route
                            path="/jobs/:id/view"
                            element={<JobDetailsPage />}
                          />
                          <Route
                            path="/jobs/:id/bid"
                            element={<SubmitBidPage />}
                          />
                          <Route
                            path="/bids/:id/view"
                            element={<JobDetailsPage />}
                          />
                        </Routes>
                      </VendorLayout>
                    }
                  />
                </Route>

                {/* 404 - Catch all unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ChatProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
