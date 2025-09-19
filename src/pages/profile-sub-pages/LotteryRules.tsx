import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getStaticPages, StaticPageType } from "../../utils/services/StaticPages.services";

const LotteryRules: React.FC = () => {
  const location = useLocation();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on every route change
    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStaticPages(StaticPageType.RULES);
        if (response && response.data && response.data.result) {
          // Extract the 'body' field from the result
          setContent(response.data.result.body || "No content available.");
        } else {
          setContent("Failed to load lottery rules.");
        }
      } catch (err) {
        setError("Failed to fetch lottery rules. Please try again later.");
        console.error("Error fetching lottery rules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [location]);

  return (
    <div className="min-h-screen bg-[#1D1F27] text-white p-6 rounded-lg shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6 text-center">
          <span className="text-white">Lottery </span>
          <span className="text-[#EDB726]">Rules</span>
        </h1>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : (
          <div className="space-y-4 px-4">
            <div
              className="lottery-rules-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
        <Link
          to="/home"
          className="w-full flex items-center justify-center py-3 px-6 rounded-lg mt-8 
                     border border-[#EDB726] bg-gradient-to-r from-[#EDB726] to-[#d4a422] 
                     text-[#1D1F27] font-semibold transition-colors lg:hidden max-w-md mx-auto"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LotteryRules;