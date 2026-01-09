import { useState, useEffect } from 'react';
import { teamAPI } from '../services/api';
import { TeamMember, ProjectTeam } from '../types';

interface ProjectTeamModalProps {
  project: ProjectTeam;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const ProjectTeamModal: React.FC<ProjectTeamModalProps> = ({
  project,
  isOpen,
  onClose,
  currentUserId
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      fetchMembers();
    }
  }, [isOpen, project]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getProjectMembers(project.id);
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      setAddingMember(true);
      // TODO: Implement search user by email first
      // For now, we'll need userId
      alert('Need to implement user search by email first');
      setShowAddMember(false);
      setNewMemberEmail('');
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await teamAPI.updateMemberRole(project.id, memberId, { role: newRole });
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await teamAPI.removeMember(project.id, memberId);
      setMembers(members.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  if (!isOpen) return null;

  const isOwner = project.owner.id === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{project.name} - Team Members</h2>
              <p className="text-gray-600 mt-1">{project.description || 'No description'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {members.length} Members
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {project.stats.tasks} Tasks
            </div>
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Owner: {project.owner.name || project.owner.email}
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddMember(true)}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                + Add Member
              </button>
            )}
          </div>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center space-x-4">
              <input
                type="email"
                placeholder="Enter member's email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                onClick={handleAddMember}
                disabled={addingMember || !newMemberEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {addingMember ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Note: User must have an account with this email to be added.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading members...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchMembers}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-600">
                {isOwner 
                  ? 'Add members to collaborate on this project.' 
                  : 'Only project owner can add members.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Owner first */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {(project.owner.name || project.owner.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {project.owner.name || project.owner.email}
                        </h4>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Owner
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{project.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Project Owner</span>
                </div>
              </div>

              {/* Other members */}
              {members
                .filter(member => member.user.id !== project.owner.id)
                .map((member) => {
                  const isCurrentUser = member.user.id === currentUserId;
                  const roleColors = {
                    ADMIN: 'bg-purple-100 text-purple-800',
                    MEMBER: 'bg-blue-100 text-blue-800',
                    VIEWER: 'bg-gray-100 text-gray-800'
                  };

                  return (
                    <div key={member.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">
                                {member.user.name || member.user.email}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-gray-500">(You)</span>
                                )}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${roleColors[member.role as keyof typeof roleColors] || 'bg-gray-100'}`}>
                                {member.role}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{member.user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Joined {new Date(member.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {isOwner && !isCurrentUser && (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                                <option value="VIEWER">Viewer</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                              >
                                Remove
                              </button>
                            </>
                          )}
                          {!isOwner && isCurrentUser && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to leave this project?')) {
                                  handleRemoveMember(member.id);
                                }
                              }}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                            >
                              Leave Project
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {isOwner 
                ? 'As owner, you can manage all members and their roles.' 
                : 'Contact the project owner to manage members.'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTeamModal;
