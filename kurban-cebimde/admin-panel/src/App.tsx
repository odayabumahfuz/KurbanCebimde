import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StreamsPage from './pages/StreamsPage';
import StreamDetailPage from './pages/StreamDetailPage';
import StreamViewerPage from './pages/StreamViewerPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import BackendStatusPage from './pages/BackendStatusPage';
import AdminProfilePage from './pages/AdminProfilePage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import CertificatesPage from './pages/CertificatesPage';
import CatalogPage from './pages/CatalogPage';
import AuditLogsPage from './pages/AuditLogsPage';
import OrdersPage from './pages/OrdersPage';
import DonationsPage from './pages/DonationsPage';

import { adminApi } from './lib/adminApi';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = adminApi.isAuthenticated();
  console.log('🛡️ ProtectedRoute kontrolü:', isAuth);
  
  if (!isAuth) {
    console.log('❌ Not authenticated, redirecting to login...');
    return <Navigate to="/admin/login" replace />;
  }
  
  console.log('✅ Authenticated, rendering children...');
  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute>
              <AdminProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/streams" 
          element={
            <ProtectedRoute>
              <StreamsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/streams/:id" 
          element={
            <ProtectedRoute>
              <StreamDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stream/:streamId" 
          element={
            <ProtectedRoute>
              <StreamViewerPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/backend-status" 
          element={
            <ProtectedRoute>
              <BackendStatusPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/certificates" 
          element={
            <ProtectedRoute>
              <CertificatesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/catalog" 
          element={
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/audit-logs" 
          element={
            <ProtectedRoute>
              <AuditLogsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/donations" 
          element={
            <ProtectedRoute>
              <DonationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/carts" 
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } 
        />

        
        {/* Redirect root to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
