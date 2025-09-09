import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const LotteryRules: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when this page is loaded
  }, []);
  return (
    <div className="min-h-screen bg-[#1D1F27] text-white p-6 rounded-lg shadow-lg">
      <div className="max-w-4xl mx-auto">
        {" "}
        {/* Added container with max-width and centering */}
        <h1 className="text-3xl mb-6 text-center">
          <span className="text-white">Lottery </span>
          <span className="text-[#EDB726]">Rules</span>
        </h1>
        <div className="space-y-4 text-gray-300 px-4 text-justify">
          {" "}
          {/* Added horizontal padding */}
          <ol className="list-decimal pl-5 space-y-4">
            <li>
              <strong className="text-white">Initial Number Selection:</strong>
              When a client asks to purchase a 4-digit number (e.g., 1234), the
              seller will first input this number and the corresponding bet
              amount.
            </li>
            <li>
              <strong className="text-white">
                Quick Selection Prompt for 3-Digit and 2-Digit Numbers:
              </strong>
              Once the 4-digit number is entered, the app will automatically
              prompt the seller with the option to add the corresponding 3-digit
              and 2-digit numbers.
              <ul className="list-disc pl-5 mt-2">
                <li>
                  For example, if the client selects 1234, the app will suggest
                  the related:
                  <ul className="list-disc pl-5 mt-1">
                    <li>3-digit number: 234</li>
                    <li>2-digit number: 34</li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
              <strong className="text-white">
                Efficient Workflow for Sellers:
              </strong>
              Instead of having to restart the process to manually input each
              new number, the seller can quickly check a box or tap a button to
              add these variations. This allows the seller to easily offer the
              client the 3-digit and 2-digit options without navigating away
              from the screen or re-entering basic information like the lottery
              game or bet type.
            </li>
            <li>
              <strong className="text-white">Optional Selection:</strong>
              If the client only wants the 4-digit number, the seller can
              proceed without selecting the 3-digit or 2-digit numbers. However,
              if the client agrees to buy these additional numbers, they can be
              added with a single action.
            </li>
            <li>
              <strong className="text-white">Flexibility for Clients:</strong>
              The client is free to choose any combination. They can buy:
              <ul className="list-disc pl-5 mt-2">
                <li>Only the 4-digit number</li>
                <li>Only the 3-digit number</li>
                <li>Only the 2-digit number</li>
                <li>
                  Or any combination of the three (e.g., 4-digit + 3-digit,
                  4-digit + 2-digit, or all three).
                </li>
              </ul>
            </li>
            <li>
              <strong className="text-white">
                Customization for Bet Amounts:
              </strong>
              The client may want to place different bet amounts on each
              variation of the number (e.g., $1 for the 4-digit number, $0.50
              for the 3-digit number, and $0.25 for the 2-digit number). The app
              allows the seller to enter different bet amounts for each of the
              selected numbers in the sequence.
            </li>
          </ol>
        </div>
        <Link
          to="/home"
          className="w-full flex items-center justify-center py-3 px-6 rounded-lg mt-8 
                     border border-[#EDB726] bg-gradient-to-r from-[#EDB726] to-[#d4a422] 
                     text-[#1D1F27] font-semibold transition-colors lg:hidden max-w-md mx-auto" // Added max-width and centering
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LotteryRules;
