import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Trophy, Calendar, DollarSign, Phone } from "lucide-react";
import { getWinnerHistory } from "../utils/services/Winners.services";
import { addToWinnerList, clearWinnersList } from "../store/slicer/winnerSlice";
import { showToast } from "../utils/toast.util";
import { formatDate } from "../hooks/dateFormatter";

interface Winner {
  date: string;
  lotteryId: number;
  firstPrize?: string;
  secondPrize?: string;
  thirdPrize?: string;
}

const Winners: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
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
    setInfo(null);
    try {
      let response = await getWinnerHistory(
        selectedLottery?.id || "",
        selectedLotteryType.digitType
      );

      if (
        response?.data?.result?.winners &&
        response.data.result.winners.length > 0
      ) {
        let winners = response.data.result.winners;

        if (selectedPeriod !== "all") {
          const now = new Date();
          let thresholdDate = new Date();

          if (selectedPeriod === "today") {
            thresholdDate.setHours(0, 0, 0, 0);
          } else if (selectedPeriod === "week") {
            thresholdDate.setDate(now.getDate() - 7);
          } else if (selectedPeriod === "month") {
            thresholdDate.setMonth(now.getMonth() - 1);
          }

          winners = winners.filter((item: any) => {
            const winnerDate = new Date(item.date);
            return winnerDate >= thresholdDate;
          });
        }

        const grouped: { [key: string]: Winner } = {};
        winners.forEach((item: any) => {
          const date = formatDate(item.date);
          if (!grouped[date]) {
            grouped[date] = {
              date,
              lotteryId: item.lottery_id,
              firstPrize: item.first_prize || undefined,
              secondPrize: item.second_prize || undefined,
              thirdPrize: item.third_prize || undefined,
            };
          }
        });

        const formattedWinners = Object.values(grouped).map((item) => ({
          id: `${item.date}-${item.lotteryId}`, // Unique ID required by the slice
          lotteryName: selectedLottery?.name || "Unknown Lottery",
          ticketNumber: "-",
          winnerName: "-",
          winnerPhone: "-",
          prizeAmount:
            (item.firstPrize ? parseInt(item.firstPrize) : 0) +
            (item.secondPrize ? parseInt(item.secondPrize) : 0) +
            (item.thirdPrize ? parseInt(item.thirdPrize) : 0),
          drawDate: item.date,
          drawTime: "-",
          claimStatus: "unclaimed",
          claimDate: null,
          prizeType: "unknown",
          lotteryId: item.lotteryId,
          date: item.date, // You might not need this depending on usage
          firstPrize: item.firstPrize,
          secondPrize: item.secondPrize,
          thirdPrize: item.thirdPrize,
        }));

        dispatch(addToWinnerList(formattedWinners));
        setError(null);
        setInfo(null);
      } else {
        setError(null);
        setInfo("No winners found for the selected criteria.");
        dispatch(clearWinnersList());
      }
    } catch (err: any) {
      setError("Failed to fetch winner history. Please try again.");
      setInfo(null);
      showToast("Failed to fetch winner history.", "error");
      dispatch(clearWinnersList());
    } finally {
      setLoading(false);
    }
  }, [selectedLottery, selectedLotteryType, selectedPeriod, dispatch]);

  useEffect(() => {
    fetchWinnerHistory();
  }, [fetchWinnerHistory]);

  const filteredWinners = useMemo(() => {
    let list = [...winnersList];
    if (searchQuery.trim()) {
      list = list.filter(
        (winner) =>
          winner.date.includes(searchQuery) ||
          (winner.firstPrize && winner.firstPrize.includes(searchQuery)) ||
          (winner.secondPrize && winner.secondPrize.includes(searchQuery)) ||
          (winner.thirdPrize && winner.thirdPrize.includes(searchQuery))
      );
    }
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [winnersList, searchQuery]);

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

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full min-h-screen overflow-x-auto">
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
        <main className="flex-1 p-6 overflow-y-auto w-full">
          <div className="w-full mx-auto max-w-full px-2 sm:px-4 lg:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Winners Management
              </h1>
              <p className="text-gray-300">
                View and manage lottery winners and prize distributions
              </p>
            </div>
            <div className="bg-[#2A2D36] rounded-lg p-4 md:p-6 border border-gray-700 mb-6 w-full max-w-full overflow-x-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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
                      placeholder="Search by date or prize"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-[#EDB726]"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full max-w-full">
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-[#EDB726]" />
                    <h3 className="text-sm text-gray-400">Total Winners</h3>
                  </div>
                  <p className="text-lg font-bold">{winnersList.length}</p>
                </div>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#EDB726]" />
                    <h3 className="text-sm text-gray-400">Date Filter</h3>
                  </div>
                  <p className="text-lg font-bold">
                    {selectedPeriod.charAt(0).toUpperCase() +
                      selectedPeriod.slice(1)}
                  </p>
                </div>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-[#EDB726]" />
                    <h3 className="text-sm text-gray-400">Total Prizes</h3>
                  </div>
                  <p className="text-lg font-bold">
                    ₹
                    {winnersList.reduce((sum: number, winner: Winner) => {
                      return (
                        sum +
                        (winner.firstPrize ? parseInt(winner.firstPrize) : 0) +
                        (winner.secondPrize
                          ? parseInt(winner.secondPrize)
                          : 0) +
                        (winner.thirdPrize ? parseInt(winner.thirdPrize) : 0)
                      );
                    }, 0)}
                  </p>
                </div>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-[#EDB726]" />
                    <h3 className="text-sm text-gray-400">Contact</h3>
                  </div>
                  <p className="text-lg font-bold">Support</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2D36] rounded-lg overflow-x-auto border border-gray-700 w-full max-w-full">
              {loading ? (
                <div className="text-center text-gray-400 p-4">
                  Loading winners...
                </div>
              ) : error ? (
                <div className="text-center text-red-400 p-4">{error}</div>
              ) : info ? (
                <div className="text-center text-gray-400 p-4">{info}</div>
              ) : filteredWinners.length === 0 ? (
                <div className="text-center text-gray-400 p-4">
                  No winners found for selected criteria.
                </div>
              ) : (
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="bg-[#1D1F27] text-sm text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">
                        1<sup>st</sup> Prize
                      </th>
                      <th className="px-4 py-2">
                        2<sup>nd</sup> Prize
                      </th>
                      <th className="px-4 py-2">
                        3<sup>rd</sup> Prize
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWinners.map((winner, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-700 hover:bg-gray-800"
                      >
                        <td className="px-4 py-3">{winner.date}</td>
                        <td className="px-4 py-3">
                          {winner.firstPrize || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {winner.secondPrize || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {winner.thirdPrize || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Winners;
