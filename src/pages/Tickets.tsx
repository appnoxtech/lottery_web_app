import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { Search, Filter, Download, Eye, Ticket } from 'lucide-react';

const Tickets: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock ticket data
  const tickets = [
    {
      id: 'TKT001',
      lotteryName: 'Super Lucky Draw',
      ticketNumber: '123456',
      purchaseDate: '2024-01-15',
      purchaseTime: '14:30',
      price: 100,
      status: 'active',
      drawDate: '2024-01-20',
      customerName: 'John Doe',
      customerPhone: '+91 9876543210'
    },
    {
      id: 'TKT002',
      lotteryName: 'Mega Jackpot',
      ticketNumber: '789012',
      purchaseDate: '2024-01-14',
      purchaseTime: '16:45',
      price: 200,
      status: 'winner',
      drawDate: '2024-01-19',
      customerName: 'Jane Smith',
      customerPhone: '+91 9876543211'
    },
    {
      id: 'TKT003',
      lotteryName: 'Daily Fortune',
      ticketNumber: '345678',
      purchaseDate: '2024-01-13',
      purchaseTime: '12:15',
      price: 50,
      status: 'expired',
      drawDate: '2024-01-18',
      customerName: 'Bob Johnson',
      customerPhone: '+91 9876543212'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'winner':
        return 'bg-[#EDB726]/20 text-[#EDB726] border-[#EDB726]/30';
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredTickets = selectedTab === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === selectedTab);

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
                Ticket Management
              </h1>
              <p className="text-gray-300">
                View and manage all lottery tickets
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Tickets</p>
                    <p className="text-2xl font-bold text-white">1,234</p>
                  </div>
                  <Ticket className="w-8 h-8 text-[#EDB726]" />
                </div>
              </div>
              
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Tickets</p>
                    <p className="text-2xl font-bold text-green-400">856</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Winning Tickets</p>
                    <p className="text-2xl font-bold text-[#EDB726]">23</p>
                  </div>
                  <div className="w-3 h-3 bg-[#EDB726] rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-white">₹1.2L</p>
                  </div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Filters and Search */}
            <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Tabs */}
                <div className="flex space-x-1 bg-[#1D1F27] rounded-lg p-1">
                  {['all', 'active', 'winner', 'expired'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTab === tab
                          ? 'bg-[#EDB726] text-[#1D1F27]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Search and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="pl-10 pr-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                    />
                  </div>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-[#EDB726] transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-[#EDB726] text-[#1D1F27] rounded-lg hover:bg-[#d4a422] transition-colors font-medium">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tickets Table */}
            <div className="bg-[#2A2D36] rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1D1F27]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ticket Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Purchase Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-[#3A3D46] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {ticket.lotteryName}
                            </div>
                            <div className="text-sm text-gray-400">
                              Ticket #{ticket.ticketNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              Draw: {ticket.drawDate}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {ticket.customerName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {ticket.customerPhone}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-white">
                              {ticket.purchaseDate}
                            </div>
                            <div className="text-sm text-gray-400">
                              {ticket.purchaseTime}
                            </div>
                            <div className="text-sm font-medium text-[#EDB726]">
                              ₹{ticket.price}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#EDB726] hover:text-[#d4a422] mr-3">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-white">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tickets;
