import api from './api'
import type { Task, ApiResponse } from '../types'

interface GroupedTasks {
  tasks: Task[]
  grouped: {
    TODO: Task[]
    DOING: Task[]
    DONE: Task[]
  }
}

export const taskService = {
  getProjectTasks: async (projectId: string): Promise<GroupedTasks> => {
    const response = await api.get<ApiResponse<GroupedTasks>>(
      `/tasks/projects/${projectId}/tasks`
    )
    return response.data.data
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`)
    return response.data.data.task
  },

  createTask: async (
    projectId: string,
    data: {
      title: string
      description?: string
      priority?: 'LOW' | 'MEDIUM' | 'HIGH'
      status?: 'TODO' | 'DOING' | 'DONE'
      dueDate?: string
      assigneeId?: string
    }
  ): Promise<Task> => {
    const response = await api.post<ApiResponse<{ task: Task }>>(
      `/tasks/projects/${projectId}/tasks`,
      data
    )
    return response.data.data.task
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data)
    return response.data.data.task
  },

  updateTaskStatus: async (id: string, status: 'TODO' | 'DOING' | 'DONE', order?: number): Promise<Task> => {
    const response = await api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/status`, {
      status,
      order,
    })
    return response.data.data.task
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },
}