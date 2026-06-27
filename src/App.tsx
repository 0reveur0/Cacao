/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import FeedPage from './pages/FeedPage';
import AssignmentPage from './pages/AssignmentPage';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'admin' | 'feed' | 'assignments';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      setCurrentPage(profile.role === 'ADMIN' ? 'admin' : 'dashboard');
    } else if (user && !profile) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('landing');
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
            style={{ backgroundColor: '#F5EBE0' }}
          >
            <span className="text-2xl">☕</span>
          </div>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  switch (currentPage) {
    case 'landing':
      return (
        <LandingPage
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      );
    case 'login':
      return <LoginPage onNavigateToRegister={() => setCurrentPage('register')} />;
    case 'register':
      return <RegisterPage onNavigateToLogin={() => setCurrentPage('login')} />;
    case 'admin':
      return (
        <AdminPage
          onExit={() => setCurrentPage('dashboard')}
          onNavigateToFeed={() => setCurrentPage('feed')}
        />
      );
    case 'feed':
      return <FeedPage onBack={() => setCurrentPage(profile?.role === 'ADMIN' ? 'admin' : 'dashboard')} />;
    case 'assignments':
      return <AssignmentPage onBack={() => setCurrentPage('dashboard')} />;
    case 'dashboard':
      return (
        <DashboardPage
          onNavigateToAdmin={profile?.role === 'ADMIN' ? () => setCurrentPage('admin') : undefined}
          onNavigateToFeed={() => setCurrentPage('feed')}
          onNavigateToAssignments={() => setCurrentPage('assignments')}
        />
      );
    default:
      return (
        <LandingPage
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      );
  }
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProgressProvider>
          <AppContent />
        </ProgressProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
