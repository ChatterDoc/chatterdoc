
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import Dashboard from './pages/Dashboard';
import Customize from './pages/Customize';
import Demo from './pages/Demo';
import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import { Toaster } from '@/components/ui/toaster';
import Credits from './pages/Credits';
import PaymentSuccess from './pages/PaymentSuccess';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import AuthCallback from './pages/AuthCallback';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/customize"
            element={
              <PrivateRoute>
                <Customize />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/demo"
            element={
              <PrivateRoute>
                <Demo />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/credits"
            element={
              <PrivateRoute>
                <Credits />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/payment-success"
            element={
              <PrivateRoute>
                <PaymentSuccess />
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
