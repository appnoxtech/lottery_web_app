import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getTransactions } from "../../utils/services/Transaction.services";

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
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const userID = useSelector((state: any) => state.user.userData?.id);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userID) {
        setError("User ID not found. Please log in.");
        setTransactions([]);
        return;
      }

      try {
        const response = await getTransactions(userID);
        console.log("API Response:", response);

        if (response?.status === 200 || response?.status === 202) {
          if (response.data.success) {
            const transactionsData = response.data.result || [];

            const mappedTransactions = transactionsData.map((tx: any) => ({
              id: tx.order_id,
              mode: "Online",
              date: new Date(tx.created_at).toLocaleString(),
              amount: `${tx.amount}`,
              status: tx.status,
              isToday: tx.todays_transaction,
            }));

            const sortedTransactions = mappedTransactions.sort(
              (a: Transaction, b: Transaction) => {
                if (a.status === "pending" && b.status !== "pending") {
                  return -1;
                } else if (a.status !== "pending" && b.status === "pending") {
                  return 1;
                }
                return 0;
              }
            );

            setTransactions(sortedTransactions);
            setError(null);
            setInfo(null);
          } else {
            setTransactions([]);
            setError(null);
            setInfo(response.data.message || "No transactions found.");
          }
        } else {
          setError("Failed to fetch transactions. Please try again later.");
          setInfo(null);
        }
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        setError("Failed to fetch transactions. Please try again later.");
        setInfo(null);
      }
    };

    fetchTransactions();
  }, [userID]);

  return (
    <div className="min-h-screen bg-[#1D1F27] text-white px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-[#EDB726]">
        Transaction History
      </h2>

      {/* Show error message */}
      {error && <p className="text-center text-red-400 mb-4">{error}</p>}

      {/* Show informational message */}
      {!error && info && (
        <p className="text-center text-gray-400 mb-4">{info}</p>
      )}

      <div className="space-y-4">
        {transactions.length === 0 && !error && !info ? (
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-center text-gray-400 text-lg">
              No Transactions Found
            </p>
            <p className="text-center text-gray-400 text-sm mt-2">
              Buy lotteries for a chance to win big!
            </p>
          </div>
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
