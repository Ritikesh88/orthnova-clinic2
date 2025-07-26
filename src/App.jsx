import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Helper: Check user role
function hasRole(requiredRole) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === requiredRole;
}

// Calculate Age from DOB
const calculateAge = (dob) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Generate Patient ID
const generatePatientId = (name, contact) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const last4 = contact.slice(-4);
  const first4 = name.slice(0, 4).padEnd(4, 'X').toUpperCase();
  return `${year}-${last4}-${first4}`;
};

// Generate Doctor ID
const generateDoctorId = (name, regNo) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const reg4 = regNo.slice(-4);
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .padEnd(2, 'X');
  return `DOC-${year}${reg4}-${initials}`;
};


// Main App Component
export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('createUser'); // For Admin tabs

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setSession(true);
    }
  }, []);

  const handleLogin = () => {
    setSession(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setSession(false);
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orthonova Clinic</h1>
            <p className="mt-1 text-sm text-gray-600">Patient, Doctor, Services & Billing</p>
          </div>
          <div className="w-64 text-right">
            {session ? (
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            ) : (
              <Login onLogin={handleLogin} />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {session ? (
          <div>
            {/* Admin Tabs */}
            {hasRole('admin') && (
              <>
                <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeTab === 'createUser' && <UserManagement />}
                  {activeTab === 'doctorRegistration' && <DoctorRegistration />}
                  {activeTab === 'addService' && <ServiceCatalog />}
                  {activeTab === 'billHistory' && <BillHistory />}
                </div>
              </>
            )}

            {/* Receptionist View */}
              {hasRole('receptionist') && (
            <>
            <PatientRegistration />
          <BillingPage />
          <PrescriptionForm />
        </>
      )}

            {/* Doctor View */}
            {hasRole('doctor') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PrescriptionForm />
                <BillHistory />
              </div>
            )}
          </div>
        ) : (
          <div className="col-span-3 text-center py-16 bg-white rounded-lg shadow">
            <p className="text-lg text-gray-700 mb-4">Please log in to access the clinic system</p>
            <Login onLogin={handleLogin} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 Orthonova Clinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}