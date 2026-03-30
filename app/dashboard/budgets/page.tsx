'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaPlus, FaArrowLeft, FaWallet, FaTrash, FaEdit, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    amount: '',
    period: 'monthly',
  });

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'shopping', 'health', 'other'];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/budgets', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Authentication error. Please log in again.');
        return;
      }

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Budget created successfully!');
        setShowForm(false);
        setFormData({
          name: '',
          category: 'food',
          amount: '',
          period: 'monthly',
        });
        fetchBudgets();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/budgets?id=${budgetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return { status: 'over', color: 'bg-red-500', text: 'Over Budget' };
    if (percentage >= 80) return { status: 'warning', color: 'bg-yellow-500', text: 'Near Limit' };
    return { status: 'good', color: 'bg-green-500', text: 'On Track' };
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Budget Management</h2>
              <p className="text-gray-400">Set and track your spending limits</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-white font-semibold shadow-lg shadow-purple-500/30"
            >
              <FaPlus className="inline mr-2" />
              Create Budget
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success')
              ? 'bg-green-900/20 text-green-400 border border-green-500/30'
              : 'bg-red-900/20 text-red-400 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}

        {/* Create Budget Form */}
        {showForm && (
          <div className="mb-8 p-6 rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Create New Budget</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g., Monthly Food Budget"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Creating...' : 'Create Budget'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                  className="px-6 py-2 rounded-lg border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budgets List */}
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <FaWallet className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No budgets created yet</p>
              <p className="text-gray-500">Create your first budget to start tracking spending limits</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const status = getBudgetStatus(budget);
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
              const remaining = Math.max(budget.amount - budget.spent, 0);

              return (
                <div
                  key={budget.id}
                  className="p-6 rounded-2xl border border-gray-700 hover:border-purple-500/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{budget.name}</h3>
                        <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs capitalize">
                          {budget.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.status === 'over' ? 'bg-red-500/20 text-red-400' :
                          status.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {status.status === 'over' && <FaExclamationTriangle className="inline mr-1" />}
                          {status.status === 'good' && <FaCheckCircle className="inline mr-1" />}
                          {status.text}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm capitalize">{budget.period} budget</p>
                    </div>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300"
                      title="Delete Budget"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>₹{budget.spent.toLocaleString()} spent</span>
                      <span>₹{budget.amount.toLocaleString()} budget</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${status.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">{percentage.toFixed(1)}% used</span>
                      <span className={`font-medium ${remaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{remaining.toLocaleString()} remaining
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}