import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployerTasks from './pages/EmployerTasks';
import CreateTask from './pages/CreateTask';
import VirtualHRTasks from './pages/VirtualHRTasks';
import TaskDetails from './pages/TaskDetails';
import Interviews from './pages/Interviews';
import ScheduleInterview from './pages/ScheduleInterview';
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role?.toLowerCase())) {
    // If Virtual HR attempts to open employer tasks directly, redirect to their workspace
    if (user.role?.toLowerCase() === 'virtual_hr') {
      return <Navigate to="/virtual-hr/tasks" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Route Guard (redirects already logged-in users)
function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role?.toLowerCase() === 'virtual_hr' ? '/virtual-hr/tasks' : '/dashboard'}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Root Redirect */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Authenticated Dashboard Shell */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Employer Specific Routes */}
            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/create"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <CreateTask />
                </ProtectedRoute>
              }
            />

            {/* Virtual HR Dedicated Workspace */}
            <Route
              path="/virtual-hr/tasks"
              element={
                <ProtectedRoute allowedRoles={['virtual_hr', 'employer']}>
                  <VirtualHRTasks />
                </ProtectedRoute>
              }
            />

            {/* Shared Task Details */}
            <Route path="/tasks/:id" element={<TaskDetails />} />

            {/* Interviews Management */}
            <Route path="/interviews" element={<Interviews />} />
            <Route
              path="/interviews/schedule"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <ScheduleInterview />
                </ProtectedRoute>
              }
            />

            {/* 404 Inside Layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
