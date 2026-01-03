import { Router } from 'express';
import { 
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Task routes
router.get('/projects/:projectId/tasks', getProjectTasks);   // GET /api/tasks/projects/:projectId/tasks
router.get('/:id', getTaskById);                             // GET /api/tasks/:id
router.post('/projects/:projectId/tasks', createTask);       // POST /api/tasks/projects/:projectId/tasks
router.put('/:id', updateTask);                              // PUT /api/tasks/:id
router.patch('/:id/status', updateTaskStatus);               // PATCH /api/tasks/:id/status
router.delete('/:id', deleteTask);                           // DELETE /api/tasks/:id

export default router;