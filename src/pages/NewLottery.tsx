import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Plus, Calendar, DollarSign, Users } from 'lucide-react';

const NewLottery: React.FC = () => {
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
                <h2 className="text-xl font-semibold text-white mb-6">Lottery Details</h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lottery Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="Enter lottery name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="Enter lottery description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ticket Price
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                        placeholder="₹0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prize Amount
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                        placeholder="₹0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Draw Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Draw Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Tickets
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                      placeholder="Enter maximum number of tickets"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#EDB726] text-[#1D1F27] font-semibold py-3 px-6 rounded-lg hover:bg-[#d4a422] transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Lottery</span>
                    </button>
                    
                    <button
                      type="button"
                      className="px-6 py-3 bg-[#374151] text-gray-300 font-semibold rounded-lg hover:bg-[#4B5563] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Preview Section */}
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">Lottery Preview</h2>
                
                <div className="space-y-4">
                  <div className="bg-[#1D1F27] rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">Sample Lottery</h3>
                      <span className="px-3 py-1 bg-[#EDB726] text-[#1D1F27] text-sm font-medium rounded-full">
                        Active
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      This is how your lottery will appear to users
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-[#EDB726]" />
                        <span className="text-sm text-gray-300">₹100 per ticket</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#EDB726]" />
                        <span className="text-sm text-gray-300">1000 max tickets</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="w-4 h-4 text-[#EDB726]" />
                      <span className="text-sm text-gray-300">Draw on: Dec 25, 2024 at 6:00 PM</span>
                    </div>
                    
                    <div className="bg-[#2A2D36] rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#EDB726] mb-1">₹50,000</div>
                        <div className="text-sm text-gray-400">Prize Amount</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewLottery;
