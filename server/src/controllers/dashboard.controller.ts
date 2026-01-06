import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  // 🔥 LOG QUAN TRỌNG - CHẮC CHẮN HIỆN NẾU API ĐƯỢC GỌI
  console.log('🔥🔥🔥 ========== DASHBOARD API HIT ========== 🔥🔥🔥');
  console.log('🕒 TIMESTAMP:', new Date().toISOString());
  console.log('🌐 URL:', req.originalUrl);
  console.log('🔐 Auth Header:', req.headers.authorization?.substring(0, 50) + '...');
  console.log('👤 Full req.user:', JSON.stringify(req.user));
  
  try {
    console.log('🔍 [DASHBOARD] Request received');
    
    if (!req.user?.userId) {
      console.log('❌ [DASHBOARD] No user ID in request');
      console.log('❌ Request user object:', req.user);
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized - User not authenticated' 
      });
    }

    const userId = req.user.userId;
    console.log('👤 [DASHBOARD] User ID from token:', userId);

    // 1. Đếm projects
    console.log('📁 [DASHBOARD] Counting projects for user...');
    const totalProjects = await prisma.project.count({
      where: { ownerId: userId }
    });
    console.log('✅ [DASHBOARD] Total projects found:', totalProjects);

    // 2. DEBUG: Liệt kê tất cả projects của user
    const userProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true }
    });
    console.log('📋 [DASHBOARD] User projects:', JSON.stringify(userProjects));

    // 3. DEBUG: Kiểm tra tất cả users trong DB (để debug)
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log('👥 [DASHBOARD] All users in DB:', JSON.stringify(allUsers));

    // 4. Đếm tasks - CHI TIẾT HƠN
    console.log('✅ [DASHBOARD] Counting ALL tasks for user...');
    const allTasks = await prisma.task.count({
      where: {
        project: { ownerId: userId }
      }
    });
    console.log('📊 [DASHBOARD] All tasks count:', allTasks);

    // 5. DEBUG: Xem tasks thực tế
    if (allTasks === 0) {
      console.log('⚠️ [DASHBOARD] No tasks found! Checking database...');
      
      // Kiểm tra từng project
      for (const project of userProjects) {
        const projectTasks = await prisma.task.findMany({
          where: { projectId: project.id },
          select: { id: true, title: true, status: true }
        });
        console.log(`   📍 Project "${project.name}" (${project.id}):`, projectTasks.length, 'tasks');
        if (projectTasks.length > 0) {
          console.log('   📝 Tasks:', JSON.stringify(projectTasks));
        }
      }
      
      // Kiểm tra tất cả tasks trong DB (không filter)
      const allTasksInDB = await prisma.task.findMany({
        select: { id: true, title: true, status: true, projectId: true },
        take: 10
      });
      console.log('📦 [DASHBOARD] First 10 tasks in DB (any user):', JSON.stringify(allTasksInDB));
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
    console.log('📈 [DASHBOARD] Active tasks (calculated):', activeTasks);

    // 6. DEBUG: Kiểm tra logic tính toán
    console.log('🧮 [DASHBOARD] Calculation:', {
      allTasks,
      completedTasks,
      activeTasks,
      formula: 'active = all - completed'
    });

    // 7. Trả kết quả với debug info
    const responseData = {
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
          completedTasks,
          calculation: `${allTasks} - ${completedTasks} = ${activeTasks}`
        } : undefined
      }
    };

    console.log('🚀 [DASHBOARD] Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
    console.log('✅ [DASHBOARD] Response sent successfully');

  } catch (error) {
    console.error('❌ [DASHBOARD] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    console.error('💥 [DASHBOARD] Full error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};
