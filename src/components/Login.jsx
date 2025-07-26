// src/components/Login.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('user_id', formData.userId)
      .single();

    if (error || !data) {
      setError('Invalid User ID');
      return;
    }

    if (data.password !== formData.password) {
      setError('Invalid Password');
      return;
    }

    localStorage.setItem('user', JSON.stringify(data));
    onLogin && onLogin(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogin && onLogin(null);
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto transform hover:scale-105 transition duration-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!user ? (
        <form onSubmit={handleLogin} className="space-y-5">
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
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition duration-200 transform hover:scale-105"
            >
              Login
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 rounded-xl border border-green-200">
            <p className="text-sm font-medium">Logged in as:</p>
            <p className="text-lg font-bold">{user.user_id}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-md transition duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}