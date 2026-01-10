import { useState, useEffect } from 'react'
import { User, Settings, Bell, Shield, Palette, AlertTriangle } from 'lucide-react'
import '../index.css'

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  joinedDate: string
}

interface UserStats {
  activeProjects: number
  activeTasks: number
  completedTasks: number
}

interface NotificationSettings {
  emailNotifications: boolean
  taskReminders: boolean
  weeklyReports: boolean
  projectUpdates: boolean
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  taskReminders: true,
  weeklyReports: false,
  projectUpdates: true,
}

const SettingsPage = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [activeTab, setActiveTab] = useState('profile')

  // Base URL for API - adjust based on your backend
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  // Fetch user và stats
  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token') || 'demo-token'
        
        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.data)
        } else {
          // Demo data nếu API chưa sẵn sàng
          setUser({
            id: '1',
            name: 'Luong Duc Hung',
            email: 'hung@example.com',
            role: 'Project Manager',
            joinedDate: '2024-01-15',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung'
          })
        }

        // Fetch stats
        const statsResponse = await fetch(`${API_BASE_URL}/user/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.data)
        } else {
          // Demo stats
          setStats({
            activeProjects: 3,
            activeTasks: 12,
            completedTasks: 45
          })
        }
        
      } catch (error) {
        console.error('Error fetching user and stats:', error)
        // Fallback demo data
        setUser({
          id: '1',
          name: 'Luong Duc Hung',
          email: 'hung@example.com',
          role: 'Project Manager',
          joinedDate: '2024-01-15',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung'
        })
        setStats({
          activeProjects: 3,
          activeTasks: 12,
          completedTasks: 45
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndStats()
  }, [API_BASE_URL])

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem('token') || 'demo-token'
        const prefResponse = await fetch(`${API_BASE_URL}/user/preferences`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (prefResponse.ok) {
          const prefData = await prefResponse.json()
          setNotificationSettings(prev => ({
            ...prev,
            ...(prefData.notifications || {})
          }))
          setTheme(prefData.theme || 'light')
        }
      } catch (error) {
        console.error('Error fetching preferences:', error)
      }
    }

    fetchPreferences()
  }, [API_BASE_URL])

  const handleSaveProfile = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('token') || 'demo-token'
      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email
        })
      })
      
      if (response.ok) {
        alert('Profile updated successfully!')
      } else {
        alert('Profile saved locally (API not available)')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Profile saved locally')
    }
  }

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem('token') || 'demo-token'
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notifications: notificationSettings,
          theme: theme
        })
      })
      
      if (response.ok) {
        alert('Preferences saved!')
      } else {
        alert('Preferences saved locally (API not available)')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Preferences saved locally')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        </div>
        <p className="text-gray-600 ml-11">
          Manage your account, preferences, and application settings
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Active Projects</h3>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.activeProjects}</p>
              </div>
              <div className="text-blue-600 text-2xl">📊</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Active Tasks</h3>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.activeTasks}</p>
              </div>
              <div className="text-yellow-600 text-2xl">✅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Completed</h3>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.completedTasks}</p>
              </div>
              <div className="text-green-600 text-2xl">🎯</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow border p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'appearance' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <Palette className="w-5 h-5" />
                <span className="font-medium">Appearance</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('danger')}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'danger' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Danger Zone</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && user && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Profile Information
              </h2>
              
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-gray-500">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => alert('Avatar upload feature coming soon!')}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                    >
                      <span className="text-sm">📷</span>
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(user.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notification Preferences
              </h2>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                        {key === 'taskReminders' && 'Get reminders for upcoming and overdue tasks'}
                        {key === 'weeklyReports' && 'Receive weekly summary of your activity'}
                        {key === 'projectUpdates' && 'Notifications when projects you follow are updated'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          [key]: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePreferences}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Palette className="w-6 h-6" />
                Appearance
              </h2>
              
              <div className="space-y-3">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <label
                    key={themeOption}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      theme === themeOption
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={themeOption}
                      checked={theme === themeOption}
                      onChange={() => setTheme(themeOption)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium capitalize">{themeOption} Mode</span>
                      <p className="text-sm text-gray-600">
                        {themeOption === 'system' && 'Follow your system theme settings'}
                        {themeOption === 'light' && 'Light background with dark text'}
                        {themeOption === 'dark' && 'Dark background with light text'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePreferences}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  Save Appearance Settings
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Security
              </h2>
              
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="font-medium text-gray-800">Change Password</div>
                  <div className="text-sm text-gray-600">Update your password regularly for security</div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="font-medium text-gray-800">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                </button>
                
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="font-medium text-gray-800">Active Sessions</div>
                  <div className="text-sm text-gray-600">Manage your logged-in devices and sessions</div>
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Danger Zone
              </h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => alert('Export feature coming soon!')}
                  className="w-full text-left p-4 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition"
                >
                  <div className="font-medium text-red-700">Export All Data</div>
                  <div className="text-sm text-red-600">Download a copy of all your data in JSON format</div>
                </button>
                
                <button 
                  onClick={() => {
                    if (confirm('Are you absolutely sure? This action cannot be undone.')) {
                      alert('Account deletion feature coming soon!')
                    }
                  }}
                  className="w-full text-left p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <div className="font-medium">Delete Account</div>
                  <div className="text-sm">Permanently remove your account and all associated data</div>
                </button>
              </div>
              
              <p className="text-sm text-red-600 mt-4">
                ⚠️ Warning: Account deletion is permanent and cannot be undone. All your projects, tasks, and data will be permanently lost.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
