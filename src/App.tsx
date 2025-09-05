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
import PaymentManagement from './pages/admin/PaymentManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import SupportTickets from './pages/admin/SupportTickets';

// Customer Features
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerJobsPage from './pages/customer/CustomerJobsPage';
import JobPostingForm from './pages/customer/JobPostingForm';
import JobDetailPage from './pages/customer/JobDetailPage';
import JobDetailsPage from './pages/customer/JobDetailsPage';
import BidsPage from './pages/customer/BidsPage';
import JobCRUD from './pages/customer/JobCRUD';
import CustomerPaymentPage from './pages/customer/CustomerPaymentPage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';

// Vendor Features
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorJobsPage from './pages/vendor/VendorJobsPage';
import VendorBidsPage from './pages/vendor/VendorBidsPage';
import VendorProfileManagement from './pages/vendor/VendorProfileManagement';
import VendorProfilePage from './pages/vendor/VendorProfilePage';
import VendorJobDetailPage from './pages/vendor/VendorJobDetailPage';
import SubmitBidPage from './pages/vendor/SubmitBidPage';

// Shared Features
import MessagesPage from './pages/shared/MessagesPage';
import PaymentsPage from './pages/shared/PaymentsPage';

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
                  <Route path='/' element={<HomePage />} />
                  <Route path='/login' element={<LoginPage />} />
                  <Route path='/signup' element={<SignUpPage />} />
                  <Route path='/about' element={<AboutPage />} />
                  <Route path='/faq' element={<FAQPage />} />
                  <Route path='/contact' element={<ContactPage />} />
                  <Route path='/support' element={<SupportPage />} />
                  <Route path='/vendor/:id' element={<VendorProfilePage />} />
                </Route>

                {/* Protected Admin routes - Only ADMIN users can access */}
                <Route element={<AdminProtectedRoute />}>
                  <Route
                    path='/admin/*'
                    element={
                      <AdminLayout>
                        <Routes>
                          <Route path='/' element={<AdminDashboard />} />
                          <Route path='/users' element={<UserManagement />} />
                          <Route path='/jobs' element={<JobManagement />} />
                          <Route
                            path='/vendors'
                            element={<VendorManagement />}
                          />
                          <Route
                            path='/customers'
                            element={<CustomerManagement />}
                          />
                          <Route
                            path='/payments'
                            element={<PaymentManagement />}
                          />
                          <Route path='/analytics' element={<Analytics />} />
                          <Route path='/settings' element={<Settings />} />
                          <Route path='/support' element={<SupportTickets />} />
                        </Routes>
                      </AdminLayout>
                    }
                  />
                </Route>

                {/* Protected customer routes - Only authenticated CUSTOMER users can access */}
                <Route element={<ProtectedRoute />}>
                  <Route
                    path='/customer/*'
                    element={
                      <CustomerProvider>
                        <CustomerLayout>
                          <Routes>
                            <Route path='/' element={<CustomerDashboard />} />
                            <Route
                              path='/jobs'
                              element={<CustomerJobsPage />}
                            />
                            <Route
                              path='/jobs/post'
                              element={<JobPostingForm />}
                            />
                            <Route
                              path='/jobs/:id/details'
                              element={<JobDetailsPage />}
                            />
                            <Route
                              path='/messages'
                              element={<MessagesPage />}
                            />
                            <Route
                              path='/payments'
                              element={<CustomerPaymentPage />}
                            />
                            <Route
                              path='/payment/:jobId'
                              element={<CustomerPaymentPage />}
                            />
                            <Route path='/support' element={<SupportPage />} />
                            <Route
                              path='/jobs/new'
                              element={<JobPostingForm />}
                            />
                            <Route
                              path='/jobs/:id/edit'
                              element={<JobPostingForm />}
                            />
                            <Route
                              path='/jobs/:id'
                              element={<JobDetailPage />}
                            />
                            <Route
                              path='/jobs/:id/bids'
                              element={<BidsPage />}
                            />
                            <Route
                              path='/jobs/:id/bid'
                              element={<SubmitBidPage />}
                            />
                            <Route
                              path='/profile'
                              element={<CustomerDashboard />}
                            />
                          </Routes>
                        </CustomerLayout>
                      </CustomerProvider>
                    }
                  />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route
                    path='/customer-dashboard/*'
                    element={
                      <CustomerProvider>
                        <CustomerLayout>
                          <Routes>
                            <Route path='/' element={<CustomerDashboard />} />
                            <Route
                              path='/jobs'
                              element={<CustomerJobsPage />}
                            />
                            <Route
                              path='/jobs/post'
                              element={<JobPostingForm />}
                            />
                            <Route
                              path='/jobs/:id/details'
                              element={<JobDetailsPage />}
                            />
                            <Route
                              path='/messages'
                              element={<MessagesPage />}
                            />
                            <Route
                              path='/jobs/:jobId/payment'
                              element={<CustomerPaymentPage />}
                            />
                            <Route
                              path='/jobs/:jobId/payment-success'
                              element={<PaymentSuccessPage />}
                            />
                            <Route path='/support' element={<SupportPage />} />
                            <Route
                              path='/jobs/new'
                              element={<JobPostingForm />}
                            />
                            <Route
                              path='/jobs/:id/edit'
                              element={<JobPostingForm />}
                            />
                            <Route
                              path='/jobs/:id'
                              element={<JobDetailPage />}
                            />
                            <Route
                              path='/jobs/:id/bids'
                              element={<BidsPage />}
                            />
                            <Route
                              path='/jobs/:id/bid'
                              element={<SubmitBidPage />}
                            />
                            <Route
                              path='/profile'
                              element={<CustomerDashboard />}
                            />
                          </Routes>
                        </CustomerLayout>
                      </CustomerProvider>
                    }
                  />
                </Route>

                {/* Protected vendor routes - Only authenticated VENDOR users can access */}
                <Route element={<ProtectedRoute />}>
                  <Route
                    path='/vendor-dashboard/*'
                    element={
                      <VendorLayout>
                        <Routes>
                          <Route path='/' element={<VendorDashboard />} />
                          <Route path='/jobs' element={<VendorJobsPage />} />
                          <Route
                            path='/jobs/search'
                            element={<VendorJobsPage />}
                          />
                          <Route path='/bids' element={<VendorBidsPage />} />
                          <Route
                            path='/profile'
                            element={<VendorProfileManagement />}
                          />
                          <Route path='/messages' element={<MessagesPage />} />
                          <Route path='/earnings' element={<PaymentsPage />} />
                          <Route path='/support' element={<SupportPage />} />
                          <Route
                            path='/jobs/:id/view'
                            element={<JobDetailPage />}
                          />
                          <Route
                            path='/jobs/:id/bid'
                            element={<SubmitBidPage />}
                          />
                          <Route
                            path='/bids/:id/view'
                            element={<VendorJobDetailPage />}
                          />
                        </Routes>
                      </VendorLayout>
                    }
                  />
                </Route>

                {/* 404 - Catch all unmatched routes */}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Router>
          </ChatProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
