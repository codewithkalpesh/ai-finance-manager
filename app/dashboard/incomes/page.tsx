'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaPlus, FaArrowLeft, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

interface Income {
  id: string;
  amount: number;
  source: string;
  description?: string;
  date: string;
  isRecurring: boolean;
  tags: string[];
}

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export default function IncomesPage() {
  const router = useRouter();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [allocateToGoals, setAllocateToGoals] = useState(false);
  const [goalAllocations, setGoalAllocations] = useState<{[goalId: string]: string}>({});
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'monthly',
    tags: '',
  });

  useEffect(() => {
    fetchIncomes();
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchIncomes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/incomes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIncomes(data.incomes);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Authentication error. Please log in again.');
        return;
      }

      // First add the income
      const response = await fetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to add income');
        return;
      }

      // If allocating to goals, update goal amounts
      if (allocateToGoals && Object.keys(goalAllocations).length > 0) {
        for (const [goalId, amountStr] of Object.entries(goalAllocations)) {
          const amount = parseFloat(amountStr);
          if (amount > 0) {
            const goal = goals.find(g => g.id === goalId);
            if (goal) {
              await fetch('/api/goals', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  goalId,
                  currentAmount: goal.currentAmount + amount,
                }),
              });
            }
          }
        }
      }

      setMessage('Income added successfully!');
      setShowForm(false);
      setFormData({
        amount: '',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly',
        tags: '',
      });
      setAllocateToGoals(false);
      setGoalAllocations({});
      fetchIncomes();
      fetchGoals();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding income:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

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
              <h2 className="text-3xl font-bold text-white mb-2">Income Management</h2>
              <p className="text-gray-400">Track your income sources and recurring payments</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 text-white font-semibold shadow-lg shadow-green-500/30"
            >
              <FaPlus className="inline mr-2" />
              Add Income
            </button>
          </div>

          {/* Stats Card */}
          <div className="p-6 rounded-2xl border border-gray-700 hover:border-green-500/50 bg-green-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <FaMoneyBillWave className="text-white text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">₹{totalIncome.toLocaleString()}</p>
                <p className="text-gray-400">Total Income</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Income Form */}
        {showForm && (
          <div className="mb-8 p-6 rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Add New Income</h3>

            {message && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  message.includes('success')
                    ? 'bg-green-900/20 text-green-400 border border-green-500/30'
                    : 'bg-red-900/20 text-red-400 border border-red-500/30'
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    required
                  >
                    <option value="">Select source</option>
                    <option value="salary">Salary</option>
                    <option value="freelance">Freelance</option>
                    <option value="business">Business</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="work, monthly, bonus"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-gray-300">Recurring Income</span>
                </label>

                {formData.isRecurring && (
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="px-3 py-1 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              {/* Goal Allocation Section */}
              {goals.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={allocateToGoals}
                      onChange={(e) => setAllocateToGoals(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                    />
                    <label className="text-sm font-medium text-gray-300">Allocate portion to savings goals</label>
                  </div>

                  {allocateToGoals && (
                    <div className="space-y-3">
                      {goals.map((goal) => (
                        <div key={goal.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{goal.title}</p>
                            <p className="text-xs text-gray-400">
                              Current: ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                            </p>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={goalAllocations[goal.id] || ''}
                            onChange={(e) => setGoalAllocations({
                              ...goalAllocations,
                              [goal.id]: e.target.value
                            })}
                            className="w-24 px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        Enter amounts to allocate from this income to your goals. These will be added to your goal progress.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Income'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Income List */}
        <div className="space-y-4">
          {incomes.length === 0 ? (
            <div className="text-center py-12">
              <FaMoneyBillWave className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No income entries yet</p>
              <p className="text-gray-500">Add your first income to get started</p>
            </div>
          ) : (
            incomes.map((income) => (
              <div
                key={income.id}
                className="p-6 rounded-2xl border border-gray-700 hover:border-green-500/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white capitalize">{income.source}</h3>
                      {income.isRecurring && (
                        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                          Recurring
                        </span>
                      )}
                    </div>
                    {income.description && (
                      <p className="text-gray-400 mb-2">{income.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(income.date).toLocaleDateString()}
                      </span>
                      {income.tags.length > 0 && (
                        <div className="flex gap-1">
                          {income.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">₹{income.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}