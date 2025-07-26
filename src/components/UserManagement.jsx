// src/components/UserManagement.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function hasRole(requiredRole) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === requiredRole;
}

export default function UserManagement() {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    role: '',
    department: '',
  });
  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select();
    if (error) {
      console.error('Failed to load users', error);
      return;
    }
    setUsers(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.password || !formData.role || !formData.department) {
      setError('All fields are required.');
      return;
    }

    if (formData.role === 'receptionist') {
      const { data } = await supabase
        .from('users')
        .select()
        .eq('role', 'receptionist')
        .single();

      if (data) {
        setError('Only one Receptionist is allowed.');
        return;
      }
    }

    const { error } = await supabase.from('users').insert({
      user_id: formData.userId,
      password: formData.password,
      role: formData.role,
      department: formData.department,
    });

    if (error) {
      setError('Failed to add user.');
      return;
    }

    setSuccess('User created successfully!');
    setFormData({
      userId: '',
      password: '',
      role: '',
      department: '',
    });

    fetchUsers();
  };

  const handleChangePassword = async () => {
    if (!formData.userId || !formData.password) {
      setError('User ID and new password are required.');
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ password: formData.password })
      .eq('user_id', formData.userId);

    if (error) {
      setError('Failed to change password.');
      return;
    }

    setSuccess('Password changed successfully.');
  };

  if (!hasRole('admin')) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <p className="text-gray-600 text-lg">Only admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Create User (Admin Only)</h2>

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
          <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
          <input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="RECEPTION, ADMIN, DOC001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="receptionist">Receptionist</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Administration, Orthopedics, etc."
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition duration-200 transform hover:scale-105"
          >
            Add User
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Change Password</h3>
        <div className="space-y-3">
          <input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Enter User ID"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm"
          />
          <button
            type="button"
            onClick={handleChangePassword}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-md transition duration-200"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Registered Users</h3>
        <ul className="space-y-2">
          {users.map((user, index) => (
            <li key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm">
              <p><strong>{user.user_id}</strong> ({user.role})</p>
              <p className="text-gray-600">Department: {user.department}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}