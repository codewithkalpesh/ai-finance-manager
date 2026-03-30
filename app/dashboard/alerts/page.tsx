'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaBars, FaTimes, FaSignOutAlt, FaShieldAlt, FaCheck } from 'react-icons/fa';

interface Alert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  expense: {
    amount: number;
    category: string;
    date: string;
  };
}

export default function AlertsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/anomalies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/anomalies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ alertId }),
      });

      if (response.ok) {
        setAlerts(alerts.filter((a) => a.id !== alertId));
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-900/20 border-red-900/50 text-red-400';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400';
      case 'low':
        return 'bg-blue-900/20 border-blue-900/50 text-blue-400';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
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
              href="/dashboard/alerts"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white"
            >
              <FaShieldAlt /> Alerts
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
            <h1 className="text-white text-xl font-bold">Fraud Detection & Alerts</h1>
            <div className="w-8"></div>
          </div>
        </nav>

        {/* Content */}
        <div className="p-6 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Anomaly Alerts</h2>
            <p className="text-gray-400">
              We detected {alerts.length} unusual {alerts.length === 1 ? 'expense' : 'expenses'} based on your spending patterns.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <FaShieldAlt className="text-5xl text-green-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No Alerts</h3>
              <p className="text-gray-400">Your spending patterns look normal. No anomalies detected!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-6 flex items-start justify-between ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-2xl mt-1">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <h3 className="font-bold mb-1">{alert.message}</h3>
                      <div className="text-sm opacity-75 space-y-1">
                        <p>Category: {alert.expense.category}</p>
                        <p>Amount: ₹{alert.expense.amount.toFixed(2)}</p>
                        <p>Date: {new Date(alert.expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="ml-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaCheck /> Resolve
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-12 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">💡 Prevent Anomalies</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Keep your regular spending patterns consistent</li>
              <li>• Notify us when you're planning large purchases</li>
              <li>• Set spending limits for different categories</li>
              <li>• Review your expenses regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
