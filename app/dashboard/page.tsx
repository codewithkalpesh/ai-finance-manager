'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaPlus, FaBrain, FaShieldAlt, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaMoneyBillWave, FaCalendarAlt, FaWallet } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface Income {
  id: string;
  amount: number;
  source: string;
  description?: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch expenses
      const expensesResponse = await fetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setExpenses(expensesData.expenses);
      }

      // Fetch incomes
      const incomesResponse = await fetch('/api/incomes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (incomesResponse.ok) {
        const incomesData = await incomesResponse.json();
        setIncomes(incomesData.incomes);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Calculate stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyIncomes = incomes
    .filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    })
    .reduce((sum, income) => sum + income.amount, 0);

  const totalBalance = monthlyIncomes - monthlyExpenses;
  const savingsRate = monthlyIncomes > 0 ? ((monthlyIncomes - monthlyExpenses) / monthlyIncomes * 100) : 0;

  // Prepare pie chart data for expenses by category
  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expenseCategories).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
    color: getCategoryColor(category),
  }));

  // Prepare income vs expense comparison
  const incomeVsExpenseData = [
    { name: 'Income', value: monthlyIncomes, color: '#10B981' },
    { name: 'Expenses', value: monthlyExpenses, color: '#EF4444' },
  ];

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      food: '#F59E0B',
      transport: '#3B82F6',
      entertainment: '#8B5CF6',
      shopping: '#EC4899',
      bills: '#6B7280',
      healthcare: '#EF4444',
      education: '#10B981',
      other: '#6B7280',
    };
    return colors[category] || '#6B7280';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white transition"
            >
              <FaChartLine /> Dashboard
            </Link>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaPlus /> Add Expense
            </Link>
            <Link
              href="/dashboard/incomes"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaMoneyBillWave /> Add Income
            </Link>
            <Link
              href="/dashboard/recurring"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaCalendarAlt /> Recurring
            </Link>
            <Link
              href="/dashboard/budgets"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaWallet /> Budgets
            </Link>
            <Link
              href="/dashboard/chatbot"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaBrain /> AI Chatbot
            </Link>
            <Link
              href="/dashboard/alerts"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaShieldAlt /> Alerts
            </Link>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 transition"
            >
              <FaUsers /> Goals
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
        <nav className="border-b border-gray-800 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white text-xl"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="text-white text-xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">{user?.name}</span>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {/* Stats Cards */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition">
              <p className="text-gray-400 text-sm mb-2">Total Balance</p>
              <p className="text-3xl font-bold text-white">₹{totalBalance.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-2">Current month</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition">
              <p className="text-gray-400 text-sm mb-2">Monthly Income</p>
              <p className="text-3xl font-bold text-blue-400">₹{monthlyIncomes.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-2">This month</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500/50 transition">
              <p className="text-gray-400 text-sm mb-2">Monthly Expenses</p>
              <p className="text-3xl font-bold text-red-400">₹{monthlyExpenses.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-2">This month</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition">
              <p className="text-gray-400 text-sm mb-2">Savings Rate</p>
              <p className="text-3xl font-bold text-green-400">{savingsRate.toFixed(1)}%</p>
              <p className="text-gray-500 text-xs mt-2">Of income</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/dashboard/expenses"
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 hover:shadow-lg hover:shadow-blue-500/20 transition"
            >
              <FaPlus className="text-2xl mb-2" />
              <h3 className="font-semibold">Add Expense</h3>
              <p className="text-sm text-blue-100 mt-1">Record your spending</p>
            </Link>

            <Link
              href="/dashboard/incomes"
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 hover:shadow-lg hover:shadow-green-500/20 transition"
            >
              <FaMoneyBillWave className="text-2xl mb-2" />
              <h3 className="font-semibold">Add Income</h3>
              <p className="text-sm text-green-100 mt-1">Track your earnings</p>
            </Link>

            <Link
              href="/dashboard/chatbot"
              className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 hover:shadow-lg hover:shadow-purple-500/20 transition"
            >
              <FaBrain className="text-2xl mb-2" />
              <h3 className="font-semibold">Ask AI</h3>
              <p className="text-sm text-purple-100 mt-1">Get financial advice</p>
            </Link>
          </div>

          {/* Charts Section */}
          {(expenses.length > 0 || incomes.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Expense Categories Pie Chart */}
              {expenseChartData.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Expense Categories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Income vs Expense Comparison */}
              {(monthlyIncomes > 0 || monthlyExpenses > 0) && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incomeVsExpenseData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {incomeVsExpenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">Welcome to your financial dashboard!</p>
            <p className="text-sm text-gray-500">Start by adding your first expense or income to see charts and analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
