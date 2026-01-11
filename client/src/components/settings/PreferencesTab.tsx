const PreferencesTab = () => {
  return (
    <div className='p-4 space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-800'>App Preferences</h2>
        <p className='text-gray-600'>Customize your FlowSpace experience</p>
      </div>
      
      <div className='border border-gray-200 rounded-lg p-4'>
        <h3 className='font-medium mb-3'>Theme Settings</h3>
        <p className='text-gray-600 text-sm'>Choose between light and dark mode</p>
      </div>
    </div>
  );
};

export default PreferencesTab;
