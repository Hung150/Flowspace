import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
  status?: 'TODO' | 'DOING' | 'DONE';
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
  status?: 'TODO' | 'DOING' | 'DONE';
  order?: number;
}

// Get all tasks for a project
export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const projectId = req.params.projectId;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Check if user has access to project
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    if (!projectAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'No access to this project'
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Group tasks by status for Kanban board
    const tasksByStatus = {
      TODO: tasks.filter((task: any) => task.status === 'TODO'),  
      DOING: tasks.filter((task: any) => task.status === 'DOING'),   
      DONE: tasks.filter((task: any) => task.status === 'DONE')    
    };

    res.status(200).json({
      status: 'success',
      data: { 
        tasks,
        grouped: tasksByStatus
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get single task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const taskId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found or access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Create new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const projectId = req.params.projectId;
    const { 
      title, 
      description, 
      priority = 'MEDIUM', 
      dueDate, 
      assigneeId,
      status = 'TODO'
    }: CreateTaskBody = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Task title is required'
      });
    }

    // Check if user has access to project
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    if (!projectAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'No access to this project'
      });
    }

    // Get max order for new task
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: 'TODO' },
      orderBy: { order: 'desc' }
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: userId,
        order: (lastTask?.order || 0) + 1
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const taskId = req.params.id;
    const updateData: UpdateTaskBody = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Check if user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!task) {
      return res.status(403).json({
        status: 'error',
        message: 'No access to this task'
      });
    }

    // Format dueDate if provided
    const formattedData = { ...updateData };
    if (updateData.dueDate) {
      formattedData.dueDate = new Date(updateData.dueDate).toISOString();
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: formattedData,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update task status (for drag & drop)
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const taskId = req.params.id;
    const { status, order } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    if (!status || !['TODO', 'DOING', 'DONE'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid status is required'
      });
    }

    // Check if user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!task) {
      return res.status(403).json({
        status: 'error',
        message: 'No access to this task'
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { 
        status,
        order: order !== undefined ? order : task.order
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task status updated',
      data: { task: updatedTask }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.userId;
    const taskId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Check if user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    });

    if (!task) {
      return res.status(403).json({
        status: 'error',
        message: 'No access to this task'
      });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};