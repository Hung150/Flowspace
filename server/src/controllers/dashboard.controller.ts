import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized - User not authenticated' 
      });
    }

    const userId = req.user.userId;

    // 1. Đếm projects
    const totalProjects = await prisma.project.count({
      where: { ownerId: userId }
    });

    // 2. Đếm tasks - DÙNG CÁCH ĐƠN GIẢN NHẤT
    // Đếm tất cả tasks của user
    const allTasks = await prisma.task.count({
      where: {
        project: { ownerId: userId }
      }
    });

    // Đếm completed tasks (status = 'DONE')
    const completedTasks = await prisma.task.count({
      where: {
        project: { ownerId: userId },
        status: 'DONE'
      }
    });

    // Active tasks = tất cả - completed
    const activeTasks = allTasks - completedTasks;

    // 3. Trả kết quả ĐƠN GIẢN
    res.json({
      status: 'success',
      data: {
        totalProjects,
        activeTasks,
        completedTasks,
        totalTasks: allTasks
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};
