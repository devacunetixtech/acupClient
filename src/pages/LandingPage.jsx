import { Eye, EyeOff, User, Mail, Lock, Home, Send, Clock, LogOut, Menu, X, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, Wallet, DollarSign, PieChart, Bell, Settings, Shield, Zap, Star, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';



const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-cyan-950 via-cyan-900 to-blue-900">
    {/* Navigation */}
    <nav className="bg-cyan-900/50 backdrop-blur-lg border-b border-cyan-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">ACUPAY</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/signin">
              <button

                className="px-6 py-2.5 text-cyan-300 hover:text-white font-semibold transition-colors"
              >
                Sign In
              </button>
            </Link>
            <Link to="/signup">

              <button


                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-6 py-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full">
            <span className="text-cyan-300 font-semibold flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Trusted by 10,000+ customers</span>
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Banking Made
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"> Lightning Fast</span>
          </h1>
          <p className="text-xl text-cyan-200 mb-10 max-w-2xl mx-auto">
            Experience the future of digital banking with instant transfers, real-time analytics, and zero hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <button

                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Open Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-cyan-400/50 hover:bg-white/20 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950 via-transparent to-transparent h-40 bottom-0 z-10"></div>
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-6 border border-cyan-400/30 shadow-2xl">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-8 text-white">
              <p className="text-cyan-200 mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold">₦2,450,000.00</h2>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 bg-cyan-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose ACUPAY?</h2>
          <p className="text-cyan-300 text-lg">Everything you need for modern banking</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-2xl border border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Instant Transfers</h3>
            <p className="text-cyan-300">Send and receive money in seconds, not hours. Lightning-fast transactions at your fingertips.</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-2xl border border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Bank-Grade Security</h3>
            <p className="text-cyan-300">Your money is protected with military-grade encryption and multi-factor authentication.</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-2xl border border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Global Reach</h3>
            <p className="text-cyan-300">Transfer money worldwide with competitive exchange rates and zero hidden fees.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Stats Section */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">10K+</h3>
            <p className="text-cyan-300 font-semibold">Active Users</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">₦5B+</h3>
            <p className="text-cyan-300 font-semibold">Transactions</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">99.9%</h3>
            <p className="text-cyan-300 font-semibold">Uptime</p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">24/7</h3>
            <p className="text-cyan-300 font-semibold">Support</p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20"></div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
        <p className="text-cyan-200 text-xl mb-10">Join thousands of satisfied customers using ACUPAY today.</p>
        <Link to="/signup">
          <button
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
          >
            Create Your Free Account
          </button>
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-cyan-950/50 border-t border-cyan-800/50 py-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">ACUPAY</span>
        </div>
        <p className="text-cyan-400">© 2025 ACUPAY. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default LandingPage;