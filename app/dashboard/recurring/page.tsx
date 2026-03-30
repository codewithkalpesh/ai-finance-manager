'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaPlus, FaArrowLeft, FaCalendarAlt, FaToggleOn, FaToggleOff, FaMoneyBillWave } from 'react-icons/fa';

interface RecurringEntry {
  id: string;
  userId: string;
  expenseId?: string;
  incomeId?: string;
  frequency: string;
  nextDue: string;
  isActive: boolean;
  expense?: {
    amount: number;
    category: string;
    description?: string;
  };
  income?: {
    amount: number;
    source: string;
    description?: string;
  };
}

export default function RecurringPage() {
  const router = useRouter();
  const [recurringEntries, setRecurringEntries] = useState<RecurringEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurringEntries();
  }, []);

  const fetchRecurringEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/recurring', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRecurringEntries(data.entries);
      }
    } catch (error) {
      console.error('Error fetching recurring entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const deactivateEntry = async (entryId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ entryId }),
      });

      if (response.ok) {
        fetchRecurringEntries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deactivating entry:', error);
    }
  };

  const getEntryType = (entry: RecurringEntry) => {
    if (entry.expenseId) return 'Expense';
    if (entry.incomeId) return 'Income';
    return 'Unknown';
  };

  const getEntryDetails = (entry: RecurringEntry) => {
    if (entry.expense) {
      return {
        title: entry.expense.category.charAt(0).toUpperCase() + entry.expense.category.slice(1),
        description: entry.expense.description,
        amount: entry.expense.amount,
        color: 'text-red-400',
      };
    }
    if (entry.income) {
      return {
        title: entry.income.source.charAt(0).toUpperCase() + entry.income.source.slice(1),
        description: entry.income.description,
        amount: entry.income.amount,
        color: 'text-green-400',
      };
    }
    return { title: 'Unknown', description: '', amount: 0, color: 'text-gray-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-gray-800/50 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <FaChartLine className="text-white text-xl font-bold" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FinanceAI
              </h1>
            </Link>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-gray-600 hover:border-purple-400 text-gray-300 hover:text-white transition-all duration-300 font-medium">
              <FaArrowLeft className="inline mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Recurring Transactions</h2>
          <p className="text-gray-400">Manage your recurring expenses and income</p>
        </div>

        {/* Recurring Entries List */}
        <div className="space-y-4">
          {recurringEntries.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No recurring transactions yet</p>
              <p className="text-gray-500">Add recurring expenses or income to see them here</p>
            </div>
          ) : (
            recurringEntries.map((entry) => {
              const details = getEntryDetails(entry);
              const entryType = getEntryType(entry);

              return (
                <div
                  key={entry.id}
                  className="p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{details.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entryType === 'Expense'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {entryType}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.isActive
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {entry.frequency}
                        </span>
                      </div>
                      {details.description && (
                        <p className="text-gray-400 mb-2">{details.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          Next due: {new Date(entry.nextDue).toLocaleDateString()}
                        </span>
                        <span className={`font-semibold ${details.color}`}>
                          ₹{details.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {entry.isActive ? (
                          <FaToggleOn className="text-green-400 text-xl" />
                        ) : (
                          <FaToggleOff className="text-gray-500 text-xl" />
                        )}
                        <span className={`text-sm ${entry.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                          {entry.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {entry.isActive && (
                        <button
                          onClick={() => deactivateEntry(entry.id)}
                          className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300 text-sm font-medium"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/expenses"
            className="p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 text-center"
          >
            <FaPlus className="text-2xl text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Add Recurring Expense</h3>
            <p className="text-sm text-gray-400 mt-1">Create a new recurring expense</p>
          </Link>

          <Link
            href="/dashboard/incomes"
            className="p-6 rounded-2xl border border-gray-700 hover:border-green-500/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 text-center"
          >
            <FaMoneyBillWave className="text-2xl text-green-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Add Recurring Income</h3>
            <p className="text-sm text-gray-400 mt-1">Create a new recurring income</p>
          </Link>
        </div>
      </div>
    </div>
  );
}