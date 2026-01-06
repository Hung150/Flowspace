import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Định nghĩa type cho Prisma groupBy result
type TaskStat = {
  status: string;
  _count: {
    _all: number;
  };
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Kiểm tra user đã đăng nhập
    if (!req.user?.userId) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized - User not authenticated' 
      });
    }

    const userId = req.user.userId;

    // 2. Đếm tổng số projects của user (user là owner)
    const totalProjects = await prisma.project.count({
      where: { 
        ownerId: userId
      }
    });

    // 3. Đếm tasks theo trạng thái - SỬA TYPE
    const tasksStats = await prisma.task.groupBy({
      by: ['status'],
      where: {
        project: {
          ownerId: userId
        }
      },
      _count: true  // Prisma trả về { _count: { _all: number } }
    });

    // DEBUG LOG
    console.log('📊 Tasks Stats:', tasksStats);

    // 4. Tính Active Tasks - SỬA ĐỂ DÙNG ĐÚNG TYPE
    const activeTasks = tasksStats
      .filter((stat: TaskStat) => {
        const status = stat.status?.toUpperCase() || '';
        return status !== 'DONE' && status !== 'COMPLETED';
      })
      .reduce((sum: number, stat: TaskStat) => sum + stat._count._all, 0);

    // 5. Tính Completed Tasks
    const completedTasks = tasksStats
      .filter((stat: TaskStat) => {
        const status = stat.status?.toUpperCase() || '';
        return status === 'DONE' || status === 'COMPLETED';
      })
      .reduce((sum: number, stat: TaskStat) => sum + stat._count._all, 0);

    // 6. Trả kết quả
    res.json({
      status: 'success',
      data: {
        totalProjects,
        activeTasks,
        completedTasks,
        totalTasks: activeTasks + completedTasks,
        
        // Chuyển đổi sang format đơn giản
        byStatus: tasksStats.reduce((obj: Record<string, number>, stat: TaskStat) => {
          obj[stat.status] = stat._count._all;
          return obj;
        }, {} as Record<string, number>)
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
