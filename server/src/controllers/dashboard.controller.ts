import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('🔍 [DASHBOARD] Request received');
    
    if (!req.user?.userId) {
      console.log('❌ [DASHBOARD] No user ID');
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized - User not authenticated' 
      });
    }

    const userId = req.user.userId;
    console.log('👤 [DASHBOARD] User ID:', userId);

    // 1. Đếm projects
    console.log('📁 [DASHBOARD] Counting projects...');
    const totalProjects = await prisma.project.count({
      where: { ownerId: userId }
    });
    console.log('✅ [DASHBOARD] Total projects:', totalProjects);

    // 2. DEBUG: Liệt kê tất cả projects của user
    const userProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true }
    });
    console.log('📋 [DASHBOARD] User projects:', JSON.stringify(userProjects));

    // 3. Đếm tasks - CHI TIẾT HƠN
    console.log('✅ [DASHBOARD] Counting ALL tasks...');
    const allTasks = await prisma.task.count({
      where: {
        project: { ownerId: userId }
      }
    });
    console.log('📊 [DASHBOARD] All tasks count:', allTasks);

    // 4. DEBUG: Xem tasks thực tế
    if (allTasks === 0) {
      console.log('⚠️ [DASHBOARD] No tasks found! Checking database...');
      
      // Kiểm tra từng project
      for (const project of userProjects) {
        const projectTasks = await prisma.task.findMany({
          where: { projectId: project.id },
          select: { id: true, title: true, status: true }
        });
        console.log(`   Project "${project.name}" (${project.id}):`, projectTasks.length, 'tasks');
        if (projectTasks.length > 0) {
          console.log('   Tasks:', JSON.stringify(projectTasks));
        }
      }
    }

    console.log('✅ [DASHBOARD] Counting COMPLETED tasks...');
    const completedTasks = await prisma.task.count({
      where: {
        project: { ownerId: userId },
        status: 'DONE'
      }
    });
    console.log('📊 [DASHBOARD] Completed tasks:', completedTasks);

    const activeTasks = allTasks - completedTasks;
    console.log('📈 [DASHBOARD] Active tasks:', activeTasks);

    // 5. Trả kết quả với debug info
    res.json({
      status: 'success',
      data: {
        totalProjects,
        activeTasks,
        completedTasks,
        totalTasks: allTasks,
        debug: process.env.NODE_ENV === 'development' ? {
          userId,
          projectCount: totalProjects,
          projects: userProjects,
          allTasks,
          completedTasks
        } : undefined
      }
    });

    console.log('🚀 [DASHBOARD] Response sent');

  } catch (error) {
    console.error('❌ [DASHBOARD] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODEEnv === 'development' ? errorMessage : undefined
    });
  }
};
