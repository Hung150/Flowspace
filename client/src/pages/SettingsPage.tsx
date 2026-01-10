import { useState } from 'react';
import { 
  User, Lock, Bell, Users, CreditCard, Settings as SettingsIcon, 
  Palette, Globe, Moon, Trash2, LogOut, Save, Upload 
} from 'lucide-react';

// Component con cho Profile
const ProfileTab = () => {
  const [userData, setUserData] = useState({
    name: 'Luong Duc Hung',
    email: 'LongHung152@gmail.com',
    bio: 'Project Manager at FlowSpace',
    position: 'Team Lead',
    avatar: 'https://ui-avatars.com/api/?name=Luong+Duc+Hung&background=4f46e5&color=fff'
  });

  const handleSave = () => {
    // Logic save profile
    alert('Profile saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
        <p className="text-gray-600">Update your personal details and avatar</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar Section */}
        <div className="lg:w-1/3">
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={userData.avatar} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-2 right-1/4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                <Upload size={16} />
              </button>
            </div>
            <p className="text-center text-sm text-gray-500">
              Click the upload button to change your avatar
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:w-2/3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={userData.position}
                onChange={(e) => setUserData({...userData, position: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Project Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={userData.bio}
                onChange={(e) => setUserData({...userData, bio: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con cho Preferences
const PreferencesTab = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Ho_Chi_Minh',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">App Preferences</h2>
        <p className="text-gray-600">Customize your FlowSpace experience</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="text-blue-600" />
            <h3 className="font-medium">Theme</h3>
          </div>
          <div className="flex gap-4">
            {['light', 'dark', 'auto'].map((theme) => (
              <button
                key={theme}
                onClick={() => setPreferences({...preferences, theme})}
                className={`px-4 py-2 rounded-lg border ${preferences.theme === theme 
                  ? 'bg-blue-100 border-blue-500 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Language & Timezone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="text-blue-600" />
              <h3 className="font-medium">Language</h3>
            </div>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={preferences.language}
              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Moon className="text-blue-600" />
              <h3 className="font-medium">Timezone</h3>
            </div>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={preferences.timezone}
              onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
            >
              <option value="Asia/Ho_Chi_Minh">(GMT+7) Ho Chi Minh</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">(GMT-5) New York</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-blue-600" />
            <h3 className="font-medium">Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 'email', label: 'Email notifications', checked: preferences.emailNotifications },
              { id: 'push', label: 'Push notifications', checked: preferences.pushNotifications },
              { id: 'weekly', label: 'Weekly reports', checked: preferences.weeklyReports }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>{item.label}</span>
                <button
                  onClick={() => setPreferences({
                    ...preferences, 
                    [`${item.id}Notifications`]: !item.checked
                  })}
                  className={`w-12 h-6 rounded-full transition ${item.checked ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transform transition ${item.checked ? 'translate-x-7' : 'translate-x-1'} mt-0.5`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Settings Page Component
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile': return <ProfileTab />;
      case 'preferences': return <PreferencesTab />;
      // Add other tabs as you create them
      default: return (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600">This section is under development</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account and configure application preferences
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <img 
                  src="https://ui-avatars.com/api/?name=Luong+Duc+Hung&background=4f46e5&color=fff&size=128"
                  alt="Avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow"
                />
                <h3 className="font-semibold text-gray-900">Luong Duc Hung</h3>
                <p className="text-sm text-gray-500">LongHung152@gmail.com</p>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <button className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Quick Stats (Optional) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-gray-600">Active Projects</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-gray-600">Active Tasks</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
