import { useState } from 'react';
import { 
  AccountTab, 
  ProfileTab, 
  PreferencesTab,
  NotificationsTab,
  TeamTab 
} from '../components/settings';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: '👤 Profile', component: <ProfileTab /> },
    { id: 'account', label: '🔐 Account', component: <AccountTab /> },
    { id: 'preferences', label: '⚙️ Preferences', component: <PreferencesTab /> },
    { id: 'notifications', label: '🔔 Notifications', component: <NotificationsTab /> },
    { id: 'team', label: '👥 Team', component: <TeamTab /> },
    { id: 'danger', label: '⚠️ Danger Zone', component: <DangerZoneTab /> },
  ];

  const DangerZoneTab = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
      <div className="space-y-4">
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
          <p className="text-red-600 text-sm mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Delete Account
          </button>
        </div>
        
        <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
          <h3 className="font-medium text-yellow-800 mb-2">Export Data</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Download all your data in JSON format.
          </p>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and configure application preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  LD
                </div>
                <h3 className="font-semibold text-gray-900">Luong Duc Hung</h3>
                <p className="text-sm text-gray-500">LongHung152@gmail.com</p>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{tab.label.split(' ')[0]}</span>
                    <span>{tab.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button className="w-full flex items-center justify-center gap-2 mt-8 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition">
                <span>🚪</span>
                Logout
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Projects</span>
                  <span className="font-bold text-xl">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Tasks</span>
                  <span className="font-bold text-xl">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <span className="font-bold text-xl">12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              {tabs.find(tab => tab.id === activeTab)?.component}
            </div>

            {/* Additional Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Check our documentation or contact support for assistance.
                </p>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Visit Help Center →
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">App Version</h3>
                <p className="text-gray-600 text-sm mb-2">FlowSpace v1.0.0</p>
                <p className="text-gray-500 text-xs">Last updated: January 2024</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Check for Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
