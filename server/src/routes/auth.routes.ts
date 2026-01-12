import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  updateProfile 
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, changePassword);
router.put('/profile', authMiddleware, updateProfile);

export default router;
