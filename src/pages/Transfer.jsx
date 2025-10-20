import React, { useState, useContext, useRef, useEffect, useCallback } from "react";
import { AuthContext } from "../context/Authcontext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Button from "../Components/ui/Button";
import Input from "../Components/ui/Input";
import Label from "../Components/ui/Label";
import Textarea from "../Components/ui/Textarea";
import Card from "../Components/ui/Card";
import { useToast } from "../hooks/use-toast";
import { Send, ArrowRight, Home, Clock, User, LogOut, Menu, X, Zap, Mail, Phone, DollarSign, Download } from "lucide-react";
import html2pdf from "html2pdf.js";

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const Transfer = () => {
  const { makeTransfer, pin, setPin: setPinState, fetchRecipientName, user, getDashboardData, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [tranDescription, setTranDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const [localBalance, setLocalBalance] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Refs for PIN inputs
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getDashboardData();
        console.log("Transfer fetchUser data:", data);
        setLocalBalance(data.user.balance);
        setBalanceError(null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setBalanceError("Failed to load balance");
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchUser();
  }, [getDashboardData]);

  // Fetch recipient name
  const fetchName = useCallback(
    async (accountNumber, signal) => {
      const trimmedAccountNumber = accountNumber.trim();
      if (/^[a-zA-Z0-9]{14}$/.test(trimmedAccountNumber)) {
        setRecipientLoading(true);
        setRecipientError(null);
        try {
          console.log(`Initiating fetchRecipientName for: ${trimmedAccountNumber}`);
          const name = await fetchRecipientName(trimmedAccountNumber, signal);
          if (name !== null) {
            setRecipientName(name);
          }
        } catch (err) {
          if (err.name === "AbortError") {
            console.log(`fetchRecipientName aborted for ${trimmedAccountNumber}`);
            return;
          }
          setRecipientError(err.response?.data?.error || "Failed to fetch recipient name");
          setRecipientName("");
        } finally {
          setRecipientLoading(false);
        }
      } else {
        setRecipientName("");
        setRecipientError(null);
      }
    },
    [fetchRecipientName]
  );

  const throttledFetchName = useCallback(throttle(fetchName, 500), [fetchName]);

  const handleRecipientChange = (e) => {
    const value = e.target.value;
    setToAccountNumber(value);
    const controller = new AbortController();
    throttledFetchName(value, controller.signal);
  };

  const generateReceipt = (balance, transaction) => {
    setReceiptData({ balance, transaction });
    setIsModalOpen(true);
  };

  const downloadReceipt = () => {
    try {
      const element = document.querySelector(".receipt");
      console.log("Receipt element styles:", window.getComputedStyle(element));
      const opt = {
        margin: 1,
        filename: `Transaction_Receipt_${receiptData.transaction.transactionRef}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };
      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .catch((error) => {
          console.error("PDF generation failed:", error);
          toast({
            title: "Error",
            description: "Failed to generate PDF receipt. Please try again.",
            variant: "destructive",
          });
        });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePinDigitChange = (index, value) => {
    console.log("setPinState type:", typeof setPinState, setPinState);
    if (typeof setPinState !== "function") {
      console.error("setPinState is not a function. Check AuthContext.");
      toast({
        title: "Error",
        description: "PIN update failed. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }
    if (/^\d?$/.test(value)) {
      const newPin = (pin || "").padEnd(4, " ").split("");
      newPin[index] = value;
      setPinState(newPin.join("").trim());
      if (value && index < 3) {
        pinRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedAccountNumber = toAccountNumber.trim();
    const trimmedDescription = tranDescription.trim();

    console.log("Submitting:", {
      amount: Number(amount),
      toAccountNumber: trimmedAccountNumber,
      tranDescription: trimmedDescription,
      tranPin: pin,
    });

    // Validation
    if (!/^[a-zA-Z0-9]{14}$/.test(trimmedAccountNumber)) {
      toast({
        title: "Error",
        description: `Account number must be exactly 14 alphanumeric characters (got "${trimmedAccountNumber}")`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (isNaN(amount) || Number(amount) < 1) {
      toast({
        title: "Error",
        description: "Amount must be at least 1",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (!trimmedDescription) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (!pin || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Error",
        description: "Transaction PIN must be a 4-digit number",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await makeTransfer(Number(amount), trimmedAccountNumber, trimmedDescription, pin);
      toast({
        title: "Transfer Successful",
        description: `$${amount} sent to ${recipientName || trimmedAccountNumber}. Ref: ${res.transaction.transactionRef}`,
      });
      generateReceipt(res.balance, res.transaction);
      setAmount("");
      setToAccountNumber("");
      setTranDescription("");
      setPinState("");
      setRecipientName("");
      setRecipientError(null);
      pinRefs.forEach((ref) => (ref.current.value = ""));
      setLocalBalance(res.balance);
    } catch (err) {
      console.error("Transfer error:", err.response?.data || err.message);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setReceiptData(null);
  };

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
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 bg-white text-cyan-600 shadow-lg"
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
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <button onClick={() => setIsOpen(true)} className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Transfer Money</h1>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl p-6 md:p-8 text-white mb-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
              <div className="relative z-10">
                <p className="text-cyan-100 mb-2 font-medium">Available Balance</p>
                {balanceLoading ? (
                  <div className="h-10 bg-white/20 rounded-lg w-48 animate-pulse"></div>
                ) : balanceError ? (
                  <p className="text-red-200">{balanceError}</p>
                ) : (
                  <h2 className="text-4xl md:text-5xl font-bold">${localBalance?.toFixed(2) || "0.00"}</h2>
                )}
              </div>
            </div>

            {/* Transfer Form */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-cyan-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Send money instantly</h2>
                <p className="text-gray-500 mt-2">Transfer funds to any bank account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Recipient Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter 14-digit account number (e.g., ACUP8112994147)"
                    value={toAccountNumber}
                    onChange={handleRecipientChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg font-medium"
                    required
                  />
                  <div className="mt-2 text-sm font-medium">
                    {recipientLoading && <span className="text-cyan-600">Loading recipient...</span>}
                    {recipientError && <span className="text-red-600">{recipientError}</span>}
                    {recipientName && !recipientLoading && !recipientError && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Recipient: {recipientName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Account Name</label>
                  <div className="px-5 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                    <p className="text-gray-700 font-medium">
                      {recipientName || "Account name will appear here"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-xl">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-xl font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Description</label>
                  <textarea
                    placeholder="What's this transfer for?"
                    value={tranDescription}
                    onChange={(e) => setTranDescription(e.target.value)}
                    rows="3"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Transaction PIN</label>
                  <div className="flex space-x-3 justify-center">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={`pin-${index}`}
                        type="password"
                        ref={pinRefs[index]}
                        value={pin ? pin[index] || "" : ""}
                        onChange={(e) => handlePinDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        maxLength={1}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                        placeholder="•"
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-300 rounded-2xl p-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-700 font-semibold">Transfer Amount</span>
                    <span className="font-bold text-gray-800">${amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-700 font-semibold">Transfer Fee</span>
                    <span className="font-bold text-gray-800">$0.00</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-cyan-300 to-blue-300 my-3"></div>
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-gray-800">Total Amount</span>
                    <span className="font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">${amount || "0.00"}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Transfer Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Receipt Modal */}
      {isModalOpen && receiptData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-cyan-200">
            <div className="receipt" style={{ 
              backgroundColor: '#ffffff', 
              padding: '27px',
              fontFamily: 'Arial, sans-serif'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: '#10b981',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg style={{ width: '40px', height: '40px', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px', margin: '0' }}>
                  Transaction Successful!
                </h2>
                {/* <p style={{ color: '#10b981', fontWeight: '600', margin: '8px 0 0 0' }}>Your transfer was completed</p> */}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  backgroundColor: '#ecfeff',
                  borderRadius: '12px', 
                  padding: '13px',
                  border: '2px solid #06b6d4',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px', margin: '0 0 8px 0' }}>Amount</p>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#0891b2', margin: '0' }}>
                    ${receiptData.transaction.amount}
                  </p>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0', 
                    borderBottom: '1px solid #e5e7eb',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Recipient</span>
                    <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', textAlign: 'right' }}>
                      {receiptData.transaction.receiver?.name || "Unknown"}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0', 
                    borderBottom: '1px solid #e5e7eb',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Account Number</span>
                    <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', textAlign: 'right' }}>
                      {receiptData.transaction.toAccountNumber}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0', 
                    borderBottom: '1px solid #e5e7eb',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Description</span>
                    <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', textAlign: 'right', maxWidth: '60%' }}>
                      {receiptData.transaction.description}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0', 
                    borderBottom: '1px solid #e5e7eb',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Reference</span>
                    <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '12px', textAlign: 'right' }}>
                      {receiptData.transaction.transactionRef}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Date</span>
                    <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '12px', textAlign: 'right' }}>
                      {new Date(receiptData.transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '16px', 
                borderRadius: '8px',
                textAlign: 'center',
                marginTop: '5px'
              }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                  Thank you for using ACUPAY
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={downloadReceipt}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Moda */}
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

export default Transfer;