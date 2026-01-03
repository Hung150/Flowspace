import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateProjectBody {
  name: string;
  description?: string;
  color?: string;
}

interface UpdateProjectBody {
  name?: string;
  description?: string;
  color?: string;
}

// Get all projects for current user
export const getProjects = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          },
          take: 5 // Limit tasks in listing
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get single project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            creator: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const { name, description, color }: CreateProjectBody = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Project name is required'
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Auto add owner as member
    await prisma.member.create({
      data: {
        userId,
        projectId: project.id,
        role: 'OWNER'
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const projectId = req.params.id;
    const { name, description, color }: UpdateProjectBody = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    });

    if (!project) {
      return res.status(403).json({
        status: 'error',
        message: 'Only project owner can update project'
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        color
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    });

    if (!project) {
      return res.status(403).json({
        status: 'error',
        message: 'Only project owner can delete project'
      });
    }

    // Delete project (cascade will delete tasks and members)
    await prisma.project.delete({
      where: { id: projectId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};