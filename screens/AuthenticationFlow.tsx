import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import AuthScreen from './AuthScreen';
import ResetPasswordScreen from './ResetPasswordScreen';

const AuthenticationFlow: React.FC = () => {
    const [view, setView] = useState<'welcome' | 'auth' | 'resetPassword'>('welcome');
    const [initialAuthView, setInitialAuthView] = useState<'login' | 'register'>('login');

    const handleLoginClick = () => {
        setInitialAuthView('login');
        setView('auth');
    };

    const handleRegisterClick = () => {
        setInitialAuthView('register');
        setView('auth');
    };

    const handleForgotPasswordClick = () => {
        setView('resetPassword');
    };

    const handleBackToAuth = () => {
        setInitialAuthView('login');
        setView('auth');
    }

    const handleBackToWelcome = () => {
        setView('welcome');
    };

    if (view === 'welcome') {
        return <WelcomeScreen onLogin={handleLoginClick} onRegister={handleRegisterClick} />;
    }
    
    if (view === 'resetPassword') {
        return <ResetPasswordScreen onBack={handleBackToAuth} />;
    }

    return <AuthScreen initialView={initialAuthView} onBack={handleBackToWelcome} onForgotPassword={handleForgotPasswordClick} />;
};

export default AuthenticationFlow;
