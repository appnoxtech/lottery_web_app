import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setInitialData, type Lottery } from "../store/slicer/initalDataSlice";
import { lotteriesData } from "../utils/services/Lotteries.services";
import { handleApiError } from "../hooks/handleApiError";

const NewLottery: React.FC = () => {
  const dispatch = useDispatch();
  const lotteries = useSelector(
    (state: any) => state.initialData.initData
  ) as Lottery[];

  const [inputNumbers, setInputNumbers] = useState("");
  const [selectedLottery, setSelectedLottery] = useState<string>("");
  const [betAmount, setBetAmount] = useState<number | "">("");
  const [selectedDigits, setSelectedDigits] = useState<number[]>([]);
  const [loadingLotteries, setLoadingLotteries] = useState<boolean>(true);
  const [errorFetchingLotteries, setErrorFetchingLotteries] = useState<
    string | null
  >(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
          apiErrorMessage = (error.response.data as { message: string })
            .message;
        }
        handleApiError(error, apiErrorMessage);
      } finally {
        setLoadingLotteries(false);
      }
    };

    fetchLotteries();
  }, [dispatch]);

  const handleDigitChange = (digit: number) => {
    setSelectedDigits((prev) =>
      prev.includes(digit) ? prev.filter((d) => d !== digit) : [...prev, digit]
    );
  };

  const processNumbers = (numbersString: string, digitsToProcess: number[]) => {
    const processedResults: { [key: number]: string[] } = {};

    if (!numbersString || digitsToProcess.length === 0) {
      return processedResults;
    }

    const numbers = numbersString
      .split(",")
      .map((n) => n.trim())
      .filter((n) => /^\d+$/.test(n)); // Only digits

    digitsToProcess.forEach((digit) => {
      const resultForDigit: string[] = [];
      numbers.forEach((num) => {
        if (num.length === digit) {
          resultForDigit.push(num);
        } else if (num.length > digit) {
          resultForDigit.push(num.slice(-digit));
        }
      });
      if (resultForDigit.length > 0) {
        processedResults[digit] = resultForDigit;
      }
    });

    return processedResults;
  };

  const handleCreateLottery = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form fields
    if (!selectedLottery || !betAmount || selectedDigits.length === 0) {
      alert("Please fill all required fields");
      return;
    }
    // Show payment method modal
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    console.log(`Selected payment method: ${method}`);
    // Handle the payment process based on the selected method
    setShowPaymentModal(false);
    // Proceed with lottery creation
  };

  const processedNumbers = processNumbers(inputNumbers, selectedDigits);

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
                Create New Lottery
              </h1>
              <p className="text-gray-300">
                Set up a new lottery draw with custom parameters
              </p>
            </div>

            {/* Create New Lottery Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
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
                      onChange={(e) => setInputNumbers(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="e.g., 12, 345, 1234, 56, 8"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lotterySelect"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Select Lottery
                    </label>
                    <div className="relative w-full">
                      <select
                        id="lotterySelect"
                        value={selectedLottery}
                        onChange={(e) => setSelectedLottery(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726] cursor-pointer"
                        required
                      >
                        <option value="" disabled hidden>
                          Select a Lottery
                        </option>
                        {loadingLotteries && (
                          <option value="" disabled>
                            Loading Lotteries...
                          </option>
                        )}
                        {errorFetchingLotteries && (
                          <option value="" disabled>
                            {errorFetchingLotteries}
                          </option>
                        )}
                        {!loadingLotteries &&
                          !errorFetchingLotteries &&
                          lotteries.length === 0 && (
                            <option value="" disabled>
                              No Lotteries Available
                            </option>
                          )}
                        {!loadingLotteries &&
                          !errorFetchingLotteries &&
                          lotteries.length > 0 &&
                          lotteries.map((lottery) => (
                            <option
                              key={lottery.id}
                              value={lottery.id.toString()}
                            >
                              {lottery.abbreviation}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
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
                      type="number"
                      value={betAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))
                        ) {
                          setBetAmount(value === "" ? "" : parseFloat(value));
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="₹0.00"
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
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            selectedDigits.includes(digit)
                              ? "bg-[#EDB726] text-[#1D1F27]"
                              : "bg-[#374151] text-gray-300 hover:bg-[#4B5563] cursor-pointer"
                          }`}
                        >
                          {digit} Digit
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#EDB726] text-[#1D1F27] font-semibold py-3 px-6 rounded-lg hover:bg-[#d4a422] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Lottery</span>
                    </button>

                    <button
                      type="button"
                      className="px-6 py-3 bg-[#374151] text-gray-300 font-semibold rounded-lg hover:bg-[#4B5563] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview Section */}
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Lottery Preview
                </h2>

                <div className="space-y-4">
                  <div className="bg-[#1D1F27] rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {lotteries.find(
                          (lottery) => lottery.id.toString() === selectedLottery
                        )?.name || "Sample Lottery"}
                      </h3>
                      <span className="px-3 py-1 bg-[#EDB726] text-[#1D1F27] text-sm font-medium rounded-full">
                        Active
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
                        <span className="text-sm text-gray-300">
                          ₹{betAmount || "0.00"} per bet
                        </span>
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
                          Digits:{" "}
                          {selectedDigits.length > 0
                            ? selectedDigits.sort().join(", ")
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {Object.keys(processedNumbers).length > 0 && (
                      <div className="bg-[#2A2D36] rounded-lg p-3 mt-4">
                        <p className="text-sm font-semibold text-white mb-2">
                          Processed Numbers:
                        </p>
                        {Object.entries(processedNumbers).map(
                          ([digit, numbers]) => (
                            <div key={digit} className="mb-2">
                              <span className="text-sm text-gray-400">
                                {digit} Digit Numbers:{" "}
                              </span>
                              <span className="text-[#EDB726] font-medium">
                                {numbers.join(", ")}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Choose Payment Method
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

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
              Select your preferred payment method to complete the lottery
              creation
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewLottery;
