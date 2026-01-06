import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Interface định nghĩa kiểu dữ liệu
interface Task {
  id: string;
  status: string;
  completed?: boolean;
  title?: string;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  color?: string;
  _count?: {
    tasks?: number;
    members?: number;
  };
}

interface DashboardStatsData {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
}

interface DashboardStatsResponse {
  data: DashboardStatsData;
  success: boolean;
  error?: string;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStatsResponse>({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStatsResponse> => {
      try {
        console.log('🔄 [DEBUG] Bắt đầu fetch dashboard stats...');
        
        // Gọi API cơ bản nhất
        const [projectsRes, tasksRes] = await Promise.all([
          api.get<Project[]>('/api/projects'),
          api.get<Task[]>('/api/tasks')
        ]);

        const projects = projectsRes.data || [];
        const tasks = tasksRes.data || [];

        // DEBUG: Xem cấu trúc dữ liệu
        console.log('📊 [DEBUG] Dữ liệu nhận được:');
        console.log('- Projects count:', projects.length);
        console.log('- Tasks count:', tasks.length);
        
        if (tasks.length > 0) {
          console.log('- Task mẫu đầu tiên:', {
            id: tasks[0].id,
            title: tasks[0].title,
            status: tasks[0].status,
            completed: tasks[0].completed
          });
        }

        // TÍNH TOÁN STATS VỚI LOGIC CHÍNH XÁC
        const totalProjects = projects.length;
        
        let activeTasks = 0;
        let completedTasks = 0;

        console.log('🎯 [DEBUG] Phân loại tasks theo Kanban board:');
        
        if (tasks.length > 0) {
          // PHÂN TÍCH: Tất cả status duy nhất để xác định logic
          const allStatuses = tasks.map(t => t.status);
          const uniqueStatuses = [...new Set(allStatuses)];
          console.log('📝 Tất cả status có trong hệ thống:', uniqueStatuses);
          
          // LOGIC PHÂN LOẠI THÔNG MINH
          tasks.forEach((task: Task, index: number) => {
            const taskStatus = task.status?.toLowerCase() || '';
            const taskTitle = task.title || `Task ${index + 1}`;
            
            // DEBUG chi tiết từng task
            console.log(`${index + 1}. "${taskTitle}" - Status: "${task.status}" (lower: "${taskStatus}")`);
            
            // QUY TẮC PHÂN LOẠI DỰA TRÊN KANBAN BOARD:
            // TODO, DOING → ACTIVE | DONE → COMPLETED
            
            // 1. Kiểm tra nếu có trường completed
            if (task.completed === true) {
              completedTasks++;
              console.log(`   ✓ COMPLETED (theo field completed)`);
              return;
            }
            
            // 2. Logic cho status DONE (cột DONE trong Kanban)
            const doneKeywords = ['done', 'completed', 'finished', 'closed'];
            const isDone = doneKeywords.some(keyword => 
              taskStatus.includes(keyword) || 
              task.status?.toUpperCase() === 'DONE'
            );
            
            if (isDone) {
              completedTasks++;
              console.log(`   ✓ COMPLETED (status có từ khóa "done")`);
              return;
            }
            
            // 3. Logic cho status ACTIVE (cột TODO, DOING trong Kanban)
            const activeKeywords = ['todo', 'doing', 'inprogress', 'in_progress', 'pending', 'open'];
            const isActive = activeKeywords.some(keyword => 
              taskStatus.includes(keyword) ||
              task.status?.toUpperCase() === 'TODO' ||
              task.status?.toUpperCase() === 'DOING'
            );
            
            if (isActive) {
              activeTasks++;
              console.log(`   ✓ ACTIVE (status có từ khóa "todo"/"doing")`);
              return;
            }
            
            // 4. Mặc định: Phân tích theo giá trị status thực tế
            if (task.status === 'DONE' || task.status === 'done') {
              completedTasks++;
              console.log(`   ✓ COMPLETED (status là "DONE")`);
            } else {
              activeTasks++;
              console.log(`   ✓ ACTIVE (mặc định cho status: "${task.status}")`);
            }
          });
        }

        console.log('📈 [DEBUG] Kết quả tính toán:', {
          totalProjects,
          activeTasks,
          completedTasks,
          totalTasks: tasks.length,
          check: `Tổng tasks = ${activeTasks + completedTasks} (phải bằng ${tasks.length})`
        });

        // KIỂM TRA TÍNH ĐÚNG ĐẮN
        if ((activeTasks + completedTasks) !== tasks.length) {
          console.warn('⚠️ Cảnh báo: Tổng active + completed không khớp với tổng tasks!');
          // Tự động điều chỉnh nếu có sai sót
          activeTasks = tasks.length - completedTasks;
        }

        return {
          data: {
            totalProjects,
            activeTasks,
            completedTasks
          },
          success: true
        };

      } catch (error: unknown) {
        // Xử lý lỗi
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ [DEBUG] Lỗi fetch dashboard stats:', errorMessage);
        
        // Trả về giá trị mặc định khi có lỗi
        return {
          data: {
            totalProjects: 0,
            activeTasks: 0,
            completedTasks: 0
          },
          success: false,
          error: errorMessage
        };
      }
    },
    retry: 1,
    staleTime: 30 * 1000, // Giảm cache time xuống 30 giây để cập nhật nhanh hơn
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Tự refetch khi component mount
  });
};

// Hàm để manual refetch dashboard stats
export const useInvalidateDashboardStats = () => {
  const queryClient = useQueryClient();
  
  return () => {
    console.log('🔄 Invalidating dashboard stats cache...');
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };
};

export const useRefetchDashboardStats = () => {
  const queryClient = useQueryClient();
  
  return async () => {
    console.log('🔄 Force refetching dashboard stats...');
    await queryClient.refetchQueries({ queryKey: ['dashboard-stats'] });
  };
};

// Hàm mới: Tự động refetch khi có thay đổi task
export const useSubscribeToTaskUpdates = () => {
  const queryClient = useQueryClient();
  
  // Trong thực tế, bạn có thể kết nối WebSocket hoặc polling
  // Ở đây dùng polling đơn giản
  const startPolling = (intervalMs = 10000) => {
    console.log(`📡 Bắt đầu polling cập nhật tasks mỗi ${intervalMs/1000}s`);
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }, intervalMs);
    
    return () => clearInterval(interval);
  };
  
  return { startPolling };
};
