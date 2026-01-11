// File: client/src/components/settings/ProfileTab.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Giả sử bạn có AuthContext

const ProfileTab = () => {
  const { user, updateProfile } = useAuth(); // Hook lấy user từ context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load user data khi component mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        position: user.position || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData); // Gọi API update
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload avatar logic
      const formData = new FormData();
      formData.append('avatar', file);
      // Gọi API upload
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
        <p className="text-gray-600">Update your personal details and avatar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=4f46e5&color=fff`}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
              📤
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-500">Click the upload button to change your avatar</p>
            <p className="text-xs text-gray-400 mt-1">Max size: 2MB. Formats: JPG, PNG, GIF</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Project Manager"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200 characters</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
