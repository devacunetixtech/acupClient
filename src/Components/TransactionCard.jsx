import React from "react";

const TransactionCard = ({ type, amount, sender, receiver, description, date, status }) => {
  const isCredit = type === "credit";
  const statusColor = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex justify-between items-center">
      <div className="flex-1">
        <p className="font-semibold text-foreground">{description}</p>
        <p className="text-sm text-muted-foreground">
          {isCredit ? `From: ${sender}` : `To: ${receiver}`}
        </p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isCredit ? "text-green-600" : "text-red-600"}`}>
          {isCredit ? "+" : "-"}${amount}
        </p>
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs ${statusColor[status] || "bg-gray-100 text-gray-800"}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

export default TransactionCard;