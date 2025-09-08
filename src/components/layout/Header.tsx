import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { User, ChevronDown, LogOut, Search } from "lucide-react";
import { type RootState } from "../../store";
import { clearUser } from "../../store/slicer/userSlice";

interface HeaderProps {
  className?: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user data from Redux store
  const userData = useSelector((state: RootState) => state.user.userData);

  const user = {
    name: userData?.name || "User",
    phone: userData?.phone_number || "",
    avatar: userData?.profile_image || null,
    id: userData?.id || "",
  };

  const handleLogout = () => {
    try {
      console.log("Logout initiated...");

      // Clear Redux state
      dispatch(clearUser());
      console.log("Redux state cleared");

      // Clear localStorage
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      console.log("localStorage cleared");

      // Navigate to login
      navigate("/login", { replace: true });
      console.log("Navigation to login completed");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force page reload to login
      window.location.href = "/login";
    }
  };

  const notifications = [
    {
      id: 1,
      title: "New Winner Announced",
      message: "Lottery #123 has a new winner!",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Ticket Sales Update",
      message: "500 new tickets sold today",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight",
      time: "3 hours ago",
      unread: false,
    },
  ];

  // const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={`bg-[#2A2D36] border-b border-gray-700 flex-shrink-0 ${className}`}
    >
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="lg:hidden mr-12">
            {/* <button
              onClick={onMenuToggle}
              className="p-2 bg-[#1D1F27] rounded-lg border border-gray-600 hover:border-[#EDB726] transition-colors cursor-pointer"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button> */}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lotteries, tickets, winners..."
                className="w-full pl-10 pr-4 py-3 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
              />
            </div>
          </div>

          {/* Right Side - Notifications and User Menu */}
          <div className="flex items-center space-x-4 ml-3">
            {/* Notifications */}
            {/* <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-[#1D1F27] rounded-lg border border-gray-600 hover:border-[#EDB726] transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 text-gray-300 " />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EDB726] text-[#1D1F27] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              Notifications Dropdown
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#2A2D36] border border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-600">
                    <h3 className="text-lg font-semibold text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-700 hover:bg-[#3A3D46] cursor-pointer ${
                          notification.unread ? "bg-[#1D1F27]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-[#EDB726] rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-600">
                    <button className="w-full text-center text-[#EDB726] hover:text-[#d4a422] text-sm font-medium cursor-pointer">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div> */}

            {/* User Menu - Hidden on small screens, visible on medium and up */}
            <div className="relative  md:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 bg-[#1D1F27] rounded-lg border border-gray-600 hover:border-[#EDB726] transition-colors cursor-pointer"
              >
                {/* Profile Image or Avatar */}
                <div className="w-8 h-8 bg-[#EDB726] rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#1D1F27]">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.phone}</p>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2A2D36] border border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-[#3A3D46] hover:text-white rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <hr className="my-2 border-gray-600" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Logout button clicked");
                        setShowModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-black/80">
          <div className="bg-[#1D1F27] text-white rounded-lg shadow-lg p-6 w-11/12 max-w-sm border border-[#EDB726]">
            <p className="text-lg text-center mb-6">
              Do you really want to Logout?
            </p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-white text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg bg-[#EDB726] text-[#1D1F27] font-semibold hover:bg-[#d4a422] transition-colors cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
