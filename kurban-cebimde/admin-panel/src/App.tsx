import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import ForbiddenPage from './pages/ForbiddenPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StreamsPage from './pages/StreamsPage';
import StreamDetailPage from './pages/StreamDetailPage';
import StreamViewerPage from './pages/StreamViewerPage';
import SettingsPage from './pages/SettingsPage';
import BackendStatusPage from './pages/BackendStatusPage';
import AdminProfilePage from './pages/AdminProfilePage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import RolesPage from './pages/RolesPage';
import CertificatesPage from './pages/CertificatesPage';
import CatalogPage from './pages/CatalogPage';
import AuditLogsPage from './pages/AuditLogsPage';
import OrdersPage from './pages/OrdersPage';
import DonationsPage from './pages/DonationsPage';
import MediaUploadPage from './pages/MediaUploadPage';

import { adminApi } from './lib/adminApi';
import { RequireRoles } from './components/RBAC';

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
              <RequireRoles roles={["admin","owner","super_admin"]}>
                <AdminDashboardPage />
              </RequireRoles>
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
              <RequireRoles roles={["admin","owner","super_admin"]}>
                <UsersPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["admin","owner"]}>
                <ReportsPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/media/upload" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["publisher","admin","owner"]}>
                <MediaUploadPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["owner","admin"]}>
                <SettingsPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/backend-status" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["owner","admin"]}>
                <BackendStatusPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["admin","owner"]}>
                <NotificationsPage />
              </RequireRoles>
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
              <RequireRoles roles={["owner","admin"]}>
                <AuditLogsPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/roles" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["owner","admin"]}>
                <RolesPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/donations" 
          element={
            <ProtectedRoute>
              <RequireRoles roles={["admin","owner","publisher"]}>
                <DonationsPage />
              </RequireRoles>
            </ProtectedRoute>
          } 
        />
        {/* Forbidden */}
        <Route path="/admin/403" element={<ForbiddenPage />} />
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
