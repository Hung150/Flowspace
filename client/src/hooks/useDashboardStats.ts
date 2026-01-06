import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Interface định nghĩa kiểu dữ liệu
interface Task {
  id: string;
  status: string;
  completed?: boolean;
  title?: string;
  // Thêm các trường khác nếu cần
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  // Thêm các trường khác nếu cần
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
        console.log('🔄 Fetching dashboard stats...');
        
        // Gọi 2 API hợp lệ thay vì /dashboard/stats
        const [projectsRes, tasksRes] = await Promise.all([
          api.get<Project[]>('/api/projects'),
          api.get<Task[]>('/api/tasks')
        ]);

        const projects = projectsRes.data || [];
        const tasks = tasksRes.data || [];

        // Debug: Xem cấu trúc dữ liệu thực tế
        console.log('📊 Dashboard Raw Data:', {
          projectsCount: projects.length,
          tasksCount: tasks.length,
          firstProject: projects[0],
          firstTask: tasks[0],
          allTaskStatuses: tasks.slice(0, 5).map(t => ({ id: t.id, status: t.status }))
        });

        // Tính toán thống kê
        const totalProjects = projects.length;
        
        let activeTasks = 0;
        let completedTasks = 0;

        // Xử lý từng task để phân loại
        tasks.forEach((task: Task) => {
          // LOG QUAN TRỌNG: Xác định status thực tế
          // console.log(`Task ${task.id}: status="${task.status}", completed=${task.completed}`);
          
          // CÁCH 1: Dựa trên trường status (string)
          // Điều chỉnh điều kiện này dựa trên console log
          const taskStatus = task.status?.toLowerCase() || '';
          
          if (taskStatus === 'done' || 
              taskStatus === 'completed' || 
              taskStatus === 'closed' ||
              task.completed === true) {
            completedTasks++;
          } else if (taskStatus === 'todo' || 
                    taskStatus === 'inprogress' || 
                    taskStatus === 'in-progress' ||
                    taskStatus === 'pending' ||
                    taskStatus === 'open') {
            activeTasks++;
          } else {
            // Mặc định coi là active nếu không rõ
            activeTasks++;
          }
        });

        console.log('📈 Calculated Stats:', {
          totalProjects,
          activeTasks,
          completedTasks
        });

        return {
          data: {
            totalProjects,
            activeTasks,
            completedTasks
          },
          success: true
        };

      } catch (error: unknown) {
        // Xử lý lỗi đúng kiểu (không dùng any)
        let errorMessage = 'Unknown error';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message);
        }
        
        console.error('❌ Error fetching dashboard stats:', errorMessage);
        
        // Trả về data mặc định khi có lỗi
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
    staleTime: 5 * 60 * 1000, // 5 phút cache
    refetchOnWindowFocus: true,
    // Thêm refetch interval để tự động cập nhật (tùy chọn)
    refetchInterval: 2 * 60 * 1000, // Tự refetch mỗi 2 phút
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

// Hàm utility để force refetch (tùy chọn)
export const useRefetchDashboardStats = () => {
  const queryClient = useQueryClient();
  
  return async () => {
    console.log('🔄 Force refetching dashboard stats...');
    await queryClient.refetchQueries({ queryKey: ['dashboard-stats'] });
  };
};
