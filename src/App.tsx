/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

type Page = 'login' | 'register' | 'dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');

  useEffect(() => {
    if (user && !loading) {
      setCurrentPage('dashboard');
    } else if (!loading) {
      setCurrentPage('login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#F5EBE0' }}>
            <span className="text-2xl">☕</span>
          </div>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>Dang tai...</p>
        </div>
      </div>
    );
  }

  const handleNavigateToRegister = () => setCurrentPage('register');
  const handleNavigateToLogin = () => setCurrentPage('login');

  switch (currentPage) {
    case 'login':
      return <LoginPage onNavigateToRegister={handleNavigateToRegister} />;
    case 'register':
      return <RegisterPage onNavigateToLogin={handleNavigateToLogin} />;
    case 'dashboard':
      return <DashboardPage />;
    default:
      return <LoginPage onNavigateToRegister={handleNavigateToRegister} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
