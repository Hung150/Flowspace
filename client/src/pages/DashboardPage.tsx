import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  PlusIcon,
  CalendarIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { projects, isLoading: projectsLoading, createProject } = useProjects()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  })
  const [isCreating, setIsCreating] = useState(false)

  console.log('📊 Dashboard Debug:', {
    stats: stats?.data,
    loading: { projectsLoading, statsLoading }
  })

  const isLoading = projectsLoading || statsLoading

  const statCards = [
    { 
      name: 'Total Projects', 
      value: stats?.data?.totalProjects || 0,
      icon: ChartBarIcon, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Active Tasks', 
      value: stats?.data?.activeTasks || 0,
      icon: ClockIcon, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Completed', 
      value: stats?.data?.completedTasks || 0,
      icon: CheckCircleIcon, 
      color: 'bg-purple-500' 
    },
  ]

  const recentProjects = projects.slice(0, 3)

  // HANDLERS CHO QUICK ACTIONS
  const handleNewProject = () => {
    setShowNewProjectModal(true)
  }

  const handleAddTask = () => {
    if (projects.length > 0) {
      navigate(`/projects/${projects[0].id}`)
    } else {
      if (window.confirm('You need a project first. Create a new project?')) {
        setShowNewProjectModal(true)
      }
    }
  }

  const handleSetDeadline = () => {
    if (projects.length > 0) {
      navigate(`/projects/${projects[0].id}`)
    } else {
      alert('Please create a project first')
    }
  }

  const handleViewReports = () => {
    alert('Reports feature is coming soon!')
    if (projects.length > 0) {
      navigate(`/projects/${projects[0].id}`)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectData.name.trim()) return

    setIsCreating(true)
    try {
      await createProject(newProjectData)
      setShowNewProjectModal(false)
      setNewProjectData({ name: '', description: '', color: '#3b82f6' })
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setIsCreating(false)
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

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Loading dashboard...</h1>
          <p className="text-blue-100">Please wait while we fetch your data</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="bg-gray-200 p-3 rounded-lg">
                  <div className="h-6 w-6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-blue-100">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link
            to="/projects"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <span>View all</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{project._count?.tasks || 0} tasks</span>
                    <span>{project._count?.members || 1} members</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">No projects yet</div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create your first project</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions - ĐÃ CÓ CHỨC NĂNG */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Project */}
          <button 
            onClick={handleNewProject}
            className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="font-medium">New Project</p>
            <p className="text-xs text-gray-500 mt-1">Create a new project</p>
          </button>
          
          {/* Add Task */}
          <button 
            onClick={handleAddTask}
            disabled={projects.length === 0}
            className={`border rounded-lg p-4 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              projects.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
          >
            <CheckCircleIcon className={`h-8 w-8 mx-auto mb-2 ${
              projects.length === 0 ? 'text-gray-400' : 'text-green-600'
            }`} />
            <p className="font-medium">Add Task</p>
            <p className="text-xs text-gray-500 mt-1">
              {projects.length === 0 ? 'Create project first' : 'Add to existing project'}
            </p>
          </button>
          
          {/* Set Deadline */}
          <button 
            onClick={handleSetDeadline}
            disabled={projects.length === 0}
            className={`border rounded-lg p-4 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
              projects.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className={`h-8 w-8 mx-auto mb-2 ${
              projects.length === 0 ? 'text-gray-400' : 'text-yellow-600'
            }`} />
            <p className="font-medium">Set Deadline</p>
            <p className="text-xs text-gray-500 mt-1">
              {projects.length === 0 ? 'No projects' : 'Set task deadlines'}
            </p>
          </button>
          
          {/* View Reports */}
          <button 
            onClick={handleViewReports}
            className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <DocumentChartBarIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="font-medium">View Reports</p>
            <p className="text-xs text-gray-500 mt-1">Project analytics</p>
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
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
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Website Redesign"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Project goals and objectives..."
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
                      onClick={() => setNewProjectData({ ...newProjectData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newProjectData.color === color ? 'border-gray-800' : 'border-transparent'
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
                  onClick={() => {
                    setShowNewProjectModal(false)
                    setNewProjectData({ name: '', description: '', color: '#3b82f6' })
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProjectData.name.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
