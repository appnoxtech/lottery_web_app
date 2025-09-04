import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Search, Filter, Download, Eye, Ticket } from "lucide-react";
import { useSelector } from "react-redux";
import { getDailyLotteryTickets } from "../utils/services/Order.services";
import { handleApiError } from "../hooks/handleApiError";
import { formatDate } from "../hooks/dateFormatter";

const Tickets: React.FC = () => {
  const [lotteryTickets, setLotteryTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

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

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  //   fetchLotteryRecords();
  // }, [fetchLotteryRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "winner":
        return "bg-[#EDB726]/20 text-[#EDB726] border-[#EDB726]/30";
      case "expired":
      case "pending": // Assuming 'pending' can also be a status that is not 'active' or 'winner'
      case "cancelled": // Assuming 'cancelled' can also be a status that is not 'active' or 'winner'
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredTickets =
    selectedTab === "all"
      ? lotteryTickets
      : lotteryTickets.filter((ticket) => ticket.status === selectedTab);

  // Calculate stats
  const totalTicketsCount = lotteryTickets.length;
  const activeTicketsCount = lotteryTickets.filter(
    (ticket) => ticket.status === "active"
  ).length;
  const winningTicketsCount = lotteryTickets.filter(
    (ticket) => ticket.status === "winner"
  ).length;
  // For revenue, you'll need a 'price' or 'amount' field in your ticket data. Assuming 'grand_total' for now.
  const totalRevenue = lotteryTickets.reduce(
    (sum, ticket) => sum + (parseFloat(ticket.grand_total) || 0),
    0
  );

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Ticket Management
              </h1>
              <p className="text-gray-300">
                View and manage all lottery tickets
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Tickets
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {totalTicketsCount}
                    </p>
                  </div>
                  <Ticket className="w-8 h-8 text-[#EDB726]" />
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Active Tickets
                    </p>
                    <p className="text-2xl font-bold text-green-400">
                      {activeTicketsCount}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Winning Tickets
                    </p>
                    <p className="text-2xl font-bold text-[#EDB726]">
                      {winningTicketsCount}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-[#EDB726] rounded-full"></div>
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Tabs */}
                <div className="flex space-x-1 bg-[#1D1F27] rounded-lg p-1">
                  {["all", "active", "winner", "pending", "cancelled"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

                {/* Search and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="pl-10 pr-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                    />
                  </div>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-[#EDB726] transition-colors cursor-pointer">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-[#EDB726] text-[#1D1F27] rounded-lg hover:bg-[#d4a422] transition-colors font-medium cursor-pointer">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading / Empty / Tickets Table */}
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
              <>
                {/* Table for medium and large screens */}
                <div className="hidden md:block bg-[#2A2D36] rounded-lg border border-gray-700 overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#1D1F27]">
                        <tr>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Ticket Info
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Purchase Details
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket.receipt}
                            className="hover:bg-[#3A3D46] transition-colors"
                          >
                            <td className="px-4 sm:px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {ticket.lottery_id
                                    .map((lottery: any) => lottery.abbreviation)
                                    .join(", ")}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Ticket #{ticket.receipt}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Numbers: {ticket.lottery_number.join(", ")}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {ticket.user_id}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {ticket.phone_number}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <div>
                                <div className="text-sm text-white">
                                  {formatDate(ticket.created_at)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {new Date(
                                    ticket.created_at
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-sm font-medium text-[#EDB726]">
                                  ₹{ticket.grand_total}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {ticket.status.charAt(0).toUpperCase() +
                                  ticket.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-[#EDB726] hover:text-[#d4a422] mr-3">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-white">
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cards for small screens */}
                <div className="md:hidden space-y-4 mb-6">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.receipt}
                      className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700 flex flex-col space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Ticket Info:
                          </p>
                          <p className="text-white">
                            {ticket.lottery_id
                              .map((lottery: any) => lottery.abbreviation)
                              .join(", ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ticket #{ticket.receipt}
                          </p>
                          <p className="text-xs text-gray-500">
                            Numbers: {ticket.lottery_number.join(", ")}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.charAt(0).toUpperCase() +
                            ticket.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Customer:
                          </p>
                          <p className="text-white">{ticket.user_id}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.phone_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-400">
                            Total:
                          </p>
                          <p className="text-lg font-bold text-[#EDB726]">
                            ₹{ticket.grand_total}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Purchase Date:
                          </p>
                          <p className="text-white">
                            {formatDate(ticket.created_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.created_at).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button className="text-[#EDB726] hover:text-[#d4a422]">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-gray-400 hover:text-white">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tickets;
