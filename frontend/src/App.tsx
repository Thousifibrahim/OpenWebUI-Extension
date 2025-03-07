import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/store';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import IntegratedDashboard from './pages/IntegratedDashboard';
import SystemStatus from './pages/SystemStatus';

const App: React.FC = () => {
  const { 
    user, 
    isDarkMode
  } = useStore();

  // Simplified - skip loading for testing
  // const { isLoading, initializeAuth, checkServerConnection } = useStore();

  // useEffect(() => {
  //   // Initialize authentication and check server connection
  //   const init = async () => {
  //     try {
  //       await Promise.all([
  //         initializeAuth(),
  //         checkServerConnection()
  //       ]);
  //     } catch (error) {
  //       console.error('Initialization error:', error);
  //     }
  //   };
    
  //   init();
  // }, [initializeAuth, checkServerConnection]);

  // Skip loading for now
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-900 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-white">Loading CenAI...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={<LandingPage />} 
        />
        
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <IntegratedDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/status" 
          element={
            user ? (
              <SystemStatus />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* All other routes redirect to dashboard for integrated experience */}
        <Route 
          path="/chat/*" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/api-keys" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/image-generation" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/history" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/create-galaxy" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Temporarily disabled other routes until components are fixed */}
        
        {/* Default redirect - removed since we now have landing page as root */}
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <Navigate to={user ? "/dashboard" : "/"} replace />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;