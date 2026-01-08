import api from './api'
import type { Project } from '../types' // Xóa ApiResponse
import { AxiosError } from 'axios'

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      console.log('📡 [SERVICE] Fetching projects...')
      const response = await api.get('/projects')
      console.log('📦 [SERVICE] Projects response:', response.data)
      
      // Backend trả về { success: true, projects: [...] } hoặc { data: { projects: [...] } }
      const data = response.data
      
      if (data.success && data.projects) {
        return data.projects
      } else if (data.data && data.data.projects) {
        return data.data.projects
      } else if (Array.isArray(data)) {
        return data // Fallback: nếu API trả về array trực tiếp
      } else {
        console.warn('⚠️ [SERVICE] Unexpected response format:', data)
        return []
      }
    } catch (error: unknown) { // Sửa: không dùng any
      console.error('❌ [SERVICE] Error fetching projects:', error)
      throw error
    }
  },

  getProjectById: async (id: string): Promise<Project> => {
    console.log(`📡 [SERVICE] Fetching project ${id}...`)
    const response = await api.get(`/projects/${id}`)
    console.log('📦 [SERVICE] Project response:', response.data)
    
    const data = response.data
    
    if (data.success && data.project) {
      return data.project
    } else if (data.data && data.data.project) {
      return data.data.project
    } else if (data.project) {
      return data.project
    } else {
      throw new Error('Invalid response format')
    }
  },

  createProject: async (data: { name: string; description?: string; color?: string }): Promise<Project> => {
    try {
      console.log('🚀 [SERVICE] Creating project with data:', data)
      const response = await api.post('/projects', data)
      console.log('📦 [SERVICE] Create project response:', response.data)
      
      const responseData = response.data
      
      if (responseData.success && responseData.project) {
        console.log('✅ [SERVICE] Project created successfully:', responseData.project)
        return responseData.project
      } else if (responseData.data && responseData.data.project) {
        console.log('✅ [SERVICE] Project created successfully (alt format):', responseData.data.project)
        return responseData.data.project
      } else if (responseData.project) {
        console.log('✅ [SERVICE] Project created successfully (direct):', responseData.project)
        return responseData.project
      } else {
        console.error('❌ [SERVICE] Invalid response format:', responseData)
        throw new Error('Invalid response from server')
      }
    } catch (error: unknown) { // Sửa: không dùng any
      console.error('❌ [SERVICE] Error creating project:', error)
      
      // Chi tiết hóa error
      if (error instanceof AxiosError && error.response) {
        console.error('Server response:', error.response.data)
        const serverError = error.response.data?.error || error.response.data?.message || 'Unknown error'
        throw new Error(`Server error: ${serverError}`)
      } else if (error instanceof AxiosError && error.request) {
        throw new Error('No response from server. Please check your connection.')
      } else if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Unknown error occurred')
      }
    }
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    console.log(`✏️ [SERVICE] Updating project ${id}:`, data)
    const response = await api.put(`/projects/${id}`, data)
    
    const responseData = response.data
    
    if (responseData.success && responseData.project) {
      return responseData.project
    } else if (responseData.data && responseData.data.project) {
      return responseData.data.project
    } else if (responseData.project) {
      return responseData.project
    } else {
      throw new Error('Invalid response format')
    }
  },

  deleteProject: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log(`🗑️ [SERVICE] Deleting project: ${id}`)
      const response = await api.delete(`/projects/${id}`)
      console.log('✅ [SERVICE] Delete response:', response.data)
      
      const responseData = response.data
      
      if (responseData.success) {
        return {
          success: true,
          message: responseData.message || responseData.data?.message || 'Project deleted successfully'
        }
      } else {
        throw new Error(responseData.error || 'Delete failed')
      }
    } catch (error: unknown) {
      console.error('❌ [SERVICE] Delete error occurred:', error)
      
      let errorMessage = 'Failed to delete project'
      
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error('Server response:', error.response.data)
          errorMessage = error.response.data?.error || 
                        error.response.data?.message || 
                        error.message
        } else {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      // Kiểm tra foreign key constraint
      const errorLower = errorMessage.toLowerCase()
      if (errorLower.includes('foreign') || errorLower.includes('constraint') || 
          errorLower.includes('reference') || errorLower.includes('task')) {
        errorMessage = 'Cannot delete project because it contains tasks. Please delete all tasks first.'
      }
      
      console.error('Final error message:', errorMessage)
      throw new Error(errorMessage)
    }
  },
}
