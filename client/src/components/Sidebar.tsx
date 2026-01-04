import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/projects', icon: FolderIcon, label: 'Projects' },
    { to: '/tasks', icon: CheckCircleIcon, label: 'My Tasks' },
    { to: '/team', icon: UserGroupIcon, label: 'Team' },
    { to: '/settings', icon: CogIcon, label: 'Settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] hidden md:block">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Navigation</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-12">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Projects</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasks Today</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold">24</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar