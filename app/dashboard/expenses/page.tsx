'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaBars, FaTimes, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

export default function ExpensesPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [scannedReceipt, setScannedReceipt] = useState<null | { vendor: string; amount: string; date: string; rawText: string }>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'monthly',
  });

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'shopping', 'health', 'other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
          isRecurring: formData.isRecurring,
          frequency: formData.isRecurring ? formData.frequency : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add expense');
      }

      setMessage('Expense added successfully!');
      setFormData({
        amount: '',
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly',
      });

      // Reload expenses
      fetchExpenses();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    // Try multiple date formats
    const formats = [
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/, // DD-MM-YY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        try {
          if (match[1].length === 4) {
            // YYYY first
            const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
            return date.toISOString().split('T')[0];
          } else {
            // DD or MM first - assume DD-MM-YYYY format common in India
            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const year = match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3]);
            const date = new Date(year, month - 1, day);
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  };

  const handleReceiptScan = async (file: File | null) => {
    if (!file) {
      setScanMessage('Please select a receipt image first.');
      return;
    }

    setScanMessage('Processing receipt... this may take up to 30 seconds.');
    const startTime = Date.now();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setScanMessage('Authentication error. Please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('receipt', file);

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (!res.ok) {
        setScanMessage(`Failed to scan receipt (${duration}s): ${result.error}`);
        return;
      }

      const parsed = result.parsed;
      
      // Check if we got any meaningful extraction
      if (!parsed.amount && !parsed.vendor && !parsed.date) {
        setScanMessage(`Receipt scanned in ${duration}s but no data extracted. Please fill manually or try a clearer image.`);
        setScannedReceipt(parsed);
        return;
      }

      setScannedReceipt(parsed);
      setScanMessage(`Receipt scanned in ${duration}s. Details extracted below.`);

      // Auto-fill form with extracted data
      if (parsed.amount && parsed.amount.trim() !== '') {
        setFormData((prev) => ({
          ...prev,
          amount: parsed.amount,
        }));
      }

      if (parsed.vendor && parsed.vendor.trim() !== '') {
        setFormData((prev) => ({
          ...prev,
          description: `Receipt: ${parsed.vendor}`,
        }));
      }

      if (parsed.date && parsed.date.trim() !== '') {
        const formattedDate = parseDate(parsed.date);
        if (formattedDate) {
          setFormData((prev) => ({
            ...prev,
            date: formattedDate,
          }));
        }
      }

      // Log raw text if no extraction worked (for debugging)
      if (parsed.rawText && parsed.rawText.length > 0) {
        console.log('Raw OCR text:', parsed.rawText.substring(0, 200));
      }
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error('Receipt scan error:', error);
      setScanMessage(`Unable to scan receipt after ${duration}s. Try another image.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-white">Finance</span>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaChartLine /> Dashboard
            </Link>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white transition"
            >
              <FaArrowLeft /> Add Expense
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Nav */}
        <nav className="border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white text-xl"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="text-white text-xl font-bold">Add Expense</h1>
            <div className="w-8"></div>
          </div>
        </nav>

        {/* Form */}
        <div className="p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            {message && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  message.includes('success')
                    ? 'bg-green-900/20 text-green-400'
                    : 'bg-red-900/20 text-red-400'
                }`}
              >
                {message}
              </div>
            )}

            <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-800/60">
              <h4 className="text-sm font-semibold text-white mb-2">Scan Receipt (OCR)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setReceiptFile(file);
                  }}
                  className="text-sm text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleReceiptScan(receiptFile)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium"
                >
                  Scan Receipt
                </button>
              </div>
              {scanMessage && <p className="text-xs text-gray-300 mt-2">{scanMessage}</p>}
              {scannedReceipt && (
                <div className="mt-3 text-xs text-gray-200 bg-gray-900/40 p-2 rounded">
                  <p><strong>Vendor:</strong> {scannedReceipt.vendor}</p>
                  <p><strong>Amount:</strong> ₹{scannedReceipt.amount}</p>
                  <p><strong>Date:</strong> {scannedReceipt.date}</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
                rows={3}
                placeholder="Add notes about this expense..."
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Recurring Expense</span>
                </label>

                {formData.isRecurring && (
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="px-3 py-1 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>
              {formData.isRecurring && (
                <p className="text-sm text-gray-400 mt-2">
                  This expense will repeat {formData.frequency} until you deactivate it.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>

          {/* Recent Expenses */}
          {expenses.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
              <div className="space-y-2">
                {expenses.slice(0, 5).map((expense: any) => (
                  <div key={expense.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-sm text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-red-400">₹{expense.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
