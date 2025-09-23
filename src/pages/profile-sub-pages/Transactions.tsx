import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu toggle

  useEffect(() => {
    console.log("Fetching transactions for userID:", userID);
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

  console.log("Rendering Transactions component");

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl text-center text-white mb-2">
                Your <span className="text-[#EDB726]"> Transactions</span>
              </h1>
            </div>
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
                      <img
                        src="/image.png" // Path relative to public folder
                        alt="Transactions Icon"
                        className="w-12 h-12"
                      />
                      <div className="text-sm">
                        <p className="font-semibold">
                          {tx.isToday ? "Payment Mode" : "Payment mode:"}{" "}
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
                      <p className="text-lg font-bold">XCG {tx.amount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;