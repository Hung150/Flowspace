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

    console.log('🔍 DEBUG - User ID:', userId);

    // 2. Đếm tổng số projects của user (user là owner)
    const totalProjects = await prisma.project.count({
      where: { 
        ownerId: userId
      }
    });

    console.log('🔍 DEBUG - Total Projects:', totalProjects);

    // 3. Đếm tasks theo trạng thái - FIX QUERY
    const tasksStats = await prisma.task.groupBy({
      by: ['status'],
      where: {
        project: {
          ownerId: userId
        }
      },
      _count: {
        _all: true
      }
    });

    console.log('📊 DEBUG - Tasks Stats RAW:', JSON.stringify(tasksStats, null, 2));

    // 4. DEBUG: Kiểm tra direct query
    const directTaskCount = await prisma.task.count({
      where: {
        project: {
          ownerId: userId
        }
      }
    });

    console.log('🔍 DEBUG - Direct Task Count:', directTaskCount);

    // 5. Kiểm tra project của user
    const userProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, _count: { select: { tasks: true } } }
    });

    console.log('🔍 DEBUG - User Projects:', JSON.stringify(userProjects, null, 2));

    // 6. Tính Active Tasks - FIX LOGIC
    // Task có status: 'TODO', 'IN_PROGRESS', 'REVIEW' là active
    const activeTasks = tasksStats
      .filter((stat: { status: string; _count: number }) => {
        const status = stat.status?.toUpperCase() || '';
        return status !== 'DONE' && status !== 'COMPLETED' && status !== 'CANCELLED';
      })
      .reduce((sum: number, stat: { _count: number }) => sum + stat._count, 0);

    // 7. Tính Completed Tasks
    const completedTasks = tasksStats
      .filter((stat: { status: string; _count: number }) => {
        const status = stat.status?.toUpperCase() || '';
        return status === 'DONE' || status === 'COMPLETED';
      })
      .reduce((sum: number, stat: { _count: number }) => sum + stat._count, 0);

    console.log('✅ DEBUG - Calculated:', { activeTasks, completedTasks });

    // 8. Trả kết quả
    res.json({
      status: 'success',
      data: {
        totalProjects,
        activeTasks,
        completedTasks,
        totalTasks: activeTasks + completedTasks,
        debug: { // Thêm debug info
          directTaskCount,
          projects: userProjects.length,
          tasksStats
        },
        byStatus: tasksStats.reduce((obj: Record<string, number>, stat: { status: string; _count: number }) => {
          obj[stat.status] = stat._count;
          return obj;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    
    // 9. Xử lý lỗi
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      debug: process.env.NODE_ENV === 'development' ? { stack: error instanceof Error ? error.stack : 'No stack' } : undefined
    });
  }
};
