const TeamTab = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Team Management</h2>
        <p className="text-gray-600">Manage team members and permissions</p>
      </div>
      
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Team Members</h3>
        <p className="text-gray-600 text-sm mb-4">
          Invite team members and manage their roles in your projects.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Invite Team Member
        </button>
      </div>
    </div>
  );
};

export default TeamTab;
