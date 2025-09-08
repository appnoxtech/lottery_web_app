import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Search, Eye } from "lucide-react";
import { useSelector } from "react-redux";
import { getDailyLotteryTickets } from "../utils/services/Order.services";
import { handleApiError } from "../hooks/handleApiError";
import { formatDate } from "../hooks/dateFormatter";

const Tickets: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lotteryTickets, setLotteryTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const userData = useSelector((state: any) => state.user.userData);
  const todaysDate = new Date();
  const formattedTodaysDate = formatDate(todaysDate.toISOString());

  const fetchLotteryRecords = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const response = await getDailyLotteryTickets(
        userData.id,
        formattedTodaysDate
      );
      if (response?.data?.result && response?.status === 200) {
        setLotteryTickets(response.data.result);
      } else {
        setLotteryTickets([]);
      }
    } catch (error: unknown) {
      handleApiError(error, "Failed to fetch tickets.");
      setLotteryTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData?.id, formattedTodaysDate]);

  useEffect(() => {
    fetchLotteryRecords();
  }, [fetchLotteryRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "winner":
        return "bg-[#EDB726]/20 text-[#EDB726] border-[#EDB726]/30";
      case "expired":
      case "pending":
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredTickets = lotteryTickets
    .filter((ticket) => ticket.receipt.includes(searchTerm))
    .filter((ticket) =>
      selectedTab === "all" ? true : ticket.status === selectedTab
    );

  const totalTicketsCount = lotteryTickets.length;
  const activeTicketsCount = lotteryTickets.filter(
    (ticket) => ticket.status === "active"
  ).length;
  const winningTicketsCount = lotteryTickets.filter(
    (ticket) => ticket.status === "winner"
  ).length;
  const totalRevenue = lotteryTickets.reduce(
    (sum, ticket) => sum + (parseFloat(ticket.grand_total) || 0),
    0
  );

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                Ticket Management
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                View and manage all lottery tickets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Total Tickets</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {totalTicketsCount}
                </p>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Active Tickets</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">
                  {activeTicketsCount}
                </p>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Winning Tickets</p>
                <p className="text-lg sm:text-2xl font-bold text-[#EDB726]">
                  {winningTicketsCount}
                </p>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  ₹{totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-[#2A2D36] rounded-lg p-4 sm:p-6 border border-gray-700 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex space-x-1 flex-wrap sm:flex-nowrap">
                  {["all", "active", "winner", "pending", "cancelled"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedTab === tab
                            ? "bg-[#EDB726] text-[#1D1F27]"
                            : "text-gray-400 hover:text-white cursor-pointer"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-400">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-400">
                  No tickets found for selected criteria.
                </p>
              </div>
            ) : (
              <div className="bg-[#2A2D36] rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#1D1F27] text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">Ticket Info</th>
                        <th className="px-3 py-2 text-left">Customer</th>
                        <th className="px-3 py-2 text-left">
                          Purchase Details
                        </th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.receipt}
                          className="hover:bg-[#3A3D46] transition-colors"
                        >
                          <td className="px-3 py-2">
                            <div className="text-white font-medium">
                              {ticket.lottery_id
                                .map((lottery: any) => lottery.abbreviation)
                                .join(", ")}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Ticket #{ticket.receipt}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-white">{ticket.user_id}</div>
                            <div className="text-gray-400 text-xs">
                              {ticket.phone_number}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-white">
                              {formatDate(ticket.created_at)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {new Date(ticket.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            <div className="text-[#EDB726] font-medium">
                              ₹{ticket.grand_total}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status.charAt(0).toUpperCase() +
                                ticket.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button className="text-[#EDB726] hover:text-[#d4a422] mr-2">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tickets;
