import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/Authcontext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import StatCard from "../Components/StatCard";
import TransactionCard from "../Components/TransactionCard";
import Button from "../Components/ui/Button";
import { Copy, Wallet, TrendingUp, TrendingDown, Activity, ArrowRight } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navbar */}
      <Navbar onLogout={() => setShowModal(true)} onToggleSidebar={() => setIsOpen(!isOpen)} />

      {/* Sidebar for Mobile */}
      <div
        className={`fixed inset-y-0 left-0 transform bg-white shadow-lg w-64 p-5 transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <h2 className="text-2xl font-bold mb-6">My App</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-purple-100">
            Home
          </Link>
          <Link to="/profile" className="block px-3 py-2 rounded hover:bg-purple-100">
            Profile
          </Link>
          <Link to="/transactionHistory" className="block px-3 py-2 rounded hover:bg-purple-100">
            Transaction History
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="block px-3 py-2 rounded hover:bg-red-100 text-red-600"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
        ></div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  setShowModal(false);
                  logoutUser();
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || "Loading..."}!
          </h1>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {user?.accountNumber || "Loading..."}
            </h2>
            <button
              onClick={handleCopyAccountNumber}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Copy account number"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-muted-foreground">Here's your financial overview</p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated {timeAgo < 60 ? `${timeAgo}s` : `${Math.floor(timeAgo / 60)}m`} ago
            </p>
          )}
        </div>

        {error && <div className="p-2 mb-8 text-sm text-red-600 bg-red-100 rounded">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingUser ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-border p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : user ? (
            <>
              <StatCard
                title="Current Balance"
                value={`$${user.balance?.toFixed(2) || "0.00"}`}
                icon={Wallet}
                trend={user.balance ? "+12.5% from last month" : undefined}
                trendUp={true}
              />
              <StatCard
                title="Total Credit"
                value={`$${user?._id
                  ? transactions
                      .filter((t) => t.receiver?._id?.toString() === user._id.toString())
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                      .toFixed(2) || "0.00"
                  : "0.00"}`}
                icon={TrendingUp}
                trend="+5.2% from last month"
                trendUp={true}
              />
              <StatCard
                title="Total Debit"
                value={`$${user?._id
                  ? transactions
                      .filter((t) => t.sender?._id?.toString() === user._id.toString())
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                      .toFixed(2) || "0.00"
                  : "0.00"}`}
                icon={TrendingDown}
                trend="-3.8% from last month"
                trendUp={false}
              />
              <StatCard
                title="Total Transactions"
                value={totalCount.toString()}
                icon={Activity}
                trend="This month"
              />
            </>
          ) : (
            <p className="text-red-600 col-span-4">Failed to load user details.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            aria-label="Deposit funds"
          >
            <i className="fas fa-plus-circle"></i>
            Deposit
          </Button>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
            <Link to="/transfer" aria-label="Transfer funds">
              <i className="fas fa-exchange-alt"></i>
              Transfer
            </Link>
          </Button>
          <Button
            className="bg-red-800 text-white hover:bg-red-600 flex items-center gap-2"
            aria-label="Pay bills"
          >
            <i className="fas fa-minus-circle"></i>
            Pay Bills
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            aria-label="Withdraw funds"
          >
            <i className="fas fa-minus-circle"></i>
            Withdraw
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transactionHistory" className="flex items-center gap-2">
                See All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {loadingTx ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-border p-4 flex justify-between items-center animate-pulse"
                >
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                  </div>
                </div>
              ))
            ) : formattedTransactions.length > 0 ? (
              formattedTransactions.map((transaction, index) => (
                <TransactionCard key={index} {...transaction} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No recent transactions found
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;