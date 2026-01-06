import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
        ownerId: userId // QUAN TRỌNG: Dùng ownerId, không phải userId
      }
    });

    // 3. Đếm tasks theo trạng thái - CHÍNH XÁC VỚI SCHEMA CỦA BẠN
    const tasksStats = await prisma.task.groupBy({
      by: ['status'],
      where: {
        project: {
          ownerId: userId // Lấy tasks từ các project mà user là owner
        }
      },
      _count: true
    });


    const activeTasks = tasksStats
      .filter((stat: { status: string; _count: number }) => stat.status !== 'DONE')
      .reduce((sum: number, stat: { _count: number }) => sum + stat._count, 0);

    // 5. Tính Completed Tasks (chỉ status = "DONE")
    const completedTasks = tasksStats
      .find((stat: { status: string; _count: number }) => stat.status === 'DONE')?._count || 0;

    // 6. Trả kết quả
    res.json({
      status: 'success',
      data: {
        totalProjects,
        activeTasks,
        completedTasks,
    
        totalTasks: activeTasks + completedTasks,
        
        byStatus: tasksStats.reduce((obj: Record<string, number>, stat: { status: string; _count: number }) => {
          obj[stat.status] = stat._count;
          return obj;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // 7. Xử lý lỗi
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
