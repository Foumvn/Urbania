import { Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './context/FormContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthLoadingProvider } from './context/AuthLoadingProvider';
import { Toaster } from './components/ui/toaster';

// Pages
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import Wizard from './components/Wizard/Wizard';
import UserDashboard from './components/Dashboard/UserDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import Profile from './components/User/Profile';
import Settings from './components/User/Settings';

// Admin Pages
import AdminLandingPage from './components/Admin/AdminLandingPage';
import AdminLogin from './components/Admin/AdminLogin';
import AdminRegister from './components/Admin/AdminRegister';

import { Box, CircularProgress } from '@mui/material';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return null;


    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Auth Route (redirect if already logged in)
function AuthRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;


    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={
                <AuthRoute>
                    <Login />
                </AuthRoute>
            } />
            <Route path="/auth/register" element={
                <AuthRoute>
                    <Register />
                </AuthRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <UserDashboard />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/formulaire" element={
                <ProtectedRoute>
                    <Wizard />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                    <Layout>
                        <AdminDashboard />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <Layout>
                        <Profile />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/settings" element={
                <ProtectedRoute>
                    <Layout>
                        <Settings />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* New Admin Auth Routes */}
            <Route path="/admin-portal" element={<AdminLandingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}




function App() {
    return (
        <I18nProvider>
            <AuthLoadingProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <FormProvider>
                            <AppRoutes />
                            <Toaster />
                        </FormProvider>
                    </AuthProvider>
                </NotificationProvider>
            </AuthLoadingProvider>
        </I18nProvider>
    );
}

export default App;

