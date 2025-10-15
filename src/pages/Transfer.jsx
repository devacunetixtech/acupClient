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
import { Send, ArrowRight } from "lucide-react";
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
  const { makeTransfer, pin, setPin: setPinState, fetchRecipientName, user, getDashboardData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [tranDescription, setTranDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const [localBalance, setLocalBalance] = useState(null);

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
      setRecipientName(""); // Clear recipient name
      setRecipientError(null); // Clear recipient error
      pinRefs.forEach((ref) => (ref.current.value = ""));
      setLocalBalance(res.balance); // Update balance after transfer
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
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <Navbar onLogout={() => navigate("/login")} onToggleSidebar={() => { }} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h1 className="text-3xl font-bold text-foreground mb-2">Send Money</h1>
                      <Link
                        to="/dashboard"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                      >
                        Back to Dashboard
                      </Link>
                    </div>

            <p className="text-muted-foreground">Transfer funds securely</p>
          </div>

          <Card className="p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Available Balance</h2>
              {balanceLoading ? (
                <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : balanceError ? (
                <p className="text-red-600">Failed to load balance</p>
              ) : (
                <p className="text-3xl font-bold text-primary">
                  ${localBalance?.toFixed(2) || "0.00"}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Account</Label>
                <Input
                  id="recipient"
                  placeholder="Enter account number (e.g., ACUP8112994147)"
                  value={toAccountNumber}
                  onChange={handleRecipientChange}
                  required
                />
                <div className="text-sm">
                  {recipientLoading && <span className="text-muted-foreground">Loading...</span>}
                  {recipientError && <span className="text-red-600">{recipientError}</span>}
                  {recipientName && !recipientLoading && !recipientError && (
                    <span className="text-green-600">Recipient: {recipientName}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add a note for this transfer"
                  value={tranDescription}
                  onChange={(e) => setTranDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction PIN</Label>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={`pin-${index}`}
                      type="password"
                      ref={pinRefs[index]}
                      value={pin ? pin[index] || "" : ""}
                      onChange={(e) => handlePinDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      className="w-12 h-12 text-center text-lg"
                      placeholder="-"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transfer Amount</span>
                  <span className="font-semibold">${amount || "0.00"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">${amount || "0.00"}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full p-2 bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={loading}
              >
                <Send className="mr-2 h-5 w-5" />
                {loading ? "Processing..." : "Send Money"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Card>

          {/* Modal for Receipt */}
          {isModalOpen && receiptData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="p-6 max-w-lg w-full bg-white border border-gray-300">
                <div className="receipt">
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Transaction Receipt</h2>
                  <p className="mb-2">
                    <span className="font-semibold">Status:</span> Transaction Successful ✅
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Amount:</span> ${receiptData.transaction.amount}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Recipient:</span>{" "}
                    {receiptData.transaction.receiver?.name || "Unknown"} (
                    {receiptData.transaction.toAccountNumber})
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Description:</span>{" "}
                    {receiptData.transaction.description}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Transaction Reference:</span>{" "}
                    {receiptData.transaction.transactionRef}
                  </p>
                  <p className="mb-4">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(receiptData.transaction.createdAt).toLocaleString()}
                  </p>
                  <div className="flex justify-between">
                    <Button
                      onClick={downloadReceipt}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Download as PDF
                    </Button>
                    <Button
                      onClick={closeModal}
                      className="bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transfer;