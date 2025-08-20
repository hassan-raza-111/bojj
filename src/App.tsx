import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import HomePage from './features/shared/HomePage';
import LoginPage from './features/shared/LoginPage';
import SignUpPage from './features/shared/SignUpPage';
import AboutPage from './features/shared/AboutPage';
import FAQPage from './features/shared/FAQPage';
import ContactPage from './features/shared/ContactPage';
import SupportPage from './features/shared/SupportPage';
import NotFound from './features/shared/NotFound';
import AdminDashboard from './features/shared/AdminDashboard';

// Customer Features
import CustomerDashboard from './features/customer/CustomerDashboard';
import JobPostingPage from './features/customer/JobPostingPage';
import JobDetailPage from './features/customer/JobDetailPage';
import BidsPage from './features/customer/BidsPage';
import JobCRUD from './features/customer/JobCrud';
import CustomerPaymentPage from './features/customer/customerpaymentpage';

// Vendor Features
import VendorDashboard from './features/vendor/VendorDashboard';
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
            {/* Admin route OUTSIDE MainLayout so it has no Navbar/Footer */}
            <Route path='/admin' element={<AdminDashboard />} />

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

            {/* Protected customer routes */}
            <Route
              path='/customer/*'
              element={
                <DashboardLayout userType='customer'>
                  <Routes>
                    <Route path='/' element={<CustomerDashboard />} />
                    <Route path='/jobs' element={<JobCRUD />} />
                    <Route path='/messages' element={<MessagesPage />} />
                    <Route path='/payments' element={<CustomerPaymentPage />} />
                    <Route path='/support' element={<SupportPage />} />
                    <Route path='/jobs/new' element={<JobPostingPage />} />
                    <Route path='/jobs/:id/edit' element={<JobPostingPage />} />
                    <Route path='/jobs/:id' element={<JobDetailPage />} />
                    <Route path='/jobs/:id/bids' element={<BidsPage />} />
                    <Route path='/jobs/:id/bid' element={<SubmitBidPage />} />
                  </Routes>
                </DashboardLayout>
              }
            />

            {/* Protected vendor routes */}
            <Route
              path='/vendor-dashboard/*'
              element={
                <DashboardLayout userType='vendor'>
                  <Routes>
                    <Route path='/' element={<VendorDashboard />} />
                    <Route path='/jobs' element={<VendorDashboard />} />
                    <Route path='/messages' element={<MessagesPage />} />
                    <Route path='/earnings' element={<PaymentsPage />} />
                    <Route path='/support' element={<SupportPage />} />
                    <Route path='/jobs/:id/view' element={<JobDetailPage />} />
                    <Route path='/jobs/:id/bid' element={<SubmitBidPage />} />
                    <Route
                      path='/bids/:id/view'
                      element={<VendorJobDetailPage />}
                    />
                  </Routes>
                </DashboardLayout>
              }
            />

            {/* Catch all route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
