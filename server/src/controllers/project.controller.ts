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

// Delete project - ĐÃ SỬA LỖI FOREIGN KEY CONSTRAINT
export const deleteProject = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const projectId = req.params.id;

    console.log(`🗑️ [BACKEND] Starting delete project: ${projectId} for user: ${userId}`);

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
      },
      include: {
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    if (!project) {
      return res.status(403).json({
        status: 'error',
        message: 'Only project owner can delete project or project not found'
      });
    }

    console.log(`📊 Project "${project.name}" stats: ${project._count?.tasks || 0} tasks, ${project._count?.members || 0} members`);

    // CÁCH 1: Dùng transaction để xoá tuần tự - TRÁNH FOREIGN KEY CONSTRAINT
    console.log('🔄 Starting sequential delete transaction...');
    
    await prisma.$transaction(async (tx) => {
      // Bước 1: Xoá tất cả tasks trong project
      console.log(`1️⃣ Deleting ${project._count?.tasks || 0} tasks...`);
      const deletedTasks = await tx.task.deleteMany({
        where: { projectId }
      });
      console.log(`✅ Deleted ${deletedTasks.count} tasks`);
      
      // Chờ 100ms để database sync
      await new Promise(resolve => setTimeout(resolve, 100));

      // Bước 2: Xoá tất cả members trong project
      console.log(`2️⃣ Deleting ${project._count?.members || 0} members...`);
      const deletedMembers = await tx.member.deleteMany({
        where: { projectId }
      });
      console.log(`✅ Deleted ${deletedMembers.count} members`);
      
      // Chờ 100ms để database sync
      await new Promise(resolve => setTimeout(resolve, 100));

      // Bước 3: Cuối cùng xoá project
      console.log(`3️⃣ Deleting project "${project.name}"...`);
      await tx.project.delete({
        where: { id: projectId }
      });
      console.log(`✅ Project deleted`);
    });

    // CÁCH 2: Hoặc dùng cascade delete từ Prisma (nếu schema đã setup)
    // await prisma.project.delete({
    //   where: { id: projectId }
    // });

    const executionTime = Date.now() - startTime;
    console.log(`🎉 Project "${project.name}" (${projectId}) deleted successfully in ${executionTime}ms`);

    res.status(200).json({
      status: 'success',
      message: `Project "${project.name}" and all associated data deleted successfully`
    });
    
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ Delete project failed after ${executionTime}ms:`, error);
    
    // Log chi tiết lỗi Prisma
    console.error('🔍 Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    // Phân loại lỗi để trả về message rõ ràng
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.code === 'P2003') {
      errorMessage = 'Cannot delete project because it contains tasks or members. Please delete them first.';
      statusCode = 400;
    } else if (error.code === 'P2025') {
      errorMessage = 'Project not found or already deleted';
      statusCode = 404;
    } else if (error.code === 'P2002') {
      errorMessage = 'Database constraint violation';
      statusCode = 400;
    } else if (error.message?.toLowerCase().includes('foreign') || 
               error.message?.toLowerCase().includes('constraint') ||
               error.message?.toLowerCase().includes('reference')) {
      errorMessage = 'Database foreign key constraint error. Project has related tasks or members.';
      statusCode = 400;
    }

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      // Chỉ trả về chi tiết trong development
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        code: error.code
      })
    });
  }
};
