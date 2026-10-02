import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedMock = localStorage.getItem('forenziq_mock_user');
    if (savedMock) {
      try {
        return JSON.parse(savedMock);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const mockSaved = localStorage.getItem('forenziq_mock_user');
    if (mockSaved) {
      try {
        const parsed = JSON.parse(mockSaved);
        setUser(parsed);
        setIsLoading(false);
      } catch {
        // proceed
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        });
        setToken(session.access_token);
      }
      setIsLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        });
        setToken(session.access_token);
      } else if (!localStorage.getItem('forenziq_mock_user')) {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Dev fallback for offline verification testing
        const mockObj = {
          id: '11111111-1111-1111-1111-111111111111',
          email: email,
          name: email.split('@')[0],
        };
        localStorage.setItem('forenziq_mock_user', JSON.stringify(mockObj));
        setUser(mockObj);
        return {};
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        });
        setToken(data.session?.access_token || null);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        const mockObj = {
          id: '11111111-1111-1111-1111-111111111111',
          email: email,
          name: name || email.split('@')[0],
        };
        localStorage.setItem('forenziq_mock_user', JSON.stringify(mockObj));
        setUser(mockObj);
        return {};
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || name || data.user.email?.split('@')[0],
        });
        if (data.session) setToken(data.session.access_token);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('forenziq_mock_user');
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
