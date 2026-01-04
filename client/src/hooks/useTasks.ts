import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/task.service'
import type { Task } from '../types'

export const useTasks = (projectId?: string) => {
  const queryClient = useQueryClient()

  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getProjectTasks(projectId!),
    enabled: !!projectId,
  })

  const useTask = (id: string) => {
    return useQuery({
      queryKey: ['task', id],
      queryFn: () => taskService.getTaskById(id),
      enabled: !!id,
    })
  }

  const createTaskMutation = useMutation({
    mutationFn: (data: { projectId: string; title: string; status?: 'TODO' | 'DOING' | 'DONE'; priority?: 'LOW' | 'MEDIUM' | 'HIGH' }) =>
      taskService.createTask(data.projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      taskService.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status, order }: { id: string; status: 'TODO' | 'DOING' | 'DONE'; order?: number }) =>
      taskService.updateTaskStatus(id, status, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const groupedTasks = {
    TODO: tasksQuery.data?.tasks.filter((t: Task) => t.status === 'TODO') || [],
    DOING: tasksQuery.data?.tasks.filter((t: Task) => t.status === 'DOING') || [],
    DONE: tasksQuery.data?.tasks.filter((t: Task) => t.status === 'DONE') || [],
  }

  return {
    tasks: groupedTasks,
    allTasks: tasksQuery.data?.tasks || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    useTask,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    updateTaskStatus: updateTaskStatusMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}