// src/components/Tabs.jsx
export function AdminTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
      {[
        { key: 'createUser', label: 'Create User' },
        { key: 'doctorRegistration', label: 'Doctor Registration' },
        { key: 'addService', label: 'Add Service' },
        { key: 'billHistory', label: 'Bill History' },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`py-3 px-6 text-sm font-medium rounded-lg transition duration-200 ${
            activeTab === tab.key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ReceptionistTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
      {[
        { key: 'PatientRegistration', label: 'Patient Registration' },
        { key: 'BillingPage', label: 'Billing' },
        { key: 'PrescriptionForm', label: 'Prescription' },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`py-3 px-6 text-sm font-medium rounded-lg transition duration-200 ${
            activeTab === tab.key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}