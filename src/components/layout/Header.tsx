import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { User, ChevronDown, LogOut } from "lucide-react";
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
    name: userData?.name || "Shiva",
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

  return (
    <header
      className={`bg-[#1D1F27] border-b border-gray-700 flex-shrink-0 ${className}`}
    >
      <div className="px-4 lg:px-6 py-[0.59rem]">
        <div className="flex items-center justify-between lg:justify-end">
          {/* Profile Section - Visible on small screens, hidden on large screens */}
          <div
            onClick={() => navigate("/profile")} // Navigate to edit page on click
            className="flex items-center space-x-2 lg:hidden cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#EDB726] rounded-full flex items-center justify-center border border-2 border-[#EDB726]">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
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
            <div>
              <p className="text-xs font-medium text-[#EDB726]">Welcome</p>
              <p className="text-sm font-medium text-white">{user.name}</p>
            </div>
          </div>

          {/* Right Side - Transactions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Transactions Section - Same as original */}
            <div
              onClick={() => navigate("/transactions")}
              className="flex items-center space-x-1 sm:space-x-2 p-2 bg-[#EDB726] rounded-3xl border border-gray-600 hover:border-[#D4A422] transition-colors cursor-pointer"
            >
              <img
                src="/image.png"
                alt="Transaction Icon"
                className="w-8 h-8 sm:w-8 sm:h-8"
              />
              <span className="text-[10px] sm:text-xs text-[#1D1F27]">
                Your
                <p className="text-white">Transactions</p>
              </span>
            </div>

            {/* User Menu - Hidden on small screens, visible on medium and up */}
            <div className="relative md:block hidden lg:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 bg-[#1D1F27] rounded-lg border border-gray-600 hover:border-[#EDB726] transition-colors cursor-pointer"
              >
                {/* Profile Image or Avatar - Hidden on small screens */}
                <div className="w-8 h-8 bg-[#EDB726] rounded-full flex items-center justify-center hidden lg:block">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-1 border-[#EDB726] "
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
                  {/* <p className="text-xs text-gray-400">{user.phone}</p> */}
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
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
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