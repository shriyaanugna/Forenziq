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
  signup: (email: string, password: string, name?: string) => Promise<{ error?: string; info?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        });
        setToken(session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    }).catch(() => {
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
      } else {
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
        return { error: error.message || 'Invalid email or password.' };
      }

      if (data.user && data.session) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        });
        setToken(data.session.access_token);
        return {};
      }

      return { error: 'Authentication failed. Please check your credentials.' };
    } catch (err: any) {
      return { error: err.message || 'Login failed.' };
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
        return { error: error.message || 'Sign up failed.' };
      }

      if (data.user) {
        if (data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || name || data.user.email?.split('@')[0],
          });
          setToken(data.session.access_token);
          return {};
        } else {
          return { info: 'Account created! Please check your email to confirm your account before logging in.' };
        }
      }

      return { error: 'Unable to create user account.' };
    } catch (err: any) {
      return { error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
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
