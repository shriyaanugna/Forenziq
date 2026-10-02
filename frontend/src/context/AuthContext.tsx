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
        const errMsg = error.message || '';
        if (error.status === 429 || errMsg.toLowerCase().includes('rate limit')) {
          return { error: 'Too many sign-in attempts. Please wait a few minutes before trying again.' };
        }
        if (errMsg.toLowerCase().includes('invalid login credentials')) {
          return { error: 'Invalid email address or password. Please check your credentials.' };
        }
        if (errMsg.toLowerCase().includes('email not confirmed')) {
          return { error: 'Email address not confirmed. To allow instant login, disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email).' };
        }
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
        const errMsg = error.message || '';
        const isRateLimit = error.status === 429 ||
          errMsg.toLowerCase().includes('rate limit') ||
          errMsg.toLowerCase().includes('too many requests') ||
          errMsg.toLowerCase().includes('exceeded');

        if (isRateLimit) {
          return {
            error: 'Email rate limit exceeded. To enable instant account creation without rate limits, disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email).'
          };
        }

        if (errMsg.toLowerCase().includes('already registered') || errMsg.toLowerCase().includes('user_already_exists')) {
          return {
            error: 'An investigator account with this email address already exists. Please sign in instead.'
          };
        }

        return { error: error.message || 'Sign up failed.' };
      }

      if (data.user) {
        if (data.session) {
          // Instant authenticated session established
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || name || data.user.email?.split('@')[0],
          });
          setToken(data.session.access_token);
          return {};
        } else {
          // Account created but email confirmation is active in Supabase project settings
          return {
            info: 'Account created! To allow instant workspace access without confirmation links, disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email).'
          };
        }
      }

      return { error: 'Unable to create user account.' };
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (err?.status === 429 || errMsg.toLowerCase().includes('rate limit')) {
        return {
          error: 'Email rate limit exceeded. Please wait a few minutes or disable "Confirm email" in Supabase Dashboard.'
        };
      }
      return { error: errMsg || 'Registration failed.' };
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
