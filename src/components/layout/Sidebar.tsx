import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Ticket, Trophy,Home } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const [, setIsOpen] = useState(false);
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
    setIsOpen(false); // Close mobile menu if open
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-black border-t border-gray-700 flex justify-around items-center p-2 z-50">
        <button
          onClick={() => handleItemClick("/tickets")}
          className={`flex flex-col items-center text-center text-[#5C5C89] hover:text-white transition-colors ${location.pathname === "/tickets" ? "text-[#EDB726]" : ""
            }`}
        >
          <Ticket className="w-6 h-6" />
          <span className="text-xs mt-4">Tickets</span> {/* Adjusted mt for alignment */}
        </button>
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => handleItemClick("/new-lottery")}
            className="flex items-center justify-center border-1 border-white rounded-full absolute"
            style={{
              background: "linear-gradient(135deg, #DFA93D, #530E16)",
              boxSizing: "border-box",
              width: "4rem",
              height: "4rem",
              padding: "0.20rem",
              top: "-3rem", // Pushes the button 3rem above the parent
              left: "50%",
              transform: "translateX(-50%)", // Centers the button horizontally
            }}
          >
            <Home className="w-6 h-6 text-[#EDB726]" />
          </button>
          {/* <span
            className={`mt-10 text-xs text-white transition-colors ${location.pathname === "/new-lottery" ? "text-[#EDB726]" : "text-gray-300 hover:text-white"
              }`}
          >
            HOME
          </span> */}
        </div>
        <button
          onClick={() => handleItemClick("/winners")}
          className={`flex flex-col items-center text-center text-[#5C5C89] hover:text-white transition-colors ${location.pathname === "/winners" ? "text-[#EDB726]" : ""
            }`}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs mt-4">Winners</span> {/* Adjusted mt for alignment */}
        </button>
      </div>
      {/* Sidebar for larger screens */}
      <div
        className={`
          hidden lg:block fixed inset-y-0 left-0 z-40
          w-64 bg-[#2A2D36] border-r border-gray-700
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 pb-4 border-b border-gray-700">
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

          {/* Navigation Menu for larger screens */}
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