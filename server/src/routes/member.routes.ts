import express from 'express';
import {
  getProjectMembers,
  addMemberToProject,
  updateMemberRole,
  removeMemberFromProject,
  getUserTeams
} from '../controllers/member.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/teams - Lấy tất cả teams (projects) user tham gia
router.get('/teams', getUserTeams);

// GET /api/projects/:projectId/members - Lấy members của project
router.get('/projects/:projectId/members', getProjectMembers);

// POST /api/projects/:projectId/members - Thêm member vào project
router.post('/projects/:projectId/members', addMemberToProject);

// PUT /api/projects/:projectId/members/:memberId - Cập nhật role
router.put('/projects/:projectId/members/:memberId', updateMemberRole);

// DELETE /api/projects/:projectId/members/:memberId - Xóa member
router.delete('/projects/:projectId/members/:memberId', removeMemberFromProject);

export default router;
