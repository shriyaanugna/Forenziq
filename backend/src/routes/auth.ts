import { Router, Response } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// 1. SIGN UP
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email address and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters in length.',
      });
    }

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
      return res.status(400).json({
        error: 'Sign Up Failed',
        message: error.message,
      });
    }

    if (data.user) {
      // Ensure user entry in users table if needed
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        name: name || data.user.email?.split('@')[0],
      });
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name,
      } : null,
      session: data.session,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred during signup.',
    });
  }
});

// 2. SIGN IN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required.',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email address or password.',
      });
    }

    return res.status(200).json({
      message: 'Signed in successfully.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      },
      session: data.session,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred during login.',
    });
  }
});

// 3. GET CURRENT USER PROFILE
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    user: req.user,
  });
});

// 4. SIGN OUT
router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    return res.status(200).json({ message: 'Signed out successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Logout Error', message: err.message });
  }
});

export default router;
