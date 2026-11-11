import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import BrowseDonationsPage from './pages/BrowseDonationsPage';
import DonationDetailsPage from './pages/DonationDetailsPage';
import DonateItemPage from './pages/DonateItemPage';
import EditDonationPage from './pages/EditDonationPage';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import NotificationsPage from './pages/NotificationsPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-cream-100 text-charcoal-800 font-sans selection:bg-forest-100 selection:text-forest-900">
              <Navbar />
              
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/donations" element={<BrowseDonationsPage />} />
                  <Route path="/donations/:id" element={<DonationDetailsPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Protected user routes */}
                  <Route
                    path="/donate"
                    element={
                      <ProtectedRoute>
                        <DonateItemPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-donation/:id"
                    element={
                      <ProtectedRoute>
                        <EditDonationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/donor-dashboard"
                    element={
                      <ProtectedRoute>
                        <DonorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/receiver-dashboard"
                    element={
                      <ProtectedRoute>
                        <ReceiverDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Route */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />

              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#292D2A',
                    color: '#F7F5EF',
                    fontSize: '12px',
                    borderRadius: '12px',
                    border: '1px solid #434743'
                  },
                  success: {
                    iconTheme: {
                      primary: '#4e826e',
                      secondary: '#F7F5EF'
                    }
                  },
                  error: {
                    iconTheme: {
                      primary: '#e11d48',
                      secondary: '#F7F5EF'
                    }
                  }
                }}
              />
            </div>
          </WishlistProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
