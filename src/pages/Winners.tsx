import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { getWinnerHistory } from "../utils/services/Winners.services";
import { addToWinnerList, clearWinnersList } from "../store/slicer/winnerSlice";
import { showToast } from "../utils/toast.util";
import { formatDate } from "../hooks/dateFormatter";
import { Trophy, ChevronLeft } from "lucide-react";

interface Winner {
  date: string;
  lotteryId: number;
  firstPrize?: string;
  secondPrize?: string;
  thirdPrize?: string;
}

// interface LotteryTiming {
//   id: number;
//   lottery_id: number;
//   day: string;
//   starting_time: string;
//   cut_off_time: string;
// }

// interface Lottery {
//   id: number;
//   name: string;
//   abbreviation: string;
//   status: string;
//   timings: LotteryTiming[];
// }

const Winners: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [isViewAllActive, setIsViewAllActive] = useState(false);
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

  const getCurrentLotteryTiming = useCallback(() => {
    if (!selectedLottery || !selectedLottery.timings || selectedLottery.timings.length === 0) {
      return null;
    }
    return selectedLottery.timings[0];
  }, [selectedLottery]);

  useEffect(() => {
    if (selectedPeriod === "today" && selectedLottery) {
      const timing = getCurrentLotteryTiming();
      if (!timing) {
        setCountdown("No timing available");
        return;
      }
      const updateCountdown = () => {
        const now = new Date();
        const cutOffTime = new Date(timing.cut_off_time);
        if (cutOffTime <= now) {
          setCountdown("Closed");
          return;
        }
        const diff = cutOffTime.getTime() - now.getTime();
        if (diff <= 0) {
          setCountdown("Closed");
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown("");
    }
  }, [selectedPeriod, selectedLottery, getCurrentLotteryTiming]);

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
        if (selectedPeriod === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          winners = winners.filter((item: any) => {
            const winnerDate = new Date(item.date);
            return winnerDate >= today;
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
          id: `${item.date}-${item.lotteryId}`,
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
          date: item.date,
          firstPrize: item.firstPrize,
          secondPrize: item.secondPrize,
          thirdPrize: item.thirdPrize,
        }));
        dispatch(addToWinnerList(formattedWinners));
        setError(null);
        setInfo(null);
      } else {
        setError(null);
        setInfo(null);
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
    const availableLotteries = lotteries.length > 0 ? lotteries : defaultLotteries;
    const selected = availableLotteries.find(
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

  const getDisplayLotteryName = () => {
    if (selectedLottery) {
      return selectedLottery.abbreviation || "LOTTERY";
    }
    return "LOTTERY";
  };

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full min-h-screen overflow-x-auto">
        {!(isMobile && isViewAllActive) && (
          <Header
            isMenuOpen={isMenuOpen}
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          />
        )}
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto w-full mb-20 lg:mb-0">
          
          <div className="w-full mx-auto max-w-full ">

            {isMobile && !isViewAllActive ? (
              <>
                <div className="mb-4">
                  <p className="text-sm mb-2">Select your lottery</p>
                  <select
                    value={selectedLottery?.id || ""}
                    onChange={handleLotterySelection}
                    className="w-full px-2 py-2 bg-[#1D1F27] border border-[#EDB726] rounded-lg text-gray-300 text-xs focus:outline-none focus:border-[#EDB726] cursor-pointer"
                    aria-label="Select lottery"
                  >
                    <option value="">Select Lottery</option>
                    {(lotteries.length > 0 ? lotteries : defaultLotteries).map(
                      (lottery: any) => (
                        <option key={lottery.id} value={lottery.id}>
                          {lottery.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
                {selectedPeriod === "today" && (
                  <div className="p-2 mb-4">
                    <div className="text-center">
                      <div className="bg-[#1D1F27] rounded-lg p-2 inline-block">
                        <h3 className="text-base font-semibold text-gray-300 mb-1">
                          Today's Countdown
                        </h3>
                        <div className="text-2xl font-bold text-[#EDB726]">
                          {countdown}
                        </div>
                        <div className="mt-2 p-1 px-2 rounded-lg flex justify-center">
                          <h3 className="text-base font-semibold text-[#EDB726] whitespace-nowrap">
                            {getDisplayLotteryName()}
                          </h3>
                        </div>
                      </div>
                    </div>
                    {info ? (
                      <div className="text-center text-gray-400 p-2 mt-4">{info}</div>
                    ) : filteredWinners.length > 0 ? (
                      <div className="text-center mt-2">
                        <p className="text-lg font-normal text-white mb-2">Previous Winning <br /> Numbers</p>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-2">
                            <div className="bg-[#EDB726] rounded-full p-4 inline-block">
                              <Trophy className="text-[#571102]" />
                            </div>
                            <p className="text-base font-bold text-white">1st prize</p>
                            <div className="text-xl font-bold text-[#EDB726]">
                              {filteredWinners[0]?.firstPrize || "-"}
                            </div>
                          </div>
                          <div className="flex justify-center space-x-8">
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">2nd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">
                                {filteredWinners[0]?.secondPrize || "-"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">3rd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">
                                {filteredWinners[0]?.thirdPrize || "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mt-2">
                        <p className="text-lg font-normal text-white mb-2">Previous Winning <br /> Numbers</p>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-2">
                            <div className="bg-[#EDB726] rounded-full p-4 inline-block">
                              <Trophy className="text-[#571102]" />
                            </div>
                            <p className="text-base font-bold text-white">1st prize</p>
                            <div className="text-xl font-bold text-[#EDB726]">-</div>
                          </div>
                          <div className="flex justify-center space-x-8">
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">2nd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">-</div>
                            </div>
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">3rd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">-</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-center mt-4">
                      <button
                        onClick={() => {
                          setSelectedPeriod("all");
                          setIsViewAllActive(true);
                        }}
                        className="px-4 py-2 bg-[#EDB726] font-bold text-[#1D1F27] rounded-full hover:bg-[#d4a422] transition-colors text-sm"
                        aria-label="View all winners"
                        style={{
                          background: "linear-gradient(135deg, #DCC549, #7B5910)"
                        }}
                      >
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={isMobile ? "space-y-2 mb-4" : "bg-[#2A2D36] rounded-lg p-2 sm:p-4 md:p-6 border border-white mb-4 sm:mb-6 md:mb-8 w-full max-w-full overflow-x-auto"}>
                  <div className={isMobile ? "space-y-2" : "flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"}>
                    {!isMobile && (
                      <div className="flex space-x-1 bg-[#1D1F27] rounded-lg p-1 md:mr-2">
                        {["today", "all"].map((period) => (
                          <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-medium transition-colors ${selectedPeriod === period
                              ? "bg-[#EDB726] text-[#1D1F27]"
                              : "text-gray-400 hover:text-white cursor-pointer"
                              }`}
                          >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className={isMobile ? "space-y-2" : "flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto"}>
                      {isMobile && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedPeriod("today");
                              setIsViewAllActive(false);
                            }}
                            className="flex items-center text-white hover:text-yellow-600 transition-colors text-sm sm:text-base"
                            aria-label="Back to today"
                          >
                            <ChevronLeft className="w-5 h-5 mr-2" />Winners
                          </button>
                          <input
                            type="text"
                            placeholder="Search by price or winnig numbers"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-2 py-3 bg-[#2A2D36] border border-white rounded-lg text-gray-200 text-xs focus:outline-none focus:border-[#EDB726]"
                            aria-label="Search winners"
                          />
                        </>

                      )}
                      <select
                        value={selectedLottery?.id || ""}
                        onChange={handleLotterySelection}
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 bg-[#1D1F27] border border-[#EDB726] rounded-md text-gray-300 text-xs sm:text-sm md:text-base focus:outline-none focus:border-[#EDB726] cursor-pointer"
                        aria-label="Select lottery"
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
                        className="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-2 bg-[#1D1F27] border border-[#EDB726] rounded-md text-gray-300 text-xs sm:text-sm md:text-base focus:outline-none focus:border-[#EDB726] cursor-pointer"
                        aria-label="Select ticket type"
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
                      {!isMobile && (
                        <input
                          type="text"
                          placeholder="Search by price or winnig numbers"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full sm:w-48 md:w-64 px-2 sm:px-3 py-1 sm:py-2 bg-[#1D1F27] border border-white rounded-lg text-gray-300 text-xs sm:text-sm md:text-base focus:outline-none focus:border-[#EDB726]"
                          aria-label="Search winners"
                        />
                      )}
                    </div>
                  </div>
                </div>
                {selectedPeriod === "today" && (
                  <div className=" mb-4 sm:mb-6 md:mb-8">
                    <div className="text-center">
                      <div className="bg-[#1D1F27] rounded-lg  inline-block">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-300 mb-1 sm:mb-2">
                          Today's Countdown
                        </h3>
                        <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#EDB726]">
                          {countdown}
                        </div>
                        <div className="mt-2 sm:mt-4  p-1 px-2 sm:px-4 rounded-lg flex justify-center">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#EDB726] whitespace-nowrap">
                            {getDisplayLotteryName()}
                          </h3>
                        </div>
                      </div>
                    </div>
                    {info ? (
                      <div className="text-center text-gray-400 p-2 sm:p-4 mt-4 sm:mt-6">{info}</div>
                    ) : filteredWinners.length > 0 ? (
                      <div className="text-center mt-2">
                        <p className="text-lg font-normal text-white mb-2">Previous Winning <br /> Numbers</p>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-2">
                            <div className="bg-[#EDB726] rounded-full p-4 inline-block">
                              <Trophy className="text-[#571102]" />
                            </div>
                            <p className="text-base font-bold text-white">1st prize</p>
                            <div className="text-xl font-bold text-[#EDB726]">
                              {filteredWinners[0]?.firstPrize || "-"}
                            </div>
                          </div>
                          <div className="flex justify-center space-x-20">
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">2nd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">
                                {filteredWinners[0]?.secondPrize || "-"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">3rd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">
                                {filteredWinners[0]?.thirdPrize || "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mt-2">
                        <p className="text-lg font-normal text-white mb-2">Previous Winning <br /> Numbers</p>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-2">
                            <div className="bg-[#EDB726] rounded-full p-4 inline-block">
                              <Trophy className="text-[#571102]" />
                            </div>
                            <p className="text-base font-bold text-white">1st prize</p>
                            <div className="text-xl font-bold text-[#EDB726]">-</div>
                          </div>
                          <div className="flex justify-center space-x-20">
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">2nd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">-</div>
                            </div>
                            <div className="text-center">
                              <div className="bg-[#EDB726] rounded-full p-4 inline-block mb-1">
                                <Trophy className="text-[#571102]" />
                              </div>
                              <p className="text-base font-bold text-white">3rd prize</p>
                              <div className="text-xl font-bold text-[#EDB726]">-</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedPeriod === "all" && (
                  <div className="bg-[#2A2D36] rounded-lg overflow-x-auto border border-gray-700 w-full max-w-full">
                    {loading ? (
                      <div className="text-center text-gray-400 p-2 sm:p-4">
                        Loading winners...
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-400 p-2 sm:p-4">{error}</div>
                    ) : info ? (
                      <div className="text-center text-gray-400 p-2 sm:p-4">{info}</div>
                    ) : filteredWinners.length === 0 ? (
                      <div className="text-center text-gray-400 p-2 sm:p-4">
                        No winners found for selected criteria.
                      </div>
                    ) : (
                      <table className="min-w-full text-xs sm:text-sm md:text-base text-left text-gray-300">
                        <thead className="bg-[#1D1F27] text-xs sm:text-sm md:text-base text-gray-500">
                          <tr>
                            <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">Date</th>
                            <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                              1<sup>st</sup> Prize
                            </th>
                            <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                              2<sup>nd</sup> Prize
                            </th>
                            <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">
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
                              <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">{winner.date}</td>
                              <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                                {winner.firstPrize || "-"}
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                                {winner.secondPrize || "-"}
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                                {winner.thirdPrize || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Winners;
