import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

const DashboardPage = () => {
  const { user } = useAuth()
  const { projects, isLoading } = useProjects()

  const stats = [
    { name: 'Total Projects', value: projects.length, icon: ChartBarIcon, color: 'bg-blue-500' },
    { name: 'Active Tasks', value: '0', icon: ClockIcon, color: 'bg-green-500' },
    { name: 'Completed', value: '0', icon: CheckCircleIcon, color: 'bg-purple-500' },
  ]

  const recentProjects = projects.slice(0, 3)

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
        {stats.map((stat) => (
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

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : recentProjects.length > 0 ? (
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
            <Link
              to="/projects"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create your first project</span>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <PlusIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="font-medium">New Project</p>
          </button>
          <button className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <CheckCircleIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="font-medium">Add Task</p>
          </button>
          <button className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <ClockIcon className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <p className="font-medium">Set Deadline</p>
          </button>
          <button className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="font-medium">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
