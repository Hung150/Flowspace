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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
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