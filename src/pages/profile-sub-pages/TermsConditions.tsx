import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const TermsConditions: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when this page is loaded
  }, []);
  return (
    <div className="min-h-screen bg-[#1D1F27] text-white p-6 rounded-lg shadow-lg">
      <div className="max-w-4xl mx-auto">
        {" "}
        {/* Added container with max-width and centering */}
        <h1 className="text-3xl mb-6 text-center">
          <span className="text-white">Terms &amp; </span>
          <span className="text-[#EDB726]">Conditions</span>
        </h1>
        <div className="space-y-4 text-gray-300 px-4 text-justify">
          {" "}
          {/* Added horizontal padding */}
          <p>
            By using Wega di Number, owned and operated by Curaçao, you agree to
            these terms and conditions. Users must be at least 18 years old, and
            it is their responsibility to ensure that participating in lotteries
            is legal in their jurisdiction.
          </p>
          <p>
            Account registration is required to use the App, and users must
            provide accurate and up-to-date information, keeping their account
            secure.
          </p>
          <p>
            Purchasing lottery tickets involves risk, and the App does not
            guarantee any winnings or returns. Payments must be made using the
            available methods, and all transactions are final, subject to the
            rules of the respective lottery.
          </p>
          <p>
            Winnings are distributed based on the lottery's rules, and any fees
            or applicable taxes on winnings are the user's responsibility.
          </p>
          <p>
            Users are prohibited from engaging in fraudulent activities or using
            the App for illegal purposes, including money laundering.
          </p>
          <p>
            The content and trademarks in the App belong to [Company Name] or
            its licensors, and may not be used without permission.
          </p>
          <p>
            The App is provided "as is" with no warranties, and [Company Name]
            is not liable for any damages arising from its use.
          </p>
          <p>
            [Company Name] may modify these terms at any time, with changes
            effective upon posting. Continued use of the App implies acceptance
            of any revised terms.
          </p>
          <p>
            The laws of [Jurisdiction] govern these terms, and any disputes will
            be resolved under the jurisdiction of its courts.
          </p>
          <p>For questions, please contact us at [Contact Information].</p>
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

export default TermsConditions;
