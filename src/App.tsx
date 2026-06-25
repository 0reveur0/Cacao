/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { Coffee } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse" style={{ backgroundColor: '#C5A880' }}>
            <Coffee className="w-8 h-8" style={{ color: '#1C120F' }} />
          </div>
          <p className="text-sm" style={{ color: '#8E7F73' }}>Dang tai...</p>
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
