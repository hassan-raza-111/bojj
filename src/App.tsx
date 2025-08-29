import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import CustomerProvider from '@/contexts/CustomerContext';

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import CustomerLayout from './layouts/CustomerLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Protected Route Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// Pages
import HomePage from './features/shared/HomePage';
import LoginPage from './features/shared/LoginPage';
import SignUpPage from './features/shared/SignUpPage';
import AboutPage from './features/shared/AboutPage';
import FAQPage from './features/shared/FAQPage';
import ContactPage from './features/shared/ContactPage';
import SupportPage from './features/shared/SupportPage';
import NotFound from './features/shared/NotFound';

// Admin Features - Import all admin pages
import AdminDashboard from './features/admin/AdminDashboard';
import UserManagement from './features/admin/UserManagement';
import JobManagement from './features/admin/JobManagement';
import VendorManagement from './features/admin/VendorManagement';
import CustomerManagement from './features/admin/CustomerManagement';
import PaymentManagement from './features/admin/PaymentManagement';
import Analytics from './features/admin/Analytics';
import Settings from './features/admin/Settings';
import SupportTickets from './features/admin/SupportTickets';

// Customer Features
import CustomerDashboard from './features/customer/CustomerDashboard';
import JobPostingPage from './features/customer/JobPostingPage';
import JobDetailPage from './features/customer/JobDetailPage';
import BidsPage from './features/customer/BidsPage';
import JobCRUD from './features/customer/JobCRUD';
import CustomerPaymentPage from './features/customer/customerpaymentpage';

// Vendor Features
import VendorDashboard from './features/vendor/VendorDashboard';
import VendorJobsPage from './features/vendor/VendorJobsPage';
import VendorBidsPage from './features/vendor/VendorBidsPage';
import VendorProfileManagement from './features/vendor/VendorProfileManagement';
import VendorProfilePage from './features/vendor/VendorProfilePage';
import VendorJobDetailPage from './features/vendor/VendorJobDetailPage';
import VendorDetailPage from './features/vendor/VendorDetailPage';
import SubmitBidPage from './features/vendor/SubmitBidPage';

// Shared Features
import MessagesPage from './features/shared/MessagesPage';
import PaymentsPage from './features/shared/PaymentsPage';

const App = () => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
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
                      <Route path='/vendors' element={<VendorManagement />} />
                      <Route
                        path='/customers'
                        element={<CustomerManagement />}
                      />
                      <Route path='/payments' element={<PaymentManagement />} />
                      <Route path='/analytics' element={<Analytics />} />
                      <Route path='/settings' element={<Settings />} />
                      <Route path='/support' element={<SupportTickets />} />
                    </Routes>
                  </AdminLayout>
                }
              />
            </Route>

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

            {/* Protected customer routes - Only authenticated CUSTOMER users can access */}
            <Route element={<ProtectedRoute />}>
              <Route
                path='/customer/*'
                element={
                  <CustomerProvider>
                    <CustomerLayout>
                      <Routes>
                        <Route path='/' element={<CustomerDashboard />} />
                        <Route path='/jobs' element={<JobCRUD />} />
                        <Route path='/messages' element={<MessagesPage />} />
                        <Route
                          path='/payments'
                          element={<CustomerPaymentPage />}
                        />
                        <Route path='/support' element={<SupportPage />} />
                        <Route path='/jobs/new' element={<JobPostingPage />} />
                        <Route
                          path='/jobs/:id/edit'
                          element={<JobPostingPage />}
                        />
                        <Route path='/jobs/:id' element={<JobDetailPage />} />
                        <Route path='/jobs/:id/bids' element={<BidsPage />} />
                        <Route
                          path='/jobs/:id/bid'
                          element={<SubmitBidPage />}
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
                      <Route path='/jobs/:id/bid' element={<SubmitBidPage />} />
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
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
