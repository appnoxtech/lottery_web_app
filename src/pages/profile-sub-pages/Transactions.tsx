import React, { useEffect, useState } from "react";
import axios from "axios";

interface Transaction {
  id: number;
  mode: string;
  date: string;
  amount: string;
  status?: string;
  isToday?: boolean;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const userID = 123; // Replace this with actual user ID logic (e.g., from context or Redux)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5173/user/${userID}/transactions`
        );
        if (response.status === 200 || response.status === 304) {
          setTransactions(response.data.result || []); // Adjust based on actual API response structure
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [userID]);

  return (
    <div className="min-h-screen bg-[#1D1F27] text-white px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-[#EDB726]">
        Transaction History
      </h2>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400">No transactions found.</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-xl shadow-sm hover:bg-[#EDB726] hover:text-[#1D1F27] bg-white text-[#1D1F27]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-white">ƒ</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">
                    {tx.isToday ? "Payment Mode" : "Paid Via"}{" "}
                    <span className="capitalize">{tx.mode}</span>
                  </p>
                  <p className="text-xs opacity-80">{tx.date}</p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                {tx.status === "pending" && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                    Pending
                  </span>
                )}
                <p className="text-lg font-bold">{tx.amount}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
