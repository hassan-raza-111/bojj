import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginPage from "./features/shared/LoginPage";
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import HomePage from "./features/shared/HomePage";
import SignUpPage from "./features/shared/SignUpPage";
import CustomerDashboard from "./features/customer/CustomerDashboard";
import VendorDashboard from "./features/vendor/VendorDashboard";
import MessagesPage from "./features/shared/MessagesPage";
import JobPostingPage from "./features/customer/JobPostingPage";
import VendorProfilePage from "./features/vendor/VendorProfilePage";
import PaymentsPage from "./features/shared/PaymentsPage";
import AboutPage from "./features/shared/AboutPage";
import FAQPage from "./features/shared/FAQPage";
import ContactPage from "./features/shared/ContactPage";
import NotFound from "./features/shared/NotFound";
import SupportPage from "./features/shared/SupportPage"; // New Support Page
import AdminDashboard from "./features/shared/AdminDashboard";
import JobDetailPage from "./features/customer/JobDetailPage";
import BidsPage from "./features/customer/BidsPage";
import SubmitBidPage from "./features/vendor/SubmitBidPage";
import VendorJobDetailPage from "./features/vendor/VendorJobDetailPage";
import VendorDetailPage from "./features/vendor/VendorDetailPage";
import CustomerPaymentPage from "./features/customer/customerpaymentpage";

// Layout Components
import MainLayout from "./components/layouts/MainLayout";
import JobCRUD from "./features/customer/JobCrud";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin route OUTSIDE MainLayout so it has no Navbar/Footer */}
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/support" element={<SupportPage />} /> {/* New Support Route */}
              <Route path="/vendor/:id" element={<VendorProfilePage />} />
            </Route>
            
            {/* Protected customer routes */}
            <Route path="/customer/*" element={
              <>
                <SignedIn>
                  <DashboardLayout userType="customer">
                    <Routes>
                      <Route path="/" element={<CustomerDashboard />} />
                      <Route path="/jobs" element={<JobCRUD />} />
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/payments" element={<CustomerPaymentPage />} />
                      <Route path="/support" element={<SupportPage />} /> {/* New Support Route in customer dashboard */}
                      <Route path="/jobs/new" element={<JobPostingPage />} />
                      <Route path="/jobs/:id/edit" element={<JobPostingPage />} />
                      <Route path="/jobs/:id" element={<JobDetailPage />} />
                      <Route path="/jobs/:id/bids" element={<BidsPage />} />
                      <Route path="/jobs/:id/bid" element={<SubmitBidPage />} />
                    </Routes>
                  </DashboardLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } />
            
            {/* Protected vendor routes */}
            <Route path="/vendor-dashboard/*" element={
              <>
                <SignedIn>
                  <DashboardLayout userType="vendor">
                    <Routes>
                      <Route path="/" element={<VendorDashboard />} />
                      <Route path="/jobs" element={<VendorDashboard />} />
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/earnings" element={<PaymentsPage />} />
                      <Route path="/support" element={<SupportPage />} /> {/* New Support Route in vendor dashboard */}
                      <Route path="/jobs/:id/view" element={<JobDetailPage />} />
                      <Route path="/jobs/:id/bid" element={<SubmitBidPage />} />
                      <Route path="/bids/:id/view" element={<VendorJobDetailPage />} />
                    </Routes>
                  </DashboardLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } />
            
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route index element={
                <DashboardLayout userType="vendor">
                  <VendorDashboard />
                </DashboardLayout>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
