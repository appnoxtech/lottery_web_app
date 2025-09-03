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
  Winners,
  ProfileLayout,
  EditProfile,
  ChangePassword,
  Transactions,
  TermsConditions,
  PrivacyPolicy,
  LotteryRules,
  DeleteAccount
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
          {/* Profile Nested Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="edit" replace />} /> {/* Default child route */}
            <Route path="edit" element={<EditProfile />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="terms" element={<TermsConditions />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="rules" element={<LotteryRules />} />
            <Route path="delete" element={<DeleteAccount />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} /> {/* Change default to home for logged-in users */}
          <Route path="*" element={<Navigate to="/home" replace />} /> {/* Catch all for protected */}        
        </Routes>
      </div>
    </Router>
  );
}

export default App;
