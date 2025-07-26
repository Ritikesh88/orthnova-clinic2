// src/components/BillingPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function BillingPage() {
  const [billData, setBillData] = useState({
    patientId: '',
    services: [{ serviceId: '', quantity: 1 }],
  });
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchServices();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('patient_id, name');
    if (error) console.error('Failed to load patients', error);
    else setPatients(data || []);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select();
    if (error) console.error('Failed to load services', error);
    else setServices(data || []);
  };

  const handleServiceChange = (e, index) => {
    const newServices = [...billData.services];
    newServices[index][e.target.name] = e.target.value;
    setBillData({ ...billData, services: newServices });
  };

  const addServiceRow = () => {
    setBillData({
      ...billData,
      services: [...billData.services, { serviceId: '', quantity: 1 }],
    });
  };

  const removeServiceRow = (index) => {
    const newServices = billData.services.filter((_, i) => i !== index);
    setBillData({ ...billData, services: newServices });
  };

  const calculateTotal = () => {
    return billData.services.reduce((total, item) => {
      const service = services.find((s) => s.id === item.serviceId);
      return total + (service ? service.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billData.patientId || billData.services.length === 0) {
      setError('Please select a patient and add at least one service.');
      return;
    }

    const totalAmount = calculateTotal();
    const billNumber = `BILL-${Date.now()}`;

    const {  bill, error: billError } = await supabase.from('bills').insert({
      bill_number: billNumber,
      patient_id: billData.patientId,
      total_amount: totalAmount,
      paid_amount: 0,
      balance: totalAmount,
      status: 'Pending',
    }).select('id, bill_number').single();

    if (billError) {
      setError('Failed to create bill.');
      return;
    }

    const billItems = billData.services.map((item) => ({
      bill_id: bill.id,
      service_id: item.serviceId,
      quantity: item.quantity,
      amount: services.find((s) => s.id === item.serviceId)?.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('bill_items').insert(billItems);
    if (itemsError) {
      setError('Failed to add bill items.');
      return;
    }

    setSuccess(`Bill generated successfully! Bill #${bill.bill_number}`);
    setBillData({
      patientId: '',
      services: [{ serviceId: '', quantity: 1 }],
    });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Generate Bill</h2>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
          <select
            name="patientId"
            value={billData.patientId}
            onChange={(e) => setBillData({ ...billData, patientId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.name} ({patient.patient_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
          <div className="space-y-3 mt-2">
            {billData.services.map((item, index) => (
              <div key={index} className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Service</label>
                  <select
                    name="serviceId"
                    value={item.serviceId}
                    onChange={(e) => handleServiceChange(e, index)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.service_name} (₹{service.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Qty</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleServiceChange(e, index)}
                    className="w-20 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeServiceRow(index)}
                  className="px-3 py-1 text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addServiceRow}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Another Service
          </button>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-gray-700">Total Amount:</strong>
            <span className="text-2xl font-semibold text-gray-900">₹{calculateTotal()}</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md transition duration-200 transform hover:scale-105"
          >
            Generate Bill
          </button>
        </div>
      </form>
    </div>
  );
}