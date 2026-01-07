import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const ProjectsPage = () => {
  const { 
    projects, 
    isLoading, 
    createProject, 
    deleteProject, 
    isCreating, 
    isDeleting
    // ĐÃ XOÁ: deleteError (không dùng)
  } = useProjects()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  })
  const [deleteStatus, setDeleteStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: string | null;
  }>({
    loading: false,
    error: null,
    success: null
  })

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.name.trim()) return

    try {
      await createProject(newProject)
      setShowCreateModal(false)
      setNewProject({ name: '', description: '', color: '#3b82f6' })
    } catch (error) {
      // SỬA: Không dùng 'any'
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
      console.error('Failed to create project:', error)
      alert(`Error creating project: ${errorMessage}`)
    }
  }

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) {
      return
    }

    // Reset status
    setDeleteStatus({
      loading: true,
      error: null,
      success: null
    })

    try {
      console.log(`🗑️ Deleting project: ${name} (${id})`)
      
      // Gọi hàm delete từ hook
      const result = await deleteProject(id)
      
      console.log('✅ Delete result:', result)
      
      // Hiển thị thông báo thành công
      setDeleteStatus({
        loading: false,
        error: null,
        success: `Project "${name}" deleted successfully`
      })
      
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => {
        setDeleteStatus(prev => ({ ...prev, success: null }))
      }, 5000)
      
    } catch (error: unknown) {
      // SỬA: Không dùng 'any'
      console.error('❌ Delete failed:', error)
      
      let userMessage = 'Failed to delete project'
      
      // Xử lý error với type checking
      if (error instanceof Error) {
        userMessage = error.message
      } else if (typeof error === 'string') {
        userMessage = error
      }
      
      // Phân tích lỗi để hiển thị thông báo thân thiện
      const errorLower = userMessage.toLowerCase()
      if (errorLower.includes('foreign') || errorLower.includes('constraint') || 
          errorLower.includes('reference') || errorLower.includes('task')) {
        userMessage = `Cannot delete "${name}" because it contains tasks.\n\nPlease delete all tasks first.`
      } else if (errorLower.includes('not found') || errorLower.includes('404')) {
        userMessage = `Project "${name}" not found. It may have been already deleted.`
      } else if (errorLower.includes('unauthorized') || errorLower.includes('401')) {
        userMessage = 'You are not authorized to delete this project.\n\nPlease login again.'
      }
      
      setDeleteStatus({
        loading: false,
        error: userMessage,
        success: null
      })
      
      // Hiển thị alert nếu lỗi nghiêm trọng
      if (errorLower.includes('foreign') || errorLower.includes('constraint')) {
        alert(`⚠️ ${userMessage}`)
      }
    }
  }

  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track all your projects in one place</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isCreating}
        >
          <PlusIcon className="h-5 w-5" />
          <span>{isCreating ? 'Creating...' : 'New Project'}</span>
        </button>
      </div>

      {/* Delete Status Messages */}
      {deleteStatus.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{deleteStatus.success}</span>
          </div>
        </div>
      )}

      {deleteStatus.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{deleteStatus.error}</span>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
          <div className="text-gray-400 mb-4">No projects yet</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={isCreating}
          >
            <PlusIcon className="h-5 w-5" />
            <span>{isCreating ? 'Creating...' : 'Create your first project'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    />
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-xl font-semibold hover:text-blue-600"
                    >
                      {project.name}
                    </Link>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleteStatus.loading || isDeleting}
                    title="Delete project"
                  >
                    {deleteStatus.loading ? (
                      <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>
                    <strong>{project._count?.tasks || 0}</strong> tasks
                  </span>
                  <span>
                    <strong>{project._count?.members || 1}</strong> members
                  </span>
                </div>
                <span className="text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {project.owner.name?.[0]?.toUpperCase() || project.owner.email[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-xs text-gray-500">{project.owner.name || project.owner.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Create New Project</h2>
              <p className="text-gray-600 mt-1">Start organizing your work</p>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Website Redesign"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Project goals and objectives..."
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Color
                </label>
                <div className="flex space-x-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newProject.color === color ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={isCreating}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProject.name.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
