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

// Patient Registration Component
function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    contactNumber: '',
    address: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.dob || !formData.gender || !formData.contactNumber || !formData.address) {
      setError('All fields are required.');
      return;
    }

    if (formData.contactNumber.length !== 10 || !/^\d+$/.test(formData.contactNumber)) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }

    const patientId = generatePatientId(formData.name, formData.contactNumber);
    const age = calculateAge(formData.dob);

    const { error } = await supabase.from('patients').insert({
      patient_id: patientId,
      name: formData.name,
      age: age,
      gender: formData.gender,
      contact_number: formData.contactNumber,
      address: formData.address,
    });

    if (error) {
      setError('Failed to register patient.');
      return;
    }

    setSuccess(`Patient registered successfully! ID: ${patientId}`);
    setFormData({
      name: '',
      dob: '',
      gender: '',
      contactNumber: '',
      address: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Patient Registration</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Age (Auto-calculated)</label>
          <input
            type="text"
            value={formData.dob ? calculateAge(formData.dob) : ''}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full address"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Register Patient
          </button>
        </div>
      </form>
    </div>
  );
}

// Doctor Registration Component
function DoctorRegistration() {
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Doctor Registration</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Dr. John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Number</label>
          <input
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="REG123456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">OPD Fees (INR)</label>
          <input
            name="opdFees"
            type="number"
            value={formData.opdFees}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition duration-200"
          >
            Register Doctor
          </button>
        </div>
      </form>
    </div>
  );
}

// Service Catalog Component
function ServiceCatalog() {
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Add Service</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Name</label>
          <input
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. X-Ray Hand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Consultation">Consultation</option>
            <option value="Imaging">Imaging</option>
            <option value="Therapy">Therapy</option>
            <option value="Lab Test">Lab Test</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 300"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200"
          >
            Add Service
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Available Services</h3>
        <ul className="space-y-2">
          {services.length > 0 ? (
            services.map((service, index) => (
              <li key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
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

// BillingPage Component
function BillingPage() {
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Generate Bill</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Patient</label>
          <select
            name="patientId"
            value={billData.patientId}
            onChange={(e) => setBillData({ ...billData, patientId: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <div className="space-y-3 mt-2">
            {billData.services.map((item, index) => (
              <div key={index} className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600">Service</label>
                  <select
                    name="serviceId"
                    value={item.serviceId}
                    onChange={(e) => handleServiceChange(e, index)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs text-gray-600">Qty</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleServiceChange(e, index)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeServiceRow(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addServiceRow}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Another Service
          </button>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-gray-700">Total Amount:</strong>
            <span className="text-xl font-semibold text-gray-900">₹{calculateTotal()}</span>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Generate Bill
          </button>
        </div>
      </form>
    </div>
  );
}

// PrescriptionForm Component
function PrescriptionForm() {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    medications: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('patient_id, name');
    if (error) console.error('Failed to load patients', error);
    else setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase.from('doctors').select('doctor_id, name');
    if (error) console.error('Failed to load doctors', error);
    else setDoctors(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.diagnosis || !formData.medications) {
      setError('All fields are required.');
      return;
    }
    setSuccess('Prescription generated successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Generate Prescription</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Patient</label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctor_id} value={doctor.doctor_id}>
                {doctor.name} ({doctor.doctor_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter diagnosis"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Medications</label>
          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter medications"
          />
        </div>

        <div className="flex justify-between space-x-3">
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Generate Prescription
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition duration-200"
          >
            Print Prescription
          </button>
        </div>
      </form>

      {/* Prescription Preview */}
      {formData.patientId && formData.doctorId && (
        <div id="prescription-preview" className="print-area mt-6 p-4 bg-white border border-gray-300 rounded-md shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Prescription</h3>
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Patient ID:</p>
              <p className="font-medium">{formData.patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Doctor ID:</p>
              <p className="font-medium">{formData.doctorId}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">Diagnosis:</p>
            <p className="font-medium">{formData.diagnosis || 'N/A'}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">Medications:</p>
            <p className="font-medium">{formData.medications || 'N/A'}</p>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 no-print">
            <p>This is a preview. Click "Print Prescription" to print.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// UserManagement Component (Admin only)
function UserManagement() {
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

    // Prevent multiple receptionists
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
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-600">Only admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Create User (Admin Only)</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="RECEPTION, ADMIN, DOC001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="receptionist">Receptionist</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Administration, Orthopedics, etc."
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition duration-200"
          >
            Add User
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <div className="space-y-2">
          <input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Enter User ID"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <button
            type="button"
            onClick={handleChangePassword}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition duration-200"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Registered Users</h3>
        <ul className="space-y-2">
          {users.map((user, index) => (
            <li key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50 text-sm">
              <p><strong>{user.user_id}</strong> ({user.role})</p>
              <p className="text-gray-600">Department: {user.department}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Login Component
function Login({ onLogin }) {
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      {!user ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="RECEPTION, ADMIN, DOC001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
            >
              Login
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded">
            <p>Logged in as:</p>
            <p className="font-medium">{user.user_id}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// BillHistory Component
function BillHistory() {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        id,
        bill_number,
        patient_id,
        total_amount,
        paid_amount,
        balance,
        status,
        created_at,
        bill_items (
          id,
          service_id (
            service_name,
            price
          ),
          quantity
        )
      `);

    if (error) {
      console.error('Failed to load bills', error);
      return;
    }
    setBills(data || []);
  };

  const handlePrintBill = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bill</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .bill { max-width: 600px; margin: auto; }
            .bill h2 { text-align: center; }
            .bill .flex { display: flex; justify-content: space-between; }
            .bill .total { font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px; }
            @media print {
              body * { visibility: hidden; }
              .print-area, .print-area * { visibility: visible; }
              .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-area">
            <h2>Orthonova Clinic</h2>
            <p><strong>Bill Number:</strong> ${bill.bill_number}</p>
            <p><strong>Patient ID:</strong> ${bill.patient_id}</p>
            <p><strong>Date:</strong> ${new Date(bill.created_at).toLocaleDateString()}</p>
            <hr class="my-4" />
            <h3>Bill Details</h3>
            <ul>
              ${bill.bill_items
                .map(
                  (item) =>
                    `<li>${item.service_id.service_name} (₹${item.service_id.price}) x ${item.quantity} = ₹${
                      item.service_id.price * item.quantity
                    }</li>`
                )
                .join('')}
            </ul>
            <div class="total">
              <div class="flex">
                <span>Total:</span>
                <span>₹${bill.total_amount}</span>
              </div>
              <div class="flex">
                <span>Paid:</span>
                <span>₹${bill.paid_amount}</span>
              </div>
              <div class="flex">
                <span>Balance:</span>
                <span>₹${bill.balance}</span>
              </div>
            </div>
            <script>window.print();</script>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Bill History</h2>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by Bill No. or Patient ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="space-y-4">
        {bills.length > 0 ? (
          bills.map((bill, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Bill #<strong>{bill.bill_number}</strong></p>
                  <p className="text-sm text-gray-600">Patient: <strong>{bill.patient_id}</strong></p>
                  <p className="text-sm text-gray-600">Date: {new Date(bill.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total: <strong>₹{bill.total_amount}</strong></p>
                  <p className="text-sm text-gray-600">Balance: <strong>₹{bill.balance}</strong></p>
                  <button
                    type="button"
                    onClick={() => handlePrintBill(bill)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Print Bill
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No bills found.</p>
        )}
      </div>
    </div>
  );
}

// Tab Component for Admin
function AdminTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-2 mb-6 border-b border-gray-300">
      <button
        onClick={() => setActiveTab('createUser')}
        className={`py-2 px-4 text-sm font-medium border-b-2 ${
          activeTab === 'createUser'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        Create User
      </button>
      <button
        onClick={() => setActiveTab('doctorRegistration')}
        className={`py-2 px-4 text-sm font-medium border-b-2 ${
          activeTab === 'doctorRegistration'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        Doctor Registration
      </button>
      <button
        onClick={() => setActiveTab('addService')}
        className={`py-2 px-4 text-sm font-medium border-b-2 ${
          activeTab === 'addService'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        Add Service
      </button>
      <button
        onClick={() => setActiveTab('billHistory')}
        className={`py-2 px-4 text-sm font-medium border-b-2 ${
          activeTab === 'billHistory'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        Bill History
      </button>
    </div>
  );
}

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