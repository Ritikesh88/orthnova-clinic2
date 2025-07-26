// src/components/DoctorRegistration.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';

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

export default function DoctorRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    registrationNumber: '',
    opdFees: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.contactNumber || !formData.registrationNumber || !formData.opdFees) {
      setError('All fields are required.');
      return;
    }

    if (formData.contactNumber.length !== 10 || !/^\d+$/.test(formData.contactNumber)) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }

    if (isNaN(formData.opdFees) || parseFloat(formData.opdFees) <= 0) {
      setError('Please enter a valid OPD fees amount.');
      return;
    }

    const doctorId = generateDoctorId(formData.name, formData.registrationNumber);

    const { error } = await supabase.from('doctors').insert({
      doctor_id: doctorId,
      name: formData.name,
      contact_number: formData.contactNumber,
      registration_number: formData.registrationNumber,
      opd_fees: parseFloat(formData.opdFees),
    });

    if (error) {
      setError('Failed to register doctor.');
      return;
    }

    setSuccess(`Doctor registered successfully! ID: ${doctorId}`);
    setFormData({
      name: '',
      contactNumber: '',
      registrationNumber: '',
      opdFees: '',
    });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Doctor Registration</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Dr. John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <input
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
          <input
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="REG123456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">OPD Fees (INR)</label>
          <input
            name="opdFees"
            type="number"
            value={formData.opdFees}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="e.g. 500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition duration-200 transform hover:scale-105"
          >
            Register Doctor
          </button>
        </div>
      </form>
    </div>
  );
}