import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when this page is loaded
  }, []);
  return (
    <div className="min-h-screen bg-[#1D1F27] text-white p-6 rounded-lg shadow-lg">
      <div className="max-w-4xl mx-auto">
        {" "}
        {/* Added container with max-width and centering */}
        <h1 className="text-3xl mb-6 text-center">
          <span className="text-white">Privacy </span>
          <span className="text-[#EDB726]">Policy</span>
        </h1>
        <div className="space-y-4 text-gray-300 px-4 text-justify">
          {" "}
          {/* Added horizontal padding */}
          <p>
            At Wega Di Number, owned and operated by Curaçao, we prioritize your
            privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, and share your
            data when you use the App.
          </p>
          <p>
            We collect information you provide during registration, such as your
            name, email address, and payment details, as well as data generated
            through your use of the App, including transaction history and
            lottery participation.
          </p>
          <p>
            We use this information to process payments, facilitate lottery
            participation, notify you of winnings, and improve the App's
            functionality.
          </p>
          <p>
            Your information may be shared with third-party service providers
            who assist us in operating the App, processing transactions, or
            complying with legal obligations, but they are obligated to protect
            your data and use it only for specified purposes. We do not sell or
            rent your personal information to third parties for marketing
            purposes.
          </p>
          <p>
            The App uses cookies and similar technologies to enhance your user
            experience, track usage, and provide personalized content. You can
            adjust your browser settings to reject cookies, but this may affect
            your use of some App features.
          </p>
          <p>
            We implement industry-standard security measures to protect your
            data; however, no method of transmission over the internet is 100%
            secure, and we cannot guarantee absolute security.
          </p>
          <p>
            By using the App, you consent to this Privacy Policy, which may be
            updated periodically. Changes will be effective upon posting, and
            continued use of the App signifies your acceptance of any revisions.
          </p>
          <p>
            If you have questions or concerns about this policy, please contact
            us at [Contact Information].
          </p>
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

export default PrivacyPolicy;
