import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import logo from "../assets/nobgwhitelogo.png";

function Profile() {
  const { user, setUser, pin, setPin: setPinState, setPinApi } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
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
      await setPinApi(pin);
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
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
      >
        Back to Dashboard
      </button>

      <header className="px-2 py-4 flex flex-col justify-center items-center text-center">
        <img
          className="inline-flex object-cover border-4 border-indigo-600 rounded-full shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-indigo-600/100 bg-indigo-50 text-indigo-600 h-24 w-24 !h-48 !w-48"
          src={logo}
          alt="Profile"
          onError={(e) =>
            (e.target.src =
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080")
          }
        />
        <h1 className="text-2xl text-gray-500 font-bold mt-2">{user.name || "Unknown User"}</h1>
        <h2 className="text-xl text-gray-500 font-bold mt-1">{user.email || "No email provided"}</h2>
        <h3 className="text-base text-gray-500 font-bold">
          Account Number: {user.accountNumber || "No account number provided"}
        </h3>
      </header>

      {/* Message Display */}
      {message && (
        <div
          className={`p-2 mb-4 text-sm rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Set Transaction PIN Form */}
      <form onSubmit={handlePinUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Set Transaction PIN</label>
          <div className="flex space-x-2 mt-1">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={`pin-${index}`}
                type="password" // Mask PIN digits
                ref={pinRefs[index]}
                value={pin ? pin[index] || "" : ""}
                onChange={(e) => handlePinDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e, false)}
                maxLength={1}
                className="w-12 h-12 border rounded-md text-center text-lg"
                placeholder="-"
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Transaction PIN</label>
          <div className="flex space-x-2 mt-1">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={`confirm-pin-${index}`}
                type="password" // Mask Confirm PIN digits
                ref={confirmPinRefs[index]}
                value={confirmPin ? confirmPin[index] || "" : ""}
                onChange={(e) => handleConfirmPinDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e, true)}
                maxLength={1}
                className="w-12 h-12 border rounded-md text-center text-lg"
                placeholder="-"
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Setting PIN..." : "Set PIN"}
        </button>
      </form>
    </div>
  );
}

export default Profile;