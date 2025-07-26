// src/components/BillHistory.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function BillHistory() {
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
            <h2>ORTHONOVA POLYCLINIC</h2>
            <p>Redg No: SUN/00051/2024</p>
            <p>Near Tarini Mandir, Panposh Road, Civil Township, Rourkela</p>
            <hr />
            <h3>INVOICE</h3>
            <div class="flex justify-between items-start">
              <div>
                <p>Patient ID: ${bill.patient_id}</p>
                <p>Date: ${new Date(bill.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th class="border px-2 py-1">Item Name</th>
                  <th class="border px-2 py-1">Unit Price</th>
                  <th class="border px-2 py-1">Quantity</th>
                  <th class="border px-2 py-1">Amount</th>
                  <th class="border px-2 py-1">Discount</th>
                  <th class="border px-2 py-1">Final Amount</th>
                </tr>
              </thead>
              <tbody>
                ${bill.bill_items
                  .map(
                    (item) => `
                      <tr>
                        <td class="border px-2 py-1">${item.service_id.service_name}</td>
                        <td class="border px-2 py-1">₹${item.service_id.price}</td>
                        <td class="border px-2 py-1">${item.quantity}</td>
                        <td class="border px-2 py-1">₹${item.service_id.price * item.quantity}</td>
                        <td class="border px-2 py-1">₹0</td>
                        <td class="border px-2 py-1">₹${item.service_id.price * item.quantity}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
            <div class="mt-6 space-y-3">
              <p class="text-sm">Final Amount: ₹${bill.total_amount}</p>
              <p class="text-sm">Payment Type: ${bill.status}</p>
            </div>
            <div class="mt-6 space-y-3">
              <p class="text-sm">MOB NO: 7681004245</p>
              <p class="text-sm">Email ID: info.orthonova@gmail.com</p>
            </div>
            <script>window.print();</script>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Bill History</h2>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by Bill No. or Patient ID"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
      </div>
      <div className="space-y-4">
        {bills.length > 0 ? (
          bills.map((bill, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
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
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
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