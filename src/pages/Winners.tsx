import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import {
  Trophy,
  Calendar,
  DollarSign,
  Phone,
  Award,
  Filter,
  Download,
  Eye,
} from "lucide-react";

const Winners: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Mock winners data
  const winners = [
    {
      id: "WIN001",
      lotteryName: "Super Lucky Draw",
      ticketNumber: "123456",
      winnerName: "John Doe",
      winnerPhone: "+91 9876543210",
      prizeAmount: 50000,
      drawDate: "2024-01-20",
      drawTime: "18:00",
      claimStatus: "claimed",
      claimDate: "2024-01-22",
      prizeType: "first",
    },
    {
      id: "WIN002",
      lotteryName: "Mega Jackpot",
      ticketNumber: "789012",
      winnerName: "Jane Smith",
      winnerPhone: "+91 9876543211",
      prizeAmount: 25000,
      drawDate: "2024-01-19",
      drawTime: "20:00",
      claimStatus: "pending",
      claimDate: null,
      prizeType: "second",
    },
    {
      id: "WIN003",
      lotteryName: "Daily Fortune",
      ticketNumber: "345678",
      winnerName: "Bob Johnson",
      winnerPhone: "+91 9876543212",
      prizeAmount: 10000,
      drawDate: "2024-01-18",
      drawTime: "19:30",
      claimStatus: "expired",
      claimDate: null,
      prizeType: "third",
    },
  ];

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case "claimed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "expired":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPrizeTypeColor = (type: string) => {
    switch (type) {
      case "first":
        return "text-[#EDB726]";
      case "second":
        return "text-gray-300";
      case "third":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case "first":
        return <Trophy className="w-5 h-5 text-[#EDB726]" />;
      case "second":
        return <Award className="w-5 h-5 text-gray-300" />;
      case "third":
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <Award className="w-5 h-5 text-gray-400" />;
    }
  };

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
                Winners Management
              </h1>
              <p className="text-gray-300">
                View and manage lottery winners and prize distributions
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Winners
                    </p>
                    <p className="text-2xl font-bold text-white">156</p>
                  </div>
                  <Trophy className="w-8 h-8 text-[#EDB726]" />
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Prizes Claimed
                    </p>
                    <p className="text-2xl font-bold text-green-400">89</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Pending Claims
                    </p>
                    <p className="text-2xl font-bold text-yellow-400">45</p>
                  </div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
              </div>

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Prizes
                    </p>
                    <p className="text-2xl font-bold text-white">₹8.5L</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-[#EDB726]" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Period Filter */}
                <div className="flex space-x-1 bg-[#1D1F27] rounded-lg p-1">
                  {["all", "today", "week", "month"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? "bg-[#EDB726] text-[#1D1F27]"
                          : "text-gray-400 hover:text-white cursor-pointer"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
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

            {/* Winners Table */}
            <div className="bg-[#2A2D36] rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1D1F27]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Prize Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Winner Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Draw Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Prize Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Claim Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {winners.map((winner) => (
                      <tr
                        key={winner.id}
                        className="hover:bg-[#3A3D46] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getPrizeIcon(winner.prizeType)}
                            <div>
                              <div className="text-sm font-medium text-white">
                                {winner.lotteryName}
                              </div>
                              <div className="text-sm text-gray-400">
                                Ticket #{winner.ticketNumber}
                              </div>
                              <div
                                className={`text-xs font-medium ${getPrizeTypeColor(
                                  winner.prizeType
                                )}`}
                              >
                                {winner.prizeType.charAt(0).toUpperCase() +
                                  winner.prizeType.slice(1)}{" "}
                                Prize
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {winner.winnerName}
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span>{winner.winnerPhone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center space-x-1 text-sm text-white">
                              <Calendar className="w-3 h-3" />
                              <span>{winner.drawDate}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {winner.drawTime}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-[#EDB726]" />
                            <span className="text-lg font-bold text-[#EDB726]">
                              ₹{winner.prizeAmount.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getClaimStatusColor(
                                winner.claimStatus
                              )}`}
                            >
                              {winner.claimStatus.charAt(0).toUpperCase() +
                                winner.claimStatus.slice(1)}
                            </span>
                            {winner.claimDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                Claimed: {winner.claimDate}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

            {/* Recent Activity */}
            <div className="mt-8 bg-[#2A2D36] rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Winner Activity
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-[#1D1F27] rounded-lg">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="font-medium">John Doe</span> claimed
                      ₹50,000 prize from Super Lucky Draw
                    </p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-[#1D1F27] rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      New winner announced for{" "}
                      <span className="font-medium">Mega Jackpot</span> -
                      ₹25,000
                    </p>
                    <p className="text-xs text-gray-400">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Winners;
