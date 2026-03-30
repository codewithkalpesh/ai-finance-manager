'use client';

import Link from "next/link";
import { FaChartLine, FaBrain, FaVoicemail, FaImage, FaShieldAlt, FaUsers } from 'react-icons/fa';

export default function Home() {
  const features = [
    {
      icon: FaImage,
      title: 'AI Receipt Scanner',
      description: 'Upload receipts and let AI automatically extract expenses',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: FaVoicemail,
      title: 'Voice Assistant',
      description: 'Add expenses and ask queries using voice commands',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: FaBrain,
      title: 'AI Chatbot',
      description: 'Get personalized financial advice from our AI assistant',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10'
    },
    {
      icon: FaShieldAlt,
      title: 'Fraud Detection',
      description: 'Get alerted about unusual spending patterns',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: FaChartLine,
      title: 'Investment Recommendations',
      description: 'Personalized investment suggestions based on your profile',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: FaUsers,
      title: 'Expense Sharing',
      description: 'Split bills with friends and track settlements',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-gray-800/50 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FaChartLine className="text-white text-xl font-bold" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinanceAI
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="px-6 py-2.5 rounded-lg border border-gray-600 hover:border-purple-400 text-gray-300 hover:text-white transition-all duration-300 font-medium hover:shadow-lg hover:shadow-purple-500/20">
              Login
            </Link>
            <Link href="/signup" className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50">
            <p className="text-sm font-semibold text-purple-300">✨ AI-Powered Financial Management</p>
          </div>
          <h2 className="text-5xl sm:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Your Financial Future, Powered by AI
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Automate expense tracking, get intelligent insights, detect anomalies in real-time, and receive personalized investment recommendations all in one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-lg font-bold text-white shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transform hover:scale-105">
              Get Started Free →
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-lg border border-purple-400/50 hover:border-purple-400 text-white font-bold transition-all duration-300 bg-purple-500/10 hover:bg-purple-500/20">
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border border-gray-700 hover:border-purple-400/50 transition-all duration-300 p-8 ${feature.bgColor} backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-all duration-300`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-4 mb-20">
          <div className="p-8 rounded-2xl border border-gray-700 hover:border-blue-500/50 bg-blue-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <p className="text-4xl font-black text-blue-400 mb-2">100%</p>
            <p className="text-gray-400 font-semibold">Automated Tracking</p>
          </div>
          <div className="p-8 rounded-2xl border border-gray-700 hover:border-purple-500/50 bg-purple-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <p className="text-4xl font-black text-purple-400 mb-2">AI ✨</p>
            <p className="text-gray-400 font-semibold">Smart Insights</p>
          </div>
          <div className="p-8 rounded-2xl border border-gray-700 hover:border-pink-500/50 bg-pink-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
            <p className="text-4xl font-black text-pink-400 mb-2">24/7</p>
            <p className="text-gray-400 font-semibold">Voice & Chat</p>
          </div>
          <div className="p-8 rounded-2xl border border-gray-700 hover:border-green-500/50 bg-green-500/5 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <p className="text-4xl font-black text-green-400 mb-2">🔒</p>
            <p className="text-gray-400 font-semibold">Enterprise Security</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 via-slate-900/40 to-purple-900/40 p-12 backdrop-blur-xl text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Ready to Transform Your Finances?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">Join thousands of users who are already managing their money smarter with AI</p>
            <Link href="/signup" className="inline-block px-10 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 mt-20 py-12 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500 mb-2 font-medium">© 2025 AI Finance Manager. Your personal financial companion.</p>
          <p className="text-gray-600 text-sm">Built with ❤️ for smarter financial decisions</p>
        </div>
      </footer>
    </div>
  );
}