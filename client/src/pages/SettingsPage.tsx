const SettingsPage = () => {
  const settingsItems = [
    { title: '👤 Profile', desc: 'Update personal information' },
    { title: '🔐 Account', desc: 'Security and password' },
    { title: '⚙️ Preferences', desc: 'App customization' },
    { title: '🔔 Notifications', desc: 'Alerts and emails' },
    { title: '👥 Team', desc: 'Manage team members' },
    { title: '💳 Billing', desc: 'Payment and plans' },
  ];

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold text-gray-900 mb-2'>Settings</h1>
      <p className='text-gray-600 mb-8'>Configure your application preferences</p>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {settingsItems.map((item) => (
          <div key={item.title} className='bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow'>
            <div className='text-2xl mb-3'>{item.title.split(' ')[0]}</div>
            <h3 className='font-semibold text-lg mb-2'>{item.title.split(' ').slice(1).join(' ')}</h3>
            <p className='text-gray-600 text-sm mb-4'>{item.desc}</p>
            <button className='text-blue-600 hover:text-blue-800 font-medium text-sm'>
              Configure →
            </button>
          </div>
        ))}
      </div>
      
      <div className='mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>Quick Stats</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center p-6 bg-white rounded-lg shadow-sm'>
            <div className='text-3xl font-bold text-blue-600'>3</div>
            <div className='text-gray-600'>Active Projects</div>
          </div>
          <div className='text-center p-6 bg-white rounded-lg shadow-sm'>
            <div className='text-3xl font-bold text-green-600'>5</div>
            <div className='text-gray-600'>Active Tasks</div>
          </div>
          <div className='text-center p-6 bg-white rounded-lg shadow-sm'>
            <div className='text-3xl font-bold text-purple-600'>12</div>
            <div className='text-gray-600'>Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
