/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Profile, type UserRole } from '../types';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  session: { token: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = (token: string, authUser: AuthUser, profileData: Profile | null) => {
    localStorage.setItem('cacao-auth-token', token);
    localStorage.setItem('cacao-auth-user', JSON.stringify(authUser));
    if (profileData) {
      localStorage.setItem('cacao-auth-profile', JSON.stringify(profileData));
    }
    setSession({ token });
    setUser(authUser);
    setProfile(profileData);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('cacao-auth-token');
    const storedUser = localStorage.getItem('cacao-auth-user');
    const storedProfile = localStorage.getItem('cacao-auth-profile');

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser) as AuthUser;
      const parsedProfile = storedProfile ? (JSON.parse(storedProfile) as Profile) : null;
      setSession({ token: storedToken });
      setUser(parsedUser);
      setProfile(parsedProfile);
    }

    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: new Error(data.message ?? 'Registration failed') };
      }

      const authUser = { id: data.user?.id ?? email, email, name, role } as AuthUser;
      persistSession(data.token ?? 'local-session', authUser, data.profile ?? {
        id: authUser.id,
        email,
        name,
        role,
        locale: 'vi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: new Error(data.message ?? 'Login failed') };
      }

      const authUser = { id: data.user?.id ?? email, email, name: data.user?.name ?? email, role: data.user?.role ?? 'STUDENT' } as AuthUser;
      persistSession(data.token ?? 'local-session', authUser, data.profile ?? {
        id: authUser.id,
        email,
        name: authUser.name,
        role: authUser.role,
        locale: 'vi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signInWithGoogle = async () => {
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('cacao-auth-token');
    localStorage.removeItem('cacao-auth-user');
    localStorage.removeItem('cacao-auth-profile');
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
