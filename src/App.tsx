import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { 
  Login, 
  Signup, 
  ForgotPassword, 
  OTPVerification, 
  ResetPassword, 
  Dashboard, 
  Home,
  NewLottery,
  Tickets,
  Winners
} from './pages';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('userToken');
  const userData = useSelector((state: RootState) => state.user.userData);
  const authStatus = useSelector((state: RootState) => state.user.authStatus);
  
  // Check both localStorage and Redux state
  const isAuthenticated = token && userData && authStatus;
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (redirect to home if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('userToken');
  const userData = useSelector((state: RootState) => state.user.userData);
  const authStatus = useSelector((state: RootState) => state.user.authStatus);
  
  // Check both localStorage and Redux state
  const isAuthenticated = token && userData && authStatus;
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/home" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/new-lottery" 
            element={
              <ProtectedRoute>
                <NewLottery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/winners" 
            element={
              <ProtectedRoute>
                <Winners />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
