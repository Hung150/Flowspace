import express from 'express';
import { searchUsers } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);
router.get('/search', searchUsers);

export default router;
