// src/components/PrescriptionForm.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function PrescriptionForm() {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    medications: '',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) {
      console.error('Failed to load patients', error);
      return;
    }
    setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) {
      console.error('Failed to load doctors', error);
      return;
    }
    setDoctors(data || []);
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      const patient = patients.find(p => p.patient_id === formData.patientId);
      setPatientData(patient || null);
    } else {
      setPatientData(null);
    }
  }, [formData.patientId, patients]);

  useEffect(() => {
    if (formData.doctorId) {
      const doctor = doctors.find(d => d.doctor_id === formData.doctorId);
      setDoctorData(doctor || null);
    } else {
      setDoctorData(null);
    }
  }, [formData.doctorId, doctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      setError('All fields are required.');
      return;
    }
    setSuccess('Prescription generated successfully!');
    setError('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Generate Prescription</h2>

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
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Select Patient</option>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.name} ({patient.patient_id})
                </option>
              ))
            ) : (
              <option disabled>Loading patients...</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          >
            <option value="">Select Doctor</option>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.name} ({doctor.doctor_id})
                </option>
              ))
            ) : (
              <option disabled>Loading doctors...</option>
            )}
          </select>
        </div>

        <div className="flex justify-between space-x-3">
          <button
            type="submit"
            className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition duration-200 transform hover:scale-105"
          >
            Generate Prescription
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl shadow-md transition duration-200"
          >
            Print Prescription
          </button>
        </div>
      </form>

      {/* Prescription Preview */}
      {formData.patientId && formData.doctorId && (
        <div id="prescription-preview" className="print-area mt-6 border border-gray-300 rounded-lg bg-white p-6 shadow-inner">
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-area, .print-area * {
                  visibility: visible;
                }
                .print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  border: none;
                  padding: 20px;
                }
                .no-print {
                  display: none;
                }
              }
            `}
          </style>

          <table className="w-full text-sm border-collapse" style={{ fontFamily: 'Arial, sans-serif' }}>
            <tbody>
              <tr>
                <td className="font-medium">Patient ID:</td>
                <td className="px-2">{patientData?.patient_id || 'N/A'}</td>
                <td className="text-right font-medium">Date:</td>
                <td className="px-2">{new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="font-medium">Name:</td>
                <td className="px-2" colSpan="3">{patientData?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-medium">Age:</td>
                <td className="px-2">{patientData?.age || 'N/A'} YRs</td>
                <td className="font-medium">Gender:</td>
                <td className="px-2">{patientData?.gender || 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-medium">Address:</td>
                <td className="px-2" colSpan="3">{patientData?.address || 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-medium">Mobile No:</td>
                <td className="px-2" colSpan="3">{patientData?.contact_number || 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-medium">Doctor:</td>
                <td className="px-2" colSpan="2">{doctorData?.name || 'N/A'}</td>
                <td className="text-right text-xs text-gray-500">(Valid for 7 days only)</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 text-right no-print">
            <p className="text-sm text-gray-500">This is a preview. Click "Print Prescription" to print.</p>
          </div>
        </div>
      )}
    </div>
  );
}