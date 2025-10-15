import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/Authcontext";
import { Link } from "react-router-dom";

const TransactionHistory = () => {
  const { getTransactions, user, filter, setFilter } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        setTimeAgo(Math.floor((Date.now() - lastUpdated) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  useEffect(() => {
    if (!user?._id) return; // Wait for user to load
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            Last updated {timeAgo < 60 ? `${timeAgo}s` : `${Math.floor(timeAgo / 60)}m`} ago
          </p>
        )}

        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "10px",
              outline: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>

        {error && <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

        <div className="overflow-x-auto">
          {loadingTx ? (
            <table className="w-full text-sm animate-pulse">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders().map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-gray-200">
                    {getTableHeaders().map((header) => (
                      <td key={header} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders().map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((tx) => {
                    console.log("Transaction:", tx);
                    const isSender =
                      user?._id && tx.sender?._id && tx.sender._id.toString() === user._id.toString();
                    return (
                      <tr key={tx._id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{tx.transactionRef || "N/A"}</td>
                        {filter === "all" && (
                          <>
                            <td className="px-6 py-4">
                              {tx.sender?.name
                                ? `${tx.sender.name} (${tx.sender.accountNumber || "N/A"})`
                                : "Unknown"}
                            </td>
                            <td className="px-6 py-4">
                              {tx.receiver?.name
                                ? `${tx.receiver.name} (${tx.receiver.accountNumber || "N/A"})`
                                : "Unknown"}
                            </td>
                          </>
                        )}
                        {filter === "sent" && (
                          <td className="px-6 py-4">
                            {tx.receiver?.name
                              ? `${tx.receiver.name} (${tx.receiver.accountNumber || "N/A"})`
                              : "Unknown"}
                          </td>
                        )}
                        {filter === "received" && (
                          <td className="px-6 py-4">
                            {tx.sender?.name
                              ? `${tx.sender.name} (${tx.sender.accountNumber || "N/A"})`
                              : "Unknown"}
                          </td>
                        )}
                        <td className="px-6 py-4">{tx.description || "N/A"}</td>
                        <td className="px-6 py-4 font-semibold">
                          ${tx.amount ? Number(tx.amount).toFixed(2) : "0.00"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              tx.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {tx.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={getTableHeaders().length} className="text-center py-4 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;