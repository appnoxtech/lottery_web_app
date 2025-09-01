import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Ticket, Trophy, Menu, X, Home } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      path: '/home'
    },
    {
      id: 'new-lottery',
      label: 'New Lottery',
      icon: Plus,
      path: '/new-lottery'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      path: '/tickets'
    },
    {
      id: 'winners',
      label: 'Winners',
      icon: Trophy,
      path: '/winners'
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close mobile menu
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#2A2D36] rounded-lg border border-gray-700 shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40
        w-64 bg-[#2A2D36] border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 pb-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#EDB726] rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#1D1F27]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Lottery</h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.path)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                        transition-all duration-200 text-left
                        ${isActive 
                          ? 'bg-[#EDB726] text-[#1D1F27] font-semibold' 
                          : 'text-gray-300 hover:bg-[#3A3D46] hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 p-3 bg-[#1D1F27] rounded-lg">
              <div className="w-8 h-8 bg-[#EDB726] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-[#1D1F27]">LT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Lottery System</p>
                <p className="text-xs text-gray-400 truncate">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
