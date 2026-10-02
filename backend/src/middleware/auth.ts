import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized access',
        message: 'No authorization token provided. Please sign in.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized access',
        message: 'Malformed authorization header.',
      });
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: 'Unauthorized access',
        message: 'Invalid or expired session token.',
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Unauthorized access',
      message: err.message || 'Authentication failed.',
    });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user) {
          req.user = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          };
        }
      }
    }
    next();
  } catch {
    next();
  }
}
