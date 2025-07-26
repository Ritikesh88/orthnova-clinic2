// src/components/ServiceCatalog.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ServiceCatalog() {
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceType: '',
    price: '',
  });
  const [services, setServices] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName || !formData.serviceType || !formData.price) {
      setError('All fields are required.');
      return;
    }

    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    const { error } = await supabase.from('services').insert({
      service_name: formData.serviceName,
      service_type: formData.serviceType,
      price: parseFloat(formData.price),
    });

    if (error) {
      setError('Failed to add service.');
      return;
    }

    setSuccess(`Service added successfully!`);
    setFormData({
      serviceName: '',
      serviceType: '',
      price: '',
    });

    fetchServices();
  };

  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select();
    if (error) {
      console.error('Failed to load services', error);
      return;
    }
    setServices(data || []);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Add Service</h2>

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
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
          <input
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="e.g. X-Ray Hand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Select Type</option>
            <option value="Consultation">Consultation</option>
            <option value="Imaging">Imaging</option>
            <option value="Therapy">Therapy</option>
            <option value="Lab Test">Lab Test</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (INR)</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="e.g. 300"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-md transition duration-200 transform hover:scale-105"
          >
            Add Service
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Available Services</h3>
        <ul className="space-y-2">
          {services.length > 0 ? (
            services.map((service, index) => (
              <li key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <strong>{service.service_name}</strong> - {service.service_type} (₹{service.price})
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No services added yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}