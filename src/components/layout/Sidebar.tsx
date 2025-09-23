import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Ticket, Trophy, Menu, X } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "new-lottery",
      label: "Buy Lottery",
      icon: Plus,
      path: "/new-lottery",
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      path: "/tickets",
    },
    {
      id: "winners",
      label: "Winners",
      icon: Trophy,
      path: "/winners",
    },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close mobile menu
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 py-3 bg-[#2A2D36] rounded-lg border border-gray-700 shadow-lg"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40
        w-64 bg-[#2A2D36] border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${className}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand with Close Button */}
          <div className="p-6 pb-4 border-b border-gray-700 relative">
            {/* Close Button (X) - Only visible on mobile when sidebar is open */}
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden absolute top-5 right-4 p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            <div className="flex items-center space-x-5">
              <div className="w-10 h-10 bg-[#EDB726] rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#1D1F27]" />
              </div>
              <div className="text-center">
                <h1 className="text-sm font-bold text-white">
                  Wega di Number <span className="block text-[#EDB726] tracking-[0.3em] text-semibold text-lg">online</span>
                </h1>
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
                          ? "bg-[#EDB726] text-[#1D1F27] font-semibold"
                          : "text-gray-300 hover:bg-[#3A3D46] hover:text-white cursor-pointer"
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
                <p className="text-sm font-medium text-white truncate">
                  Lottery System
                </p>
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
