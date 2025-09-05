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
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redux selectors
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

  // Mock lotteries if not available in Redux
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

  // Fetch winner history
  const fetchWinnerHistory = useCallback(async () => {
    console.log("fetchWinnerHistory called with:", {
      lotteryId: selectedLottery?.id || "all",
      digitType: selectedLotteryType?.digitType,
      period: selectedPeriod,
    });

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
      console.log("API Response:", response?.data);
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
            console.log(
              `Processing winner: ticketNumber=${ticketNumber}, digit=${item.digit}, lottery_id=${item.lottery_id}`
            );
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
        console.log("Formatted Winners:", formattedWinners);
        dispatch(addToWinnerList(formattedWinners));
      } else {
        setError("No winners found for the selected criteria.");
        dispatch(clearWinnersList());
      }
    } catch (err: any) {
      setError("Failed to fetch winner history: " + err.message);
      showToast("Failed to fetch winner history.", "error");
      console.error("Fetch winner history error:", err);
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
    console.log("useEffect triggered with:", {
      selectedLottery,
      selectedLotteryType,
      selectedPeriod,
    });
    fetchWinnerHistory();
  }, [fetchWinnerHistory]);

  // Search, period, and digit filter with sorting
  const filteredWinners = useMemo(() => {
    let list = [...winnersList];

    // Filter by selected lottery if one is chosen
    if (selectedLottery?.id) {
      list = list.filter(
        (winner: Winner) => winner.lotteryId === selectedLottery.id
      );
    }

    // Digit filter (client-side)
    list = list.filter((winner: Winner) => {
      const ticketLength = winner.ticketNumber.replace(/[^0-9]/g, "").length;
      const matchesDigitType = ticketLength === selectedLotteryType.digitType;
      console.log(
        `Filtering winner: ticketNumber=${winner.ticketNumber}, length=${ticketLength}, expected=${selectedLotteryType.digitType}, matches=${matchesDigitType}`
      );
      return matchesDigitType;
    });

    // Period filter (for week and month, since today uses specific API)
    const today = new Date();
    const format = (date: Date) => date.toISOString().split("T")[0]; // YYYY-MM-DD

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

    // Search filter
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

    // Sort by drawDate in descending order (most recent first)
    list.sort(
      (a: Winner, b: Winner) =>
        new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
    );

    console.log("Filtered and Sorted Winners:", list);
    return list;
  }, [
    winnersList,
    selectedPeriod,
    searchQuery,
    selectedLotteryType,
    selectedLottery,
  ]);

  // Handle lottery and ticket type selection
  const handleLotterySelection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const lotteryId = event.target.value;
    console.log("Selected Lottery ID:", lotteryId);
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
    console.log("Selected Ticket Type ID:", typeId);
    const selected = ticketTypes.find(
      (type: any) => type.id.toString() === typeId
    );
    if (selected) {
      setSelectedLotteryType(selected);
      console.log("Updated selectedLotteryType:", selected);
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
        <Header />
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

            {/* Filters */}
            <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedLottery?.id || ""}
                    onChange={handleLotterySelection}
                    className="px-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726] cursor-pointer"
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
                  <select
                    value={selectedLotteryType.id}
                    onChange={handleTicketTypeSelection}
                    className="px-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726] cursor-pointer"
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
                  <input
                    type="text"
                    placeholder="Search by date, ticket, or prize"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726]"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Winners
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {filteredWinners.length}
                    </p>
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
                    <p className="text-2xl font-bold text-green-400">
                      {
                        filteredWinners.filter(
                          (w: Winner) => w.claimStatus === "claimed"
                        ).length
                      }
                    </p>
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
                    <p className="text-2xl font-bold text-yellow-400">
                      {
                        filteredWinners.filter(
                          (w: Winner) => w.claimStatus === "pending"
                        ).length
                      }
                    </p>
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
                    <p className="text-2xl font-bold text-white">
                      ₹
                      {filteredWinners
                        .reduce(
                          (sum: number, w: Winner) => sum + w.prizeAmount,
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-[#EDB726]" />
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
                      {filteredWinners.map((winner: Winner) => (
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
            )}

            {/* Recent Activity */}
            <div className="mt-8 bg-[#2A2D36] rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Winner Activity
              </h3>
              <div className="space-y-4">
                {filteredWinners.slice(0, 2).map((winner: Winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center space-x-4 p-3 bg-[#1D1F27] rounded-lg"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getClaimStatusColor(
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
