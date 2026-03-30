'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaBars, FaTimes, FaSignOutAlt, FaUsers, FaPlus } from 'react-icons/fa';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsMessage, setSavingsMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
        }),
      });

      if (response.ok) {
        fetchGoals();
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          targetAmount: '',
          deadline: '',
          priority: 'medium',
        });
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const handleAddSavings = async (goalId: string, amount: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          goalId,
          currentAmount: amount,
        }),
      });

      if (response.ok) {
        fetchGoals();
        setShowSavingsModal(false);
        setSavingsAmount('');
        setSavingsMessage('Savings added successfully!');
        setTimeout(() => setSavingsMessage(''), 3000);
      } else {
        setSavingsMessage('Failed to add savings. Please try again.');
      }
    } catch (err) {
      console.error('Failed to add savings:', err);
      setSavingsMessage('An error occurred. Please try again.');
    }
  };

  const openSavingsModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowSavingsModal(true);
    setSavingsAmount('');
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300"
            >
              <FaChartLine /> Dashboard
            </Link>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white"
            >
              <FaUsers /> Goals
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30"
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
            <h1 className="text-white text-xl font-bold">Savings Goals</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
            >
              <FaPlus /> New Goal
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="p-6 max-w-4xl">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Create New Goal</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                    placeholder="e.g., Save for vacation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    name="targetAmount"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white resize-none"
                  rows={2}
                  placeholder="Add details about your goal..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition font-semibold"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">No savings goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const percentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                const daysLeft = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={goal.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                        <p className="text-sm text-gray-400">{goal.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPriorityColor(goal.priority)}`}>
                        {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-purple-400">{Math.min(percentage, 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 mb-4">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()} ({daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'})
                    </div>

                    <button
                      onClick={() => openSavingsModal(goal)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition font-semibold text-white text-sm"
                    >
                      Add Savings
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Savings Modal */}
      {showSavingsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add Savings to "{selectedGoal.title}"</h3>

            {savingsMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                savingsMessage.includes('success')
                  ? 'bg-green-900/20 text-green-400'
                  : 'bg-red-900/20 text-red-400'
              }`}>
                {savingsMessage}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Amount to Add (₹)</label>
              <input
                type="number"
                step="0.01"
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                placeholder="1000.00"
                min="0"
              />
            </div>

            <div className="text-sm text-gray-400 mb-4">
              Current: ₹{selectedGoal.currentAmount.toFixed(2)} → New: ₹{(selectedGoal.currentAmount + parseFloat(savingsAmount || '0')).toFixed(2)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const amount = parseFloat(savingsAmount);
                  if (amount > 0) {
                    handleAddSavings(selectedGoal.id, selectedGoal.currentAmount + amount);
                  }
                }}
                disabled={!savingsAmount || parseFloat(savingsAmount) <= 0}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Savings
              </button>
              <button
                onClick={() => setShowSavingsModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
