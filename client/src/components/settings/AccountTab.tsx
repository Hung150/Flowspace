const AccountTab = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
      <div className="space-y-4">
        <div className="border p-4 rounded-lg">
          <h3 className="font-medium mb-2">Change Password</h3>
          <p className="text-sm text-gray-600">Update your password regularly for security</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600">Add an extra layer of security</p>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
