import React, { useState, useEffect, useCallback } from 'react';
import { TeamMember, ProjectTeam, AddMemberRequest } from '../types';
import { UserSearchResult, teamService } from '../services/team.service';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');
  const [addingMember, setAddingMember] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [MODAL] Fetching members for project:', project.id);
      
      const data = await teamService.getProjectMembers(project.id);
      
      console.log('✅ [MODAL] Members fetched:', data?.length || 0);
      setMembers(data || []);
      
    } catch (err) {
      console.error('❌ [MODAL] Failed to load team members:', err);
      setError('Failed to load team members. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    if (isOpen && project) {
      console.log('🔄 [MODAL] Modal opened, fetching members...');
      fetchMembers();
    }
  }, [isOpen, project, fetchMembers]);

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      console.log('🔍 [MODAL] Searching users:', query);
      const results = await teamService.searchUsers(query);
      console.log('✅ [MODAL] Search results:', results.length);
      setSearchResults(results);
    } catch (error) {
      console.error('❌ [MODAL] Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      alert('Please search and select a user first');
      return;
    }

    try {
      setAddingMember(true);
      
      console.log('➕ [MODAL] Adding member:', selectedUser.email);
      
      const requestData: AddMemberRequest = { 
        userId: selectedUser.id, 
        role: newMemberRole 
      };
      
      await teamService.addMember(project.id, requestData);
      
      console.log('✅ [MODAL] Member added successfully');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetchMembers();
      
      setShowAddMember(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setNewMemberRole('MEMBER');
      
      alert(`${selectedUser.email} has been added to the project successfully!`);
      
    } catch (err: unknown) {
      console.error('❌ [MODAL] Failed to add member:', err);
      
      let errorMessage = 'Failed to add member';
      if (err && typeof err === 'object') {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      console.log('✏️ [MODAL] Updating role for member:', memberId);
      await teamService.updateMemberRole(project.id, memberId, { role: newRole });
      
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      
      console.log('✅ [MODAL] Role updated successfully');
    } catch (err) {
      console.error('❌ [MODAL] Failed to update role:', err);
      alert('Failed to update role. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      console.log('🗑️ [MODAL] Removing member:', memberId);
      await teamService.removeMember(project.id, memberId);
      
      setMembers(members.filter(member => member.id !== memberId));
      
      console.log('✅ [MODAL] Member removed successfully');
    } catch (err) {
      console.error('❌ [MODAL] Failed to remove member:', err);
      alert('Failed to remove member. Please try again.');
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
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 mb-4 space-y-2 max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-2">Select a user:</p>
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchResults([]);
                      setSearchQuery(user.email);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name || ''}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    {selectedUser?.id === user.id && (
                      <span className="text-blue-600 text-sm font-medium">✓ Selected</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Thông báo khi đã chọn user */}
            {selectedUser && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Selected user:</p>
                      <p className="text-sm text-green-700">{selectedUser.name || 'No name'} ({selectedUser.email})</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchQuery('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Role selection */}
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role:
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <div className="flex items-end space-x-4 mt-4">
                  <button
                    onClick={handleAddMember}
                    disabled={addingMember || !selectedUser}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingMember ? 'Adding...' : 'Add Member'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMember(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {!selectedUser && (
                <p className="mt-2 text-sm text-amber-600">
                  Note: You must search and select a user before adding them as a member.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading members...</p>
              <p className="text-xs text-gray-500 mt-2">Project ID: {project.id}</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">{error}</p>
                <div className="mt-2 text-sm text-red-600">
                  <p>Endpoint: GET /projects/{project.id}/members</p>
                  <p>Please check if this endpoint exists in your backend.</p>
                </div>
                <button
                  onClick={fetchMembers}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry Loading Members
                </button>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-600 mb-4">
                {isOwner 
                  ? 'Add members to collaborate on this project.' 
                  : 'Only project owner can add members.'}
              </p>
              {isOwner && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add First Member
                </button>
              )}
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
