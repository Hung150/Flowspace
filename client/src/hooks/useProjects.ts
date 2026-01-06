import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/project.service'
import type { Project } from '../types'

export const useProjects = () => {
  const queryClient = useQueryClient()
  queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  })

  const useProject = (id: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: () => projectService.getProjectById(id),
      enabled: !!id,
    })
  }

  const createProjectMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    useProject,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  }
}
