import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to Lottery Dashboard
              </h1>
              <p className="text-gray-300">
                Manage your lottery system from this dashboard
              </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* New Lottery Card */}

              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 hover:border-[#EDB726] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    New Lottery
                  </h3>
                  <div className="w-12 h-12 bg-[#EDB726] rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#1D1F27]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Create and manage new lottery draws
                </p>
                <Link to="/new-lottery">
                  <button className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-2 px-4 rounded-lg hover:bg-[#d4a422] transition-colors cursor-pointer">
                    Create Lottery
                  </button>
                </Link>
              </div>

              {/* Tickets Card */}
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 hover:border-[#EDB726] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Tickets</h3>
                  <div className="w-12 h-12 bg-[#EDB726] rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#1D1F27]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  View and manage lottery tickets
                </p>
                <Link to="/tickets">
                  <button className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-2 px-4 rounded-lg hover:bg-[#d4a422] transition-colors cursor-pointer">
                    View Tickets
                  </button>
                </Link>
              </div>

              {/* Winners Card */}
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 hover:border-[#EDB726] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Winners</h3>
                  <div className="w-12 h-12 bg-[#EDB726] rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#1D1F27]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3l14 9-14 9V3z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  View lottery winners and results
                </p>
                <Link to="/winners">
                  <button className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-2 px-4 rounded-lg hover:bg-[#d4a422] transition-colors cursor-pointer">
                    View Winners
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quick Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-[#EDB726]">24</div>
                  <div className="text-sm text-gray-400">Active Lotteries</div>
                </div>
                <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-[#EDB726]">1,234</div>
                  <div className="text-sm text-gray-400">Total Tickets</div>
                </div>
                <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-[#EDB726]">56</div>
                  <div className="text-sm text-gray-400">
                    Winners This Month
                  </div>
                </div>
                <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-[#EDB726]">₹2.5L</div>
                  <div className="text-sm text-gray-400">Total Prizes</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
