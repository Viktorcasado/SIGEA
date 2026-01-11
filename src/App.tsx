import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CertificatesPage from './pages/CertificatesPage';
import './theme/globals.css';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center glass-bg">Carregando SIGEA...</div>;
    if (!session) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const AppRoutes = () => {
    const { session } = useAuth();

    return (
        <Routes>
            <Route path="/" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />
            <Route path="/certificates" element={
                <ProtectedRoute>
                    <CertificatesPage />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
