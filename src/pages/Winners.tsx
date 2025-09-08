import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import {
  Trophy,
  Calendar,
  DollarSign,
  Phone,
  Award,
  Eye,
  Download,
} from "lucide-react";
import {
  getWinnerHistory,
  getTodayWinningNumber,
} from "../utils/services/Winners.services";
import { addToWinnerList, clearWinnersList } from "../store/slicer/winnerSlice";
import { showToast } from "../utils/toast.util";
import { formatDate } from "../hooks/dateFormatter";

interface Winner {
  id: string;
  lotteryName: string;
  ticketNumber: string;
  winnerName: string;
  winnerPhone: string;
  prizeAmount: number;
  drawDate: string;
  drawTime: string;
  claimStatus: string;
  claimDate: string | null;
  prizeType: string;
  lotteryId: number;
}

const Winners: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const winnersList = useSelector((state: any) => state.winner.winnersList);
  const selectedLottery = useSelector(
    (state: any) => state.initialData.selectedLotteryData
  );
  const lotteries = useSelector((state: any) => state.initialData.initData);
  const [selectedLotteryType, setSelectedLotteryType] = useState({
    id: 1,
    digitType: 2,
    name: "2-digit",
  });

  const defaultLotteries = [
    { id: 1, name: "Super Lucky Draw", abbreviation: "SLD" },
    { id: 2, name: "Mega Jackpot", abbreviation: "MJ" },
    { id: 3, name: "Daily Fortune", abbreviation: "DF" },
  ];

  const ticketTypes = [
    { id: 1, name: "2-digit", digitType: 2 },
    { id: 2, name: "3-digit", digitType: 3 },
    { id: 3, name: "4-digit", digitType: 4 },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchWinnerHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (selectedPeriod === "today") {
        response = await getTodayWinningNumber(selectedLottery?.id || "");
      } else {
        response = await getWinnerHistory(
          selectedLottery?.id || "",
          selectedLotteryType.digitType
        );
      }
      if (
        response?.data?.result?.winners &&
        response.data.result.winners.length > 0
      ) {
        const formattedWinners: Winner[] = response.data.result.winners.map(
          (item: any, index: number) => {
            const ticketNumber =
              item.first_prize ||
              item.second_prize ||
              item.third_prize ||
              "N/A";
            return {
              id: `WIN${index + 1}`.padStart(6, "0"),
              lotteryName:
                selectedLottery?.name ||
                lotteries.find((l: any) => l.id === item.lottery_id)?.name ||
                "Unknown Lottery",
              ticketNumber,
              winnerName: item.winner_name || "Anonymous",
              winnerPhone: item.winner_phone || "N/A",
              prizeAmount: item.prize_amount || 0,
              drawDate: formatDate(item.date) || "N/A",
              drawTime: item.time || "N/A",
              claimStatus: item.claim_status || "pending",
              claimDate: item.claim_date || null,
              prizeType: item.first_prize
                ? "first"
                : item.second_prize
                ? "second"
                : "third",
              lotteryId: item.lottery_id || 0,
            };
          }
        );
        dispatch(addToWinnerList(formattedWinners as WinnerData[]));
      } else {
        setError("No winners found for the selected criteria.");
        dispatch(clearWinnersList());
      }
    } catch (err: any) {
      setError("Failed to fetch winner history: " + err.message);
      showToast("Failed to fetch winner history.", "error");
      dispatch(clearWinnersList());
    } finally {
      setLoading(false);
    }
  }, [
    selectedLottery,
    selectedLotteryType,
    selectedPeriod,
    dispatch,
    lotteries,
  ]);

  useEffect(() => {
    fetchWinnerHistory();
  }, [fetchWinnerHistory]);

  const filteredWinners = useMemo(() => {
    let list = [...winnersList];
    if (selectedLottery?.id) {
      list = list.filter(
        (winner: Winner) => winner.lotteryId === selectedLottery.id
      );
    }
    list = list.filter((winner: Winner) => {
      const ticketLength = winner.ticketNumber.replace(/[^0-9]/g, "").length;
      return ticketLength === selectedLotteryType.digitType;
    });
    const today = new Date();
    if (selectedPeriod === "week") {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      list = list.filter(
        (winner: Winner) => new Date(winner.drawDate) >= oneWeekAgo
      );
    } else if (selectedPeriod === "month") {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      list = list.filter(
        (winner: Winner) => new Date(winner.drawDate) >= oneMonthAgo
      );
    }
    if (searchQuery.trim()) {
      list = list.filter(
        (winner: Winner) =>
          winner.drawDate.includes(searchQuery) ||
          winner.ticketNumber.includes(searchQuery) ||
          winner.prizeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          winner.winnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          winner.winnerPhone.includes(searchQuery)
      );
    }
    list.sort(
      (a: Winner, b: Winner) =>
        new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
    );
    return list;
  }, [
    winnersList,
    selectedPeriod,
    searchQuery,
    selectedLotteryType,
    selectedLottery,
  ]);

  const handleLotterySelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const lotteryId = event.target.value;
    const selected = (lotteries.length > 0 ? lotteries : defaultLotteries).find(
      (lottery: any) => lottery.id.toString() === lotteryId
    );
    if (selected) {
      dispatch({
        type: "initialData/setInitialSelectedLottery",
        payload: selected,
      });
    } else {
      dispatch({
        type: "initialData/setInitialSelectedLottery",
        payload: null,
      });
    }
  };

  const handleTicketTypeSelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const typeId = event.target.value;
    const selected = ticketTypes.find(
      (type: any) => type.id.toString() === typeId
    );
    if (selected) {
      setSelectedLotteryType(selected);
    }
  };

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
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Winners Management
              </h1>
              <p className="text-gray-300">
                View and manage lottery winners and prize distributions
              </p>
            </div>
            {/* Filters */}
            <div className="bg-[#2A2D36] rounded-lg p-4 md:p-6 border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between  space-y-4 md:space-y-0">
                <div className="flex space-x-1 bg-[#1D1F27] rounded-lg p-1 md:mr-2">
                  {["all", "today", "week", "month"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? "bg-[#EDB726] text-[#1D1F27]"
                          : "text-gray-400 hover:text-white cursor-pointer"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                  <select
                    value={selectedLottery?.id || ""}
                    onChange={handleLotterySelection}
                    className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726] cursor-pointer"
                  >
                    <option value="">All Lotteries</option>
                    {(lotteries.length > 0 ? lotteries : defaultLotteries).map(
                      (lottery: any) => (
                        <option key={lottery.id} value={lottery.id}>
                          {lottery.name}
                        </option>
                      )
                    )}
                  </select>
                  {!isMobile && (
                    <select
                      value={selectedLotteryType.id}
                      onChange={handleTicketTypeSelection}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726] cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Ticket Type
                      </option>
                      {ticketTypes.map((type: any) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {isMobile && selectedLottery && (
                    <div className="flex space-x-2 w-full">
                      {ticketTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedLotteryType(type)}
                          className={`flex-1 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedLotteryType.id === type.id
                              ? "bg-[#EDB726] text-[#1D1F27]"
                              : "bg-[#1D1F27] text-gray-300 border border-gray-600 hover:text-white"
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {!isMobile && (
                    <input
                      type="text"
                      placeholder="Search by date, ticket, or prize"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726]"
                    />
                  )}
                </div>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Winners
                    </p>
                    <p className="text-xl font-bold text-white">
                      {filteredWinners.length}
                    </p>
                  </div>
                  <Trophy className="w-6 h-6 text-[#EDB726]" />
                </div>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Prizes Claimed
                    </p>
                    <p className="text-xl font-bold text-green-400">
                      {
                        filteredWinners.filter(
                          (w: Winner) => w.claimStatus === "claimed"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Pending Claims
                    </p>
                    <p className="text-xl font-bold text-yellow-400">
                      {
                        filteredWinners.filter(
                          (w: Winner) => w.claimStatus === "pending"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Prizes
                    </p>
                    <p className="text-xl font-bold text-white">
                      ₹
                      {filteredWinners
                        .reduce(
                          (sum: number, w: Winner) => sum + w.prizeAmount,
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 text-[#EDB726]" />
                </div>
              </div>
            </div>
            {/* Winners Table */}
            {loading ? (
              <div className="text-center text-gray-400">
                Loading winners...
              </div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : filteredWinners.length === 0 ? (
              <div className="text-center text-gray-400">
                No winners found for selected criteria.
              </div>
            ) : (
              <div className="bg-[#2A2D36] rounded-lg border border-gray-700 overflow-x-auto">
                {/* Desktop Table (large screens) */}
                <div className="hidden md:block">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-[#1D1F27]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Prize Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Winner Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Draw Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Prize Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Claim Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredWinners.map((winner: Winner) => (
                        <tr
                          key={winner.id}
                          className="hover:bg-[#3A3D46] transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getPrizeIcon(winner.prizeType)}
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {winner.lotteryName}
                                </div>
                                <div className="text-xs text-gray-400">
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
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {winner.winnerName}
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <Phone className="w-3 h-3" />
                                <span>{winner.winnerPhone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="flex items-center space-x-1 text-sm text-white">
                                <Calendar className="w-3 h-3" />
                                <span>{winner.drawDate}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                {winner.drawTime}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-[#EDB726]" />
                              <span className="text-sm font-bold text-[#EDB726]">
                                ₹{winner.prizeAmount.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
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
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-[#EDB726] hover:text-[#d4a422] mr-2">
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
                {/* Mobile/Tablet Cards (up to 1023px) */}
                <div className="md:hidden divide-y divide-gray-700">
                  {filteredWinners.map((winner: Winner) => (
                    <div
                      key={winner.id}
                      className="py-3 px-4 hover:bg-[#3A3D46] transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {getPrizeIcon(winner.prizeType)}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {winner.lotteryName}
                          </div>
                          <div className="text-xs text-gray-400">
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
                      <div className="text-sm font-medium text-white mb-1">
                        {winner.winnerName}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2">
                        <Phone className="w-3 h-3" />
                        <span>{winner.winnerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-white mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>{winner.drawDate}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {winner.drawTime}
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        <DollarSign className="w-4 h-4 text-[#EDB726]" />
                        <span className="text-sm font-bold text-[#EDB726]">
                          ₹{winner.prizeAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-2">
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
                      <div className="flex justify-end space-x-2 text-sm font-medium">
                        <button className="text-[#EDB726] hover:text-[#d4a422]">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Recent Activity */}
            <div className="mt-6 bg-[#2A2D36] rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                Recent Winner Activity
              </h3>
              <div className="space-y-3">
                {filteredWinners.slice(0, 2).map((winner: Winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center space-x-3 p-3 bg-[#1D1F27] rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getClaimStatusColor(
                        winner.claimStatus
                      )}`}
                    >
                      {getPrizeIcon(winner.prizeType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">{winner.winnerName}</span>{" "}
                        {winner.claimStatus} ₹
                        {winner.prizeAmount.toLocaleString()} prize from{" "}
                        {winner.lotteryName}
                      </p>
                      <p className="text-xs text-gray-400">{winner.drawDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Winners;
