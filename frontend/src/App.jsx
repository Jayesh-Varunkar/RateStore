import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminStores from './pages/admin/Stores';

// User Pages
import UserStores from './pages/user/StoreList';
import UserProfile from './pages/user/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Shared Pages
import Unauthorized from './pages/shared/Unauthorized';
import NotFound from './pages/shared/NotFound';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Layout Wrapper for Authenticated Routes */}
            <Route element={<Layout />}>
              
              {/* Default Redirect Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUserDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stores"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminStores />
                  </ProtectedRoute>
                }
              />

              {/* Owner Routes */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Regular Customer User Routes */}
              <Route
                path="/user/stores"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserStores />
                  </ProtectedRoute>
                }
              />

              {/* Shared Profile & Security Routes */}
              <Route
                path="/user/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user', 'owner']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
