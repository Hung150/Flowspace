import { Router } from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.get('/', getProjects);           // GET /api/projects
router.get('/:id', getProjectById);     // GET /api/projects/:id
router.post('/', createProject);        // POST /api/projects
router.put('/:id', updateProject);      // PUT /api/projects/:id
router.delete('/:id', deleteProject);   // DELETE /api/projects/:id

export default router;