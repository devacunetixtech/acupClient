import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/Authcontext";
import { Link, useNavigate } from "react-router-dom";
import { Home, Send, Clock, User, LogOut, Menu, X, Zap, ArrowDownLeft, ArrowUpRight, Filter, Search } from "lucide-react";

const TransactionHistory = () => {
  const { getTransactions, user, filter, setFilter, logOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        setTimeAgo(Math.floor((Date.now() - lastUpdated) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  useEffect(() => {
    if (!user?._id) return;
    const fetchTransactions = async () => {
      setLoadingTx(true);
      try {
        const data = await getTransactions(filter, 0, user._id);
        console.log("Fetched transactions:", data);
        setTransactions(data.transactions || []);
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
    const interval = setInterval(fetchTransactions, 100000);
    return () => clearInterval(interval);
  }, [filter, getTransactions, user?._id]);

  const getTableHeaders = () => {
    if (filter === "sent") {
      return ["Transaction Ref", "To", "Description", "Amount", "Status", "Date"];
    } else if (filter === "received") {
      return ["Transaction Ref", "From", "Description", "Amount", "Status", "Date"];
    }
    return ["Transaction Ref", "From", "To", "Description", "Amount", "Status", "Date"];
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tx.transactionRef?.toLowerCase().includes(searchLower) ||
      tx.description?.toLowerCase().includes(searchLower) ||
      tx.sender?.name?.toLowerCase().includes(searchLower) ||
      tx.receiver?.name?.toLowerCase().includes(searchLower) ||
      tx.amount?.toString().includes(searchLower)
    );
  });

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
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 hover:bg-white/20"
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
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 bg-white text-cyan-600 shadow-lg"
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
            // onClick={() => navigate("/login")}
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
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <button onClick={() => setIsOpen(true)} className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Transaction History</h1>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Info Bar */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 mb-6 border border-cyan-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">All Transactions</h2>
                  {lastUpdated && (
                    <p className="text-sm text-gray-500">
                      Last updated {timeAgo < 60 ? `${timeAgo}s` : `${Math.floor(timeAgo / 60)}m`} ago
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm">
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-6 border border-cyan-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-cyan-600" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold outline-none cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    <option className="text-cyan-600" value="all">All Transactions</option>
                    <option className="text-cyan-600"  value="sent">Sent</option>
                    <option className="text-cyan-600"  value="received">Received</option>
                  </select>
                </div>
                
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">
                {error}
              </div>
            )}

            {/* Transactions List */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-cyan-200">
              <div className="space-y-4">
                {loadingTx ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 md:p-5 bg-gray-50 rounded-2xl animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const isSender = user?._id && tx.sender?._id && tx.sender._id.toString() === user._id.toString();
                    const transactionType = isSender ? 'debit' : 'credit';
                    
                    return (
                      <div key={tx._id || Math.random()} className={`p-4 md:p-5 rounded-2xl hover:shadow-xl transition-all transform hover:scale-102 border-2 ${
                        transactionType === 'credit' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                          : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start md:items-center space-x-4 flex-1">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                              transactionType === 'credit' 
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                : 'bg-gradient-to-br from-orange-400 to-red-500'
                            }`}>
                              {transactionType === 'credit' ? 
                                <ArrowDownLeft className="w-6 h-6 md:w-7 md:h-7 text-white" /> : 
                                <ArrowUpRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
                              }
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-base md:text-lg truncate">
                                {tx.description || "N/A"}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                {filter === "all" && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">From:</span> {tx.sender?.name || "Unknown"}
                                    {' → '}
                                    <span className="font-medium">To:</span> {tx.receiver?.name || "Unknown"}
                                  </p>
                                )}
                                {filter === "sent" && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">To:</span> {tx.receiver?.name || "Unknown"} ({tx.receiver?.accountNumber || "N/A"})
                                  </p>
                                )}
                                {filter === "received" && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">From:</span> {tx.sender?.name || "Unknown"} ({tx.sender?.accountNumber || "N/A"})
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500 font-medium">
                                  Ref: {tx.transactionRef || "N/A"}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:gap-3">
                            <p className={`font-bold text-xl md:text-2xl ${
                              transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transactionType === 'credit' ? '+' : '-'}${tx.amount ? Number(tx.amount).toFixed(2) : "0.00"}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                              tx.status === 'completed'
                                ? 'bg-green-200 text-green-700'
                                : 'bg-yellow-200 text-yellow-700'
                            }`}>
                              {tx.status || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">No transactions found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm ? "Try adjusting your search" : "Your transactions will appear here"}
                    </p>
                  </div>
                )}
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

export default TransactionHistory;