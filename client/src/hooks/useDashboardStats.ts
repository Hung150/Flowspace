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
        console.log('🔄 Bắt đầu fetch dashboard stats...');
        
        // 1. Lấy tất cả projects
        console.log('📡 Gọi API: /api/projects');
        const projectsRes = await api.get<unknown>('/api/projects');
        
        console.log('📊 Projects response:', projectsRes.data);
        
        let projects: Project[] = [];
        const responseData = projectsRes.data;
        
        // Xử lý response để lấy projects
        if (responseData && typeof responseData === 'object') {
          const data = responseData as Record<string, unknown>;
          
          // Kiểm tra các cấu trúc response có thể có
          if (data.data && typeof data.data === 'object') {
            const innerData = data.data as Record<string, unknown>;
            if (innerData.projects && Array.isArray(innerData.projects)) {
              projects = innerData.projects as Project[];
            } else if (Array.isArray(data.data)) {
              projects = data.data as Project[];
            }
          } else if (data.projects && Array.isArray(data.projects)) {
            projects = data.projects as Project[];
          } else if (Array.isArray(data)) {
            projects = data as Project[];
          }
        } else if (Array.isArray(responseData)) {
          projects = responseData as Project[];
        }
        
        console.log('✅ Số projects thực tế:', projects.length);

        // 2. Lấy tasks từ các projects
        let allTasks: Task[] = [];
        
        if (projects.length > 0) {
          console.log('🔍 Lấy tasks từ projects...');
          
          // Lấy tasks từ từng project
          const taskPromises = projects.map(async (project): Promise<Task[]> => {
            try {
              const tasksRes = await api.get<unknown>(`/api/tasks/projects/${project.id}/tasks`);
              let tasks: Task[] = [];
              const taskResponseData = tasksRes.data;
              
              if (taskResponseData && typeof taskResponseData === 'object') {
                const taskData = taskResponseData as Record<string, unknown>;
                
                if (taskData.data && typeof taskData.data === 'object') {
                  const innerData = taskData.data as Record<string, unknown>;
                  if (innerData.tasks && Array.isArray(innerData.tasks)) {
                    tasks = innerData.tasks as Task[];
                  }
                } else if (Array.isArray(taskData.data)) {
                  tasks = taskData.data as Task[];
                } else if (taskData.tasks && Array.isArray(taskData.tasks)) {
                  tasks = taskData.tasks as Task[];
                }
              }
              
              return tasks;
            } catch {
              // XÓA BIẾN 'error' KHÔNG DÙNG
              console.log(`Lỗi lấy tasks cho project ${project.id}`);
              return [];
            }
          });
          
          const tasksResults = await Promise.all(taskPromises);
          allTasks = tasksResults.flat();
        }
        
        console.log('✅ Số tasks thực tế:', allTasks.length);

        // 3. TÍNH TOÁN STATS TỪ DỮ LIỆU THỰC
        const totalProjects = projects.length;
        
        let activeTasks = 0;
        let completedTasks = 0;

        // Phân loại tasks dựa trên status thực tế
        allTasks.forEach((task: Task) => {
          const status = (task.status || '').toLowerCase();
          
          // Logic phân loại: DONE = completed, còn lại = active
          if (status === 'done' || status === 'completed' || status === 'd') {
            completedTasks++;
          } else {
            activeTasks++;
          }
        });

        console.log('📈 Kết quả tính toán THỰC TẾ:', {
          totalProjects,
          activeTasks,
          completedTasks,
          totalTasks: allTasks.length
        });

        // 4. Trả về giá trị THỰC TẾ - KHÔNG hardcode
        const finalStats = {
          totalProjects,      // Giá trị thực
          activeTasks,        // Giá trị thực  
          completedTasks      // Giá trị thực
        };

        console.log('🎯 Stats sẽ hiển thị (giá trị thực):', finalStats);

        return {
          data: finalStats,
          success: true
        };

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Lỗi fetch dashboard stats:', errorMessage);
        
        // Khi có lỗi, trả về giá trị 0 - KHÔNG hardcode
        return {
          data: {
            totalProjects: 0,  // Giá trị mặc định khi lỗi
            activeTasks: 0,    // Giá trị mặc định khi lỗi
            completedTasks: 0  // Giá trị mặc định khi lỗi
          },
          success: false,
          error: errorMessage
        };
      }
    },
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
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
