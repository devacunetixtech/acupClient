import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import { Home, Send, Clock, User, LogOut, Menu, X, Zap, Settings, Shield, Lock, Mail, Phone, CreditCard, ArrowUpRight } from "lucide-react";
import logo from "../assets/acunetix.png";

function Profile() {
  const { user, setUser, pin, setPin: setPinState, setPinApi, logoutUser } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const navigate = useNavigate();

  // Refs for PIN and Confirm PIN inputs
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const confirmPinRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const savedUser = localStorage.getItem("UserDet");
    console.log("Raw UserDet from localStorage:", savedUser);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("Parsed user data:", parsedUser);
        if (!parsedUser || !parsedUser.user || Object.keys(parsedUser.user).length === 0) {
          setError("User data is empty or invalid.");
          navigate("/signin");
        } else {
          setUser(parsedUser.user);
          // Check if PIN is already set using hasTranPin field from backend
          setIsPinSet(!!parsedUser.user.hasTranPin);
          if (pin === undefined) {
            setPinState("");
          }
        }
      } catch (err) {
        console.error("Error parsing UserDet:", err);
        setError("Failed to parse user data.");
        navigate("/signup");
      }
    } else {
      console.log("No UserDet found in localStorage.");
      navigate("/signup");
    }
  }, [navigate, pin, setPinState, setUser]);

  const handlePinDigitChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newPin = (pin || "").padEnd(4, " ").split("");
      newPin[index] = value;
      setPinState(newPin.join("").trim());
      if (value && index < 3) {
        pinRefs[index + 1].current.focus();
      }
    }
  };

  const handleConfirmPinDigitChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newConfirmPin = (confirmPin || "").padEnd(4, " ").split("");
      newConfirmPin[index] = value;
      setConfirmPin(newConfirmPin.join("").trim());
      if (value && index < 3) {
        confirmPinRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e, isConfirmPin = false) => {
    const refs = isConfirmPin ? confirmPinRefs : pinRefs;
    const value = isConfirmPin ? confirmPin : pin;
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs[index - 1].current.focus();
    }
  };

  // Update handlePinUpdate to set isPinSet after success
  const handlePinUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // PIN validation
    if (!/^\d{4}$/.test(pin)) {
      setMessage({ type: "error", text: "PIN must be exactly 4 digits." });
      setLoading(false);
      return;
    }

    // Confirm PIN validation
    if (pin !== confirmPin) {
      setMessage({ type: "error", text: "PIN and Confirm PIN do not match." });
      setLoading(false);
      return;
    }

    try {
      const response = await setPinApi(pin);
      setIsPinSet(true); // Mark PIN as set
      
      // Update localStorage to persist PIN status
      const savedUser = localStorage.getItem("UserDet");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        parsedUser.user.hasTranPin = true; // Use hasTranPin from backend response
        localStorage.setItem("UserDet", JSON.stringify(parsedUser));
        setUser(parsedUser.user); // Update context
      }
      
      setMessage({ type: "success", text: "Transaction PIN set successfully ✅" });
      setPinState("");
      setConfirmPin("");
      pinRefs.forEach((ref) => (ref.current.value = ""));
      confirmPinRefs.forEach((ref) => (ref.current.value = ""));
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to set transaction PIN ❌",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

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
              to="/transactions"
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all transform hover:scale-105 hover:bg-white/20"
            >
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Transactions</span>
            </Link>
            <Link
              to="/profile"
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-white/20 transition-all transform hover:scale-105"
            >
              <User className="w-5 h-5" />
              <span className="font-semibold">Profile</span>
            </Link>
          </nav>

          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-cyan-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 hover:bg-cyan-50 rounded-lg transition">
                <Menu className="w-6 h-6 text-cyan-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-cyan-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name || "Unknown User"}</h2>
                <p className="text-gray-500 mb-4">{user.email || "No email provided"}</p>
                
                <div className="flex items-center space-x-2 justify-center">
                  <span className="px-4 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold">Verified</span>
                  <span className="px-4 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-sm font-bold">Premium</span>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Email</span>
                  </div>
                  <p className="text-gray-800 font-bold text-sm ml-13">{user.email || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Phone</span>
                  </div>
                  <p className="text-gray-800 font-bold text-sm ml-13">{user.phoneNo || "N/A"}</p>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Account Number</span>
                  </div>
                  <p className="text-gray-800 font-bold ml-13">{user.accountNumber || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Set PIN Card */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-cyan-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Security Settings</h3>
                  <p className="text-gray-500 text-sm">Manage your transaction PIN</p>
                </div>
              </div>

              {isPinSet ? (
                // Show when PIN is already set
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">PIN Already Set</h4>
                  <p className="text-gray-600 mb-4">Your transaction PIN has been configured successfully.</p>
                  <p className="text-sm text-gray-500">Need to change your PIN? Contact support for assistance.</p>
                </div>
              ) : (
                // Show the form when PIN is not set
                <>
                  {message && (
                    <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                      message.type === "success" 
                        ? "bg-green-50 border-2 border-green-200 text-green-700" 
                        : "bg-red-50 border-2 border-red-200 text-red-700"
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handlePinUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Set Transaction PIN</label>
                      <div className="flex space-x-3 justify-center">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={`pin-${index}`}
                            type="password"
                            ref={pinRefs[index]}
                            value={pin ? pin[index] || "" : ""}
                            onChange={(e) => handlePinDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e, false)}
                            maxLength={1}
                            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            placeholder="•"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Confirm Transaction PIN</label>
                      <div className="flex space-x-3 justify-center">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={`confirm-pin-${index}`}
                            type="password"
                            ref={confirmPinRefs[index]}
                            value={confirmPin ? confirmPin[index] || "" : ""}
                            onChange={(e) => handleConfirmPinDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e, true)}
                            maxLength={1}
                            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            placeholder="•"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Setting PIN...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Set Transaction PIN</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
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
}

export default Profile;