import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Định nghĩa interface cho request có user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    console.log('🕐 [' + new Date().toISOString() + '] [AUTH] Path:', req.path);
    console.log('🔐 [AUTH] Headers:', JSON.stringify(req.headers));
    console.log('🌐 [AUTH] Origin:', req.headers.origin);

    const authHeader = req.headers.authorization;
    console.log('🔑 [AUTH] Authorization header:', authHeader || 'MISSING');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH] No valid Bearer token');
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('✅ [AUTH] Token extracted, length:', token.length);
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    req.user = {
      userId: (decoded as any).userId,
      email: (decoded as any).email
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};
