import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { 
  PlusIcon,
  CalendarIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { projects } = useProjects()
  const project = projects.find(p => p.id === id)
  
  const { 
    tasks, 
    isLoading: tasksLoading, 
    createTask, 
    updateTaskStatus,
    deleteTask,
    isDeleting
  } = useTasks(id || '')
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !id) return

    try {
      await createTask({
        projectId: id,
        title: newTaskTitle,
        status: 'TODO',
        priority: 'MEDIUM'
      })
      setNewTaskTitle('')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!window.confirm(`Delete task "${taskTitle}"?\n\nThis action cannot be undone.`)) {
      return
    }

    setDeletingTaskId(taskId)
    try {
      await deleteTask(taskId)
      console.log(`✅ Task "${taskTitle}" deleted`)
    } catch (error: unknown) {
      // SỬA: Không dùng 'any'
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task'
      console.error('❌ Failed to delete task:', error)
      alert(`Failed to delete task: ${errorMessage}`)
    } finally {
      setDeletingTaskId(null)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: 'TODO' | 'DOING' | 'DONE') => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    
    if (taskId) {
      try {
        await updateTaskStatus({
          id: taskId,
          status: newStatus,
          order: tasks[newStatus]?.length || 0
        })
      } catch (error) {
        console.error('Failed to update task status:', error)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
        <a href="/projects" className="mt-6 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Projects
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: project.color || '#3b82f6' }}
              />
              <h1 className="text-3xl font-bold">{project.name}</h1>
            </div>
            <p className="text-gray-600 max-w-3xl">{project.description}</p>
            
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  Owner: <strong>{project.owner.name || project.owner.email}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              {project.tasks?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Kanban Board</h2>
          <form onSubmit={handleCreateTask} className="flex items-center space-x-2">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="New task title"
              style={{ minWidth: '200px' }}
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </form>
        </div>

        {tasksLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['TODO', 'DOING', 'DONE'] as const).map((status) => (
              <div
                key={status}
                className="bg-gray-50 rounded-xl p-4"
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'TODO' ? 'bg-gray-400' :
                      status === 'DOING' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`} />
                    <h3 className="font-semibold">{status}</h3>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                    {tasks[status]?.length || 0}
                  </span>
                </div>

                <div className="space-y-4">
                  {tasks[status]?.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white p-4 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task.id, task.title)
                            }}
                            disabled={isDeleting && deletingTaskId === task.id}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete task"
                          >
                            {isDeleting && deletingTaskId === task.id ? (
                              <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {task.assignee && (
                            <div className="flex items-center space-x-1">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                {task.assignee.name?.[0]?.toUpperCase() || task.assignee.email[0].toUpperCase()}
                              </div>
                              <span className="text-xs">{task.assignee.name?.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span className="text-xs">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {(!tasks[status] || tasks[status].length === 0) && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                    Drop tasks here
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailPage
