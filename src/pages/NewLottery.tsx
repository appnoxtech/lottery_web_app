import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setInitialData, type Lottery } from "../store/slicer/initalDataSlice";
import { lotteriesData } from "../utils/services/Lotteries.services";
import { handleApiError } from "../hooks/handleApiError";
import StripeCheckout from "./StripeCheckout";
import WhatsAppModal from "./WhatsAppModal";
import { placeOrder } from "../utils/services/Order.services";
import { dollarConversion } from "../hooks/utilityFn";
// import { formatDate } from "../hooks/dateFormatter";
import { showToast } from "../utils/toast.util";
import { getOrderDetails } from "../utils/services/Order.services";
import { useSearchParams } from "react-router-dom";

// Define interfaces
interface FormValues {
  lotteryNumber: string;
  selectedLotteries: Lottery[];
  betAmount: string;
  selectedDigitType: number[];
  selectedNumbers: number[];
}

interface Order {
  order_id: number;
  payment_intent_id: string;
  client_secret: string;
  total_price: string;
  local_total: string;
  ticket_numbers: number[];
  selected_lotteries: string[];
}

interface OrderDetailItem {
  lottery_number: string | number;
  bet_amount: string;
  abbreviation: string;
}

interface OrderDetailsResponse {
  data: {
    result: {
      details: OrderDetailItem[];
    };
  };
}

// const paymentLink = `https://buy.stripe.com/fZeeUU05C8XueWIeUU`;
// const paymentLink2 = `https://buy.stripe.com/fZe4gg8C8gpWdSEbIJ`;
// const paymentLink3 = `https://buy.stripe.com/eVa000cSo5Li29W5km`;

const NewLottery: React.FC = () => {
  const dispatch = useDispatch();
  const lotteries = useSelector(
    (state: any) => state.initialData.initData
  ) as Lottery[];
  const userData = useSelector((state: any) => state.user.userData) || [];

  const [inputNumbers, setInputNumbers] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLotteries, setSelectedLotteries] = useState<Lottery[]>([]);
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedDigits, setSelectedDigits] = useState<number[]>([]);
  const [loadingLotteries, setLoadingLotteries] = useState<boolean>(true);
  const [errorFetchingLotteries, setErrorFetchingLotteries] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newOrderInfo, setNewOrderInfo] = useState<Order | null>(null);
  const [processedNumbers, setProcessedNumbers] = useState<{ [key: number]: string[] }>({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        setLoadingLotteries(true);
        setErrorFetchingLotteries(null);
        const response = await lotteriesData();
        if (response?.data?.result) {
          dispatch(setInitialData(response.data.result));
        }
      } catch (error: unknown) {
        setErrorFetchingLotteries("Failed to fetch lotteries.");
        let apiErrorMessage = "Failed to fetch lotteries.";
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data
        ) {
          apiErrorMessage = (error.response.data as { message: string }).message;
        }
        handleApiError(error, apiErrorMessage);
      } finally {
        setLoadingLotteries(false);
      }
    };
    fetchLotteries();
  }, [dispatch]);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      const prefillForm = async () => {
        setLoading(true);
        try {
          const resp = await getOrderDetails(parseInt(orderId, 10)) as OrderDetailsResponse;
          const items: OrderDetailItem[] = resp?.data?.result?.details || [];
          if (items.length > 0) {
            const uniqueNumbers = items
              .map((item) => item.lottery_number.toString())
              .filter((num: string, index: number, self: string[]) => {
                const numLength = num.length;
                return !self.some((otherNum, otherIdx) =>
                  otherIdx < index && otherNum.length > numLength && otherNum.endsWith(num)
                );
              })
              .join(", ");
            setInputNumbers(uniqueNumbers);
            setBetAmount(items[0]?.bet_amount || "");
            const digits = [...new Set(items.map((item) => {
              const num = String(item.lottery_number || "").length;
              return num > 0 && num <= 4 ? num : 0; // Ensure valid digit lengths
            }))].filter((d) => d > 0); // Filter out invalid lengths
            setSelectedDigits(digits);
            const uniqueAbvs = [...new Set(items.map((item) => item.abbreviation))];
            const selected = uniqueAbvs
              .map((abv: string) => lotteries.find((l: Lottery) => l.abbreviation === abv))
              .filter((l): l is Lottery => l != null); // filters out both null and undefined
            // Type guard to filter out undefined
            setSelectedLotteries(selected);
          }
        } catch (error) {
          handleApiError(error, "Failed to pre-fill lottery details.");
        } finally {
          setLoading(false);
        }
      };
      prefillForm();
    }
  }, [searchParams, lotteries]);

  useEffect(() => {
    const newProcessed = processNumbers(inputNumbers, selectedDigits);
    setProcessedNumbers(newProcessed);
  }, [inputNumbers, selectedDigits]);

  useEffect(() => {
    if (newOrderInfo) {
      setNewOrderInfo(null);
    }
  }, [inputNumbers, betAmount, selectedDigits, selectedLotteries]);

  const handleDigitChange = (digit: number) => {
    setSelectedDigits((prev) =>
      prev.includes(digit) ? prev.filter((d) => d !== digit) : [...prev, digit]
    );
  };

  const handleLotterySelect = (lotteryId: string) => {
    const lottery = lotteries.find((l) => l.id.toString() === lotteryId);
    if (lottery) {
      setSelectedLotteries((prev) => {
        const exists = prev.find((l) => l.id === lottery.id);
        if (exists) {
          return prev.filter((l) => l.id !== lottery.id);
        }
        return [...prev, lottery];
      });
    }
  };

 const processNumbers = (numbersString: string, digitsToProcess: number[]) => {
  const processedResults: { [key: number]: string[] } = {};
  if (!numbersString || digitsToProcess.length === 0) {
    return processedResults;
  }
  const numbers = numbersString
    .split(",")
    .map((n) => n.trim())
    .filter((n) => /^-?\d+$/.test(n.replace(/,/g, "")));

  digitsToProcess.forEach((digit) => {
    const resultForDigit: string[] = [];
    numbers.forEach((num) => {
      const cleanNum = parseInt(num.replace(/,/g, ""), 10).toString();
      if (cleanNum.length === digit) {
        // Check if the number starts with zero (e.g., "08", "002")
        if (!cleanNum.startsWith("0") || cleanNum === "0") {
          if (!resultForDigit.some(existing => cleanNum === existing || (existing.length > cleanNum.length && existing.endsWith(cleanNum)))) {
            resultForDigit.push(cleanNum);
          }
        }
      } else if (cleanNum.length > digit) {
        const truncated = cleanNum.slice(-digit);
        // Check if the truncated number starts with zero (e.g., "002" from "90002" for 3 digits)
        if (!truncated.startsWith("0") || truncated === "0") {
          if (!resultForDigit.some(existing => truncated === existing || (existing.length > truncated.length && existing.endsWith(truncated)))) {
            resultForDigit.push(truncated);
          }
        }
      }
    });
    if (resultForDigit.length > 0) {
      processedResults[digit] = resultForDigit;
    }
  });
  return processedResults;
};
  const getAllProcessedNumbers = (): number[] => {
    const allNumbers: number[] = [];
    Object.values(processedNumbers).forEach((numberArray) => {
      numberArray.forEach((num) => {
        allNumbers.push(parseInt(num));
      });
    });
    return allNumbers;
  };

  const isOrderValid = (data: FormValues) => {
    if (data.selectedLotteries.length === 0) {
      showToast("Please select at least one lottery", "error");
      return false;
    } else if (data.selectedNumbers.length === 0) {
      showToast("Please select valid number", "error");
      return false;
    } else if (data.selectedDigitType.length === 0) {
      showToast("Please select at least one digit type", "error");
      return false;
    } else if (data.betAmount === "") {
      showToast("Please enter a bet amount", "error");
      return false;
    }
    return true;
  };

  const handleRemoveNumber = (digit: number, index: number) => {
    setProcessedNumbers((prev) => {
      const updatedList = [...prev[digit]];
      updatedList.splice(index, 1);
      return {
        ...prev,
        [digit]: updatedList,
      };
    });
  };

  const handleCreateLottery = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (newOrderInfo) {
      setShowPaymentModal(true);
      return;
    }
    setLoading(true);
    const formData: FormValues = {
      lotteryNumber: inputNumbers,
      selectedLotteries: selectedLotteries,
      betAmount: betAmount,
      selectedDigitType: selectedDigits,
      selectedNumbers: getAllProcessedNumbers(),
    };
    const isValid = isOrderValid(formData);
    if (!isValid) {
      setLoading(false);
      return;
    }
    const localTotal = formData.selectedNumbers.length * +formData.betAmount * formData.selectedLotteries.length;
    const orderParams = {
      userorder: [
        {
          bet_amount: formData.betAmount,
          lottery_id: formData.selectedLotteries.map((item) => item.id),
          lottery_number: formData.selectedNumbers,
        },
      ],
      total_price: dollarConversion(localTotal),
      user_id: userData?.id,
    };
    const response = await placeOrder(orderParams);
    if ((response as any)?.data?.success) {
      const { data } = (response as any)?.data;
      setNewOrderInfo({
        ...data,
        total_price: orderParams.total_price as string,
        local_total: localTotal.toString(),
        ticket_numbers: orderParams.userorder[0].lottery_number as number[],
        selected_lotteries: formData.selectedLotteries.map(
          (item) => item.abbreviation
        ),
      });
      setShowPaymentModal(true);
    }
  } catch (error) {
    handleApiError(error, "Failed to place order");
  } finally {
    setLoading(false);
  }
};

  const handleStripePayment = (success: boolean) => {
    if (success) {
      resetForm();
      setShowPaymentModal(false);
      // showToast("Payment successful!", "success");
    } else {
      setShowPaymentModal(false); // Close on failure or cancel
      showToast("Payment was not completed.", "error");
    }
  };

  //  const handleWhatsappPayment = () => {
  //   const grandTotal = parseFloat(newOrderInfo?.total_price || "0");
  //   const message = `
  //     Esaki ta e numbernan ku bo a pidi:
  //     ----------------------------------------
  //     🎟️ Numbernan: ${newOrderInfo?.ticket_numbers}
  //     💰 Loteria: ${newOrderInfo?.selected_lotteries?.join(", ")}
  //     📅 Fecha: ${formatDate(new Date().toISOString())}
  //     💵 Total: XCG ${grandTotal.toFixed(2)} / $ ${dollarConversion(
  //     Number(grandTotal)
  //   )} / € ${euroConversion(Number(grandTotal))}
  //     💳 Modo di Pago: Whatsapp

  //     Por fabor usa link pa paga sea na €, $ of XCG :
  //     Hulanda Ideal Euro €: ${paymentLink}
  //     Bonaire Dollar $: ${paymentLink2}
  //     Korsou Florin Karibense XCG: ${paymentLink3}

  //     Kòrda paga pa bo ta den wega i kontrolá bo bòn.
  //     Suerte,
  //     Wega Di Number`;
  //   const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  //   try {
  //     window.open(url, "_blank");
  //     setShowPaymentModal(false); // Close modal after opening WhatsApp
  //     showToast("Please complete payment via WhatsApp.", "info");
  //   } catch (err) {
  //     showToast("Failed to open WhatsApp", "error");
  //   }
  // };

  const resetForm = () => {
    setInputNumbers("");
    setSelectedLotteries([]);
    setBetAmount("");
    setSelectedDigits([]);
    setProcessedNumbers({});
    setNewOrderInfo(null);
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (method === "stripe") {
      setShowPaymentModal(false);
      setShowStripe(true);
    } else if (method === "whatsapp") {
      setShowPaymentModal(false);
      setShowWhatsappModal(true);
    } else {
      setShowPaymentModal(false);
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Create New Lottery
              </h1>
              <p className="text-gray-300">
                Set up a new lottery draw with custom parameters
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Lottery Details
                </h2>
                <form className="space-y-6" onSubmit={handleCreateLottery}>
                  <div>
                    <label
                      htmlFor="inputNumbers"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Enter Numbers (comma-separated)
                    </label>
                    <textarea
                      id="inputNumbers"
                      rows={3}
                      value={inputNumbers}
                      onChange={(e) => {
                        // Keep only digits, comma, and spaces
                        const sanitized = e.target.value.replace(/[^0-9, ]/g, "");
                        setInputNumbers(sanitized);
                      }}
                      onPaste={(e) => {
                        const paste = e.clipboardData.getData("text");
                        // Allow only digits, comma, and spaces in pasted content
                        const sanitized = paste.replace(/[^0-9, ]/g, "");
                        e.preventDefault();
                        setInputNumbers((prev) => prev + sanitized);
                      }}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="e.g., 12, 345, 1234, 56, 8"
                    />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Lotteries
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-[#1D1F27] border border-gray-600 rounded-lg p-2">
                      {loadingLotteries && (
                        <div className="text-gray-400 text-center py-2">Loading Lotteries...</div>
                      )}
                      {errorFetchingLotteries && (
                        <div className="text-red-400 text-center py-2">{errorFetchingLotteries}</div>
                      )}
                      {!loadingLotteries &&
                        !errorFetchingLotteries &&
                        lotteries.length === 0 && (
                          <div className="text-gray-400 text-center py-2">No Lotteries Available</div>
                        )}
                      {!loadingLotteries &&
                        !errorFetchingLotteries &&
                        lotteries.length > 0 &&
                        lotteries.map((lottery) => (
                          <label
                            key={lottery.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-[#2A2D36] p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLotteries.some(l => l.id === lottery.id)}
                              onChange={() => handleLotterySelect(lottery.id.toString())}
                              className="w-4 h-4 text-[#EDB726] bg-[#1D1F27] border-gray-600 rounded focus:ring-[#EDB726] focus:ring-2"
                            />
                            <span className="text-white">{lottery?.abbreviation || "N/A"}</span>

                          </label>
                        ))}
                    </div>
                    {selectedLotteries.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-400">Selected: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedLotteries.map((lottery) => (
                            <span
                              key={lottery.id}
                              className="bg-[#EDB726] text-[#1D1F27] px-2 py-1 rounded-full text-xs"
                            >
                              {lottery.abbreviation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="betAmount"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Bet Amount
                    </label>
                    <input
                      id="betAmount"
                      type="text"
                      value={betAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^-?\d*\.?\d*$/.test(value) && value !== "-") {
                          setBetAmount(value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="e.g., 10.50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Digit Type(s)
                    </label>
                    <div className="flex space-x-4">
                      {[2, 3, 4].map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handleDigitChange(digit)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedDigits.includes(digit)
                            ? "bg-[#EDB726] text-[#1D1F27]"
                            : "bg-[#374151] text-gray-300 hover:bg-[#4B5563] cursor-pointer"
                            } text-xs md:text-sm`}
                        >
                          {digit} Digit
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 ${loading ? 'bg-gray-600' : 'bg-[#EDB726] hover:bg-[#d4a422]'} text-[#1D1F27] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer`}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1D1F27]"></div>
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      <span>{loading ? 'Processing...' : (newOrderInfo ? 'Pay Now' : 'Create Lottery')}</span>
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-[#374151] text-gray-300 font-semibold rounded-lg hover:bg-[#4B5563] transition-colors cursor-pointer"
                      onClick={resetForm}
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Lottery Preview
                </h2>
                <div className="space-y-4">
                  <div className="bg-[#1D1F27] rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {selectedLotteries.length > 0
                          ? selectedLotteries.map((l) => l.abbreviation).join(", ")
                          : "Select Lotteries"}
                      </h3>
                      <span className="px-3 py-1 bg-[#EDB726] text-[#1D1F27] text-sm font-medium rounded-full">
                        {newOrderInfo ? 'Ready to Pay' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      This is how your lottery will appear to users
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-[#EDB726]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 4v4m0 4v2m-6-4H6m-2 0H4m4-8V6m0 4V2"
                          />
                        </svg>
                        <span className="text-sm text-gray-300">{betAmount || "0.00"} per bet</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-[#EDB726]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h-4v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2H0V7a4 4 0 014-4h16a4 4 0 014 4v13h-4zM7 7a3 3 0 10-6 0v7h6V7zM17 7a3 3 0 10-6 0v7h6V7zM12 11a3 3 0 100-6 3 3 0 000 6z"
                          />
                        </svg>
                        <span className="text-sm text-gray-300">
                          Digits: {selectedDigits.length > 0 ? selectedDigits.sort().join(", ") : "N/A"}
                        </span>
                      </div>
                    </div>
                    {Object.entries(processedNumbers).map(
                      ([digit, numbers]) =>
                        numbers.length > 0 && (
                          <div key={digit} className="mb-2">
                            <span className="text-sm text-gray-400">
                              {digit} Digit Numbers:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {numbers.map((number, index) => (
                                <span
                                  key={`${number}-${index}`}
                                  className="flex items-center bg-[#EDB726] text-[#1D1F27] px-2 py-1 rounded-full text-xs"
                                >
                                  {number}
                                  <button
                                    onClick={() => handleRemoveNumber(parseInt(digit), index)}
                                    className="ml-1 text-red-600 hover:text-red-800 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                    )}
                    {newOrderInfo && (
                      <div className="mt-4 p-3 bg-[#2A2D36] rounded border border-[#EDB726]">
                        <h4 className="text-sm font-semibold text-[#EDB726] mb-2">Order Created</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div>Order ID: {newOrderInfo.order_id}</div>
                          <div>Total: {newOrderInfo.local_total}</div>
                          <div>Numbers: {newOrderInfo.ticket_numbers.join(", ")}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Choose Payment Method
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {newOrderInfo && (
              <div className="mb-6 p-4 bg-[#1D1F27] rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-white mb-2">Order Summary</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Total Amount: XCG {newOrderInfo.local_total}</div>
                  <div>Numbers: {newOrderInfo.ticket_numbers.length}</div>
                  <div>Lotteries: {newOrderInfo.selected_lotteries.join(", ")}</div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={() => handlePaymentMethodSelect("stripe")}
                className="w-full bg-[#1D1F27] border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:border-[#EDB726] transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#EDB726] rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-[#1D1F27]"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.7917 8.75L7.58333 14.875L13.7917 21M20 8.75H15.1667H20ZM20 21H15.1667H20Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-white font-medium">
                    Pay With Stripe
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => handlePaymentMethodSelect("whatsapp")}
                className="w-full bg-[#1D1F27] border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:border-[#EDB726] transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.016a7.88 7.88 0 01-3.9-1.037l-.279-.165-2.937.77.784-2.875-.184-.289a7.88 7.88 0 01-1.2-4.206c0-4.356 3.532-7.89 7.888-7.89a7.88 7.88 0 015.658 2.357 7.882 7.882 0 012.33 5.643c0 4.356-3.532 7.89-7.888 7.89m8.949-16.785A11.811 11.811 0 0012.028 0C5.37 0 0 5.367 0 12.028c0 2.135.56 4.17 1.616 5.945L0 24l6.218-1.63c1.718.94 3.67 1.444 5.71 1.444h.01c6.667 0 12.037-5.367 12.037-12.028 0-3.172-1.238-6.157-3.487-8.405" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">
                    Pay With WhatsApp
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Select your preferred payment method to complete the lottery creation
            </p>
          </div>
        </div>
      )}
      {showStripe && (
        <StripeCheckout
          amount={parseFloat(newOrderInfo?.total_price || "0")}
          localAmount={parseFloat(newOrderInfo?.local_total || "0")}
          lotteryId={selectedLotteries.map((l) => l.id).join(",")}
          newOrderInfo={newOrderInfo} // Pass the prop
          onClose={(success: boolean) => {
            setShowStripe(false);
            handleStripePayment(success);
          }}
        />
      )}
      {showWhatsappModal && (
        <WhatsAppModal
          newOrderInfo={newOrderInfo}
          onClose={() => setShowWhatsappModal(false)} // just close modal
        />
      )}

    </div>
  );
};

export default NewLottery;