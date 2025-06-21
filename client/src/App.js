import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Import pages
import Dashboard from './pages/Dashboard';
import HealthChat from './pages/HealthChat';
import Telemedicine from './pages/Telemedicine';
import MedicationManager from './pages/MedicationManager';
import HealthAnalytics from './pages/HealthAnalytics';
import AppointmentScheduler from './pages/AppointmentScheduler';
import PatientProfile from './pages/PatientProfile';
import DoctorProfile from './pages/DoctorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Import context and hooks
import { AuthProvider } from './contexts/AuthContext';
import { HealthProvider } from './contexts/HealthContext';
import { useAuth } from './hooks/useAuth';

// Import styles
import './styles/globals.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Main App Layout Component
const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      <div className="flex">
        {user && <Sidebar />}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <AppLayout>{children}</AppLayout>;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HealthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                
                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><HealthChat /></ProtectedRoute>} />
                <Route path="/telemedicine" element={<ProtectedRoute><Telemedicine /></ProtectedRoute>} />
                <Route path="/medications" element={<ProtectedRoute><MedicationManager /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><HealthAnalytics /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><AppointmentScheduler /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
                <Route path="/doctor/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Global Toaster */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </HealthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 