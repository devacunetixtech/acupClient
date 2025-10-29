import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/Authcontext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import StatCard from "../Components/StatCard";
import TransactionCard from "../Components/TransactionCard";
import Button from "../Components/ui/Button";
import { Copy, Wallet, TrendingUp, TrendingDown, Activity, ArrowRight, Home, Send, Clock, User, LogOut, Menu, X, Zap, Bell, CreditCard, DollarSign, PieChart, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const Dashboard = () => {
  const { getDashboardData, getTransactions, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState(0);

  // Auto-increment "time ago" every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        setTimeAgo(Math.floor((Date.now() - lastUpdated) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getDashboardData();
        setUser(data.user);
        setLastUpdated(Date.now());
        setTimeAgo(0);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user details.");
        navigate("/signin");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    const interval = setInterval(fetchUser, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [getDashboardData, navigate]);

  // Fetch recent transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?._id) return; // Wait for user to load
      setLoadingTx(true);
      try {
        const data = await getTransactions("all", 3, user._id);
        console.log("Dashboard data:", data);
        setTransactions(data.transactions || []);
        setTotalCount(data.totalCount || 0);
        setLastUpdated(Date.now());
        setTimeAgo(0);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setLoadingTx(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 100000); // Poll every 100s
    return () => clearInterval(interval);
  }, [getTransactions, user?._id]);

  // Copy account number to clipboard
  const handleCopyAccountNumber = async () => {
    if (!user?.accountNumber) {
      toast({
        title: "Error",
        description: "No account number available to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(user.accountNumber);
      toast({
        title: "Success",
        description: "Account number copied!",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to copy account number:", err);
      toast({
        title: "Error",
        description: "Failed to copy account number",
        variant: "destructive",
      });
    }
  };

  // Map transactions to TransactionCard format
  const formattedTransactions = transactions.map((tx) => ({
    type: user?._id && tx.sender?._id?.toString() === user._id.toString() ? "debit" : "credit",
    amount: (tx.amount || 0).toFixed(2),
    sender: tx.sender?.name || "Unknown",
    receiver: tx.receiver?.name || "Unknown",
    description: tx.description || "N/A",
    date: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A",
    status: tx.status || "Unknown",
  }));

  // Calculate totals
  const totalCredit = user?._id
    ? transactions
        .filter((t) => t.receiver?._id?.toString() === user._id.toString())
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    : 0;

  const totalDebit = user?._id
    ? transactions
        .filter((t) => t.sender?._id?.toString() === user._id.toString())
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100">
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-cyan-600 to-blue-600 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 shadow-2xl`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                <Zap className="w-7 h-7 text-cyan-600" />
              </div>
              <span className="text-2xl font-bold">ACUPAY</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden hover:bg-white/20 p-2 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <Link
              to="/dashboard"
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 bg-white text-cyan-600 shadow-lg"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Dashboard</span>
            </Link>
            <Link
              to="/transfer"
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 hover:bg-white/20"
            >
              <Send className="w-5 h-5" />
              <span className="font-semibold">Transfer</span>
            </Link>
            <Link
              to="/transactionHistory"
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 hover:bg-white/20"
            >
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Transactions</span>
            </Link>
            <Link
              to="/profile"
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 hover:bg-white/20"
            >
              <User className="w-5 h-5" />
              <span className="font-semibold">Profile</span>
            </Link>
          </nav>

          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-white/20 transition-all transform hover:scale-105 mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-cyan-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 gap-2">
            <button onClick={() => setIsOpen(true)} className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition flex-shrink-0">
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                Welcome, {user?.name || "Loading..."}
              </h2>
              {lastUpdated && (
                <p className="text-xs md:text-sm text-gray-500">
                  Updated {timeAgo < 60 ? `${timeAgo}s` : `${Math.floor(timeAgo / 60)}m`} ago
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <button className="relative hover:bg-cyan-50 p-2 rounded-lg transition">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Welcome Section */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-8 text-white mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <p className="text-cyan-100 mb-2 font-medium">Available Balance</p>
              {loadingUser ? (
                <div className="h-12 bg-white/20 rounded-lg w-64 animate-pulse"></div>
              ) : (
                <h2 className="text-5xl font-bold mb-8">₦{user?.balance?.toFixed(2) || "0.00"}</h2>
              )}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 flex-1 min-w-[250px]">
                  <div className="flex-1">
                    <p className="text-cyan-100 text-sm font-medium mb-1">Account Number</p>
                    <p className="font-bold text-lg">{user?.accountNumber || "Loading..."}</p>
                  </div>
                  <button
                    onClick={handleCopyAccountNumber}
                    className="bg-white text-cyan-600 p-3 rounded-xl transition-all hover:scale-110 shadow-lg hover:shadow-xl"
                    title="Copy account number"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-right min-w-[180px]">
                  <p className="text-cyan-100 text-sm font-medium mb-1">Account Type</p>
                  <p className="font-bold text-lg">Savings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-50">Total Income</h3>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              {loadingTx ? (
                <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold mb-2">${totalCredit.toFixed(2)}</p>
                  <p className="text-sm text-green-100">+12% from last month</p>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-orange-50">Total Expenses</h3>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
              {loadingTx ? (
                <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold mb-2">${totalDebit.toFixed(2)}</p>
                  <p className="text-sm text-orange-100">+8% from last month</p>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-cyan-50">Transactions</h3>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              {loadingTx ? (
                <div className="h-8 bg-white/20 rounded w-16 animate-pulse"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold mb-2">{totalCount}</p>
                  <p className="text-sm text-cyan-100">This month</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-cyan-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
                <Link
                  to="/transactionHistory"
                  className="text-cyan-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <span>See All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {loadingTx ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))
                ) : formattedTransactions.length > 0 ? (
                  formattedTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all transform hover:scale-102 border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                          transaction.type === 'credit' 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-br from-orange-400 to-red-500'
                        }`}>
                          {transaction.type === 'credit' ? 
                            <ArrowDownLeft className="w-6 h-6 text-white" /> : 
                            <ArrowUpRight className="w-6 h-6 text-white" />
                          }
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <p className={`font-bold text-lg ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No recent transactions found</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-cyan-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/transfer"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 block text-center"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Money</span>
                </Link>
                <button className="w-full bg-gradient-to-r from-cyan-400 to-blue-400 text-white p-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Request Money</span>
                </button>
                <button className="w-full bg-gradient-to-r from-cyan-300 to-blue-300 text-white p-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-96 border border-cyan-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  logoutUser();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;