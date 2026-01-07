import api from './api'
import type { Project, ApiResponse } from '../types'
import { AxiosError } from 'axios' // Thêm import

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<{ projects: Project[] }>>('/api/projects')
    return response.data.data.projects
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<{ project: Project }>>(`/api/projects/${id}`)
    return response.data.data.project
  },

  createProject: async (data: { name: string; description?: string; color?: string }): Promise<Project> => {
    const response = await api.post<ApiResponse<{ project: Project }>>('/api/projects', data)
    return response.data.data.project
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put<ApiResponse<{ project: Project }>>(`/api/projects/${id}`, data)
    return response.data.data.project
  },

  deleteProject: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log(`🗑️ [SERVICE] Deleting project: ${id}`);
      const response = await api.delete<ApiResponse<{ message: string }>>(`/api/projects/${id}`);
      
      console.log('✅ [SERVICE] Delete response:', response.data);
      
      return {
        success: true,
        message: response.data.data?.message || 'Project deleted successfully'
      };
      
    } catch (error: unknown) {
      // SỬA LỖI: Không dùng 'any'
      console.error('❌ [SERVICE] Delete error occurred');
      
      let errorMessage = 'Failed to delete project';
      let serverMessage = '';
      
      if (error instanceof AxiosError) {
        // Xử lý Axios error
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        serverMessage = error.response?.data?.message || error.response?.data?.error || '';
        errorMessage = serverMessage || error.message || errorMessage;
        
      } else if (error instanceof Error) {
        // Xử lý Error object
        errorMessage = error.message;
        console.error('Error object:', error);
      } else if (typeof error === 'string') {
        // Xử lý string error
        errorMessage = error;
      }
      
      // Kiểm tra foreign key constraint
      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes('foreign') || errorLower.includes('constraint') || 
          errorLower.includes('reference') || errorLower.includes('task')) {
        errorMessage = 'Cannot delete project because it contains tasks. Please delete all tasks first.';
      }
      
      console.error('Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  },
}
