import api from './api'
import type { Project, ApiResponse } from '../types'

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<{ projects: Project[] }>>('/api/projects') // THÊM '/api/'
    return response.data.data.projects
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<{ project: Project }>>(`/api/projects/${id}`) // THÊM '/api/'
    return response.data.data.project
  },

  createProject: async (data: { name: string; description?: string; color?: string }): Promise<Project> => {
    const response = await api.post<ApiResponse<{ project: Project }>>('/api/projects', data) // THÊM '/api/'
    return response.data.data.project
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put<ApiResponse<{ project: Project }>>(`/api/projects/${id}`, data) // THÊM '/api/'
    return response.data.data.project
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`) // THÊM '/api/'
  },
}
