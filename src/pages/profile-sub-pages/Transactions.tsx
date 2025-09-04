import React from "react";

const Transactions: React.FC = () => {
  const today = "2024-10-27"; // Replace with new Date().toISOString().split('T')[0] for dynamic date

  const transactions = [
    {
      id: 1,
      mode: "Whatsapp",
      date: today,
      amount: "ƒ22.25",
      status: "pending", // only today's
      isToday: true,
    },
    {
      id: 2,
      mode: "Whatsapp",
      date: today,
      amount: "ƒ22.25",
    },
    {
      id: 3,
      mode: "Whatsapp",
      date: today,
      amount: "ƒ22.25",
    },
    {
      id: 4,
      mode: "Stripe",
      date: today,
      amount: "ƒ22.25",
    },
    {
      id: 5,
      mode: "Whatsapp",
      date: today,
      amount: "ƒ22.25",
    },
    {
      id: 6,
      mode: "Stripe",
      date: today,
      amount: "ƒ22.25",
    },
    {
      id: 7,
      mode: "Whatsapp",
      date: today,
      amount: "ƒ22.25",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1D1F27] text-white px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-[#EDB726]">
        Transaction History
      </h2>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 rounded-xl shadow-sm hover:bg-[#EDB726] hover:text-[#1D1F27] bg-white text-[#1D1F27]"
          >
            {/* Left side - icon and info */}
            <div className="flex items-center space-x-3">
              {/* Coin Icon Placeholder */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white">ƒ</span>
              </div>

              {/* Details */}
              <div className="text-sm">
                <p className="font-semibold">
                  {tx.isToday ? "Payment Mode" : "Paid Via"}{" "}
                  <span className="capitalize">{tx.mode}</span>
                </p>
                <p className="text-xs opacity-80">{tx.date}</p>
              </div>
            </div>

            {/* Right side - status and amount */}
            <div className="flex flex-col items-end space-y-1">
              {tx.status === "pending" && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                  Pending
                </span>
              )}
              <p className="text-lg font-bold">{tx.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;


