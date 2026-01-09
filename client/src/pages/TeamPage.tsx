import { useState, useEffect } from 'react';
import { teamAPI } from '../services/api';
import { ProjectTeam } from '../types';

const TeamPage = () => {
  const [teams, setTeams] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchTeams}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">
          Manage your project teams and members. You're participating in {teams.length} project{teams.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Stats Cards - Simple version without icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">
              {teams.reduce((sum, team) => sum + team.stats.members, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">
              {teams.reduce((sum, team) => sum + team.stats.tasks, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Your Role</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {teams.find(t => t.role)?.role.toLowerCase() || 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Project Teams</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on a project to view and manage its members
          </p>
        </div>

        {teams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't joined any project teams. Create or join a project to get started.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  // We'll implement project detail view later
                  console.log('View team:', team.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.color || '#3b82f6' }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.description || 'No description'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-sm text-gray-500">
                          <span className="font-medium">Owner:</span> {team.owner.name || team.owner.email}
                        </span>
                        <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          Your role: <span className="font-medium capitalize">{team.role.toLowerCase()}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          Joined: {new Date(team.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{team.stats.tasks}</p>
                      <p className="text-xs text-gray-500">Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{team.stats.members}</p>
                      <p className="text-xs text-gray-500">Members</p>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
