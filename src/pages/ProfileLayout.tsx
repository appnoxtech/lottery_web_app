import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  LogOut,
  ChevronRight,
  Lock,
  DollarSign,
  FileText,
  Shield,
  Gavel,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";

const ProfileLayout: React.FC = () => {
  const userData = useSelector((state: any) => state.user.userData);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"logout" | "delete" | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  const profileMenuItems = [
    {
      id: "edit-profile",
      label: "Edit Profile",
      icon: User,
      path: "/profile/edit",
    },
    {
      id: "change-password",
      label: "Change Password",
      icon: Lock,
      path: "/profile/password",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: DollarSign,
      path: "/profile/transactions",
    },
    {
      id: "terms-conditions",
      label: "Terms & Conditions",
      icon: FileText,
      path: "/profile/terms",
    },
    {
      id: "privacy-policy",
      label: "Privacy Policy",
      icon: Shield,
      path: "/profile/privacy",
    },
    {
      id: "lottery-rules",
      label: "Lottery Rules",
      icon: Gavel,
      path: "/profile/rules",
    },
  ];

  const handleDeleteAccount = () => {
    setModalType("delete");
    setShowModal(true);
  };

  const handleLogoutClick = () => {
    setModalType("logout");
    setShowModal(true);
  };

  const handleConfirmModal = () => {
    if (modalType === "logout") {
      handleLogout(); // Will also close modal via redirect
    } else if (modalType === "delete") {
      console.log("Deleting account...");
      // TODO: Implement delete API call here
    }
    setShowModal(false);
    setModalType(null);
  };

  // const cancelDeleteAccount = () => {
  //   setShowModal(false);
  //   setModalType(null);
  // };

  // Determine if we should show the profile options or the content
  const showProfileOptions = location.pathname === "/profile";

  const layoutContent = isLargeScreen ? (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      {/* Left Column: Profile Sidebar */}
      <div className="w-64 bg-[#2A2D36] border-r border-gray-700 flex-shrink-0 flex flex-col">
        {/* Back Button */}
        <div className="p-4 border-b border-gray-700">
          <Link
            to="/home"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Link>
        </div>

        {/* Profile Info and Logo */}
        <div className="flex flex-col items-center p-6 border-b border-gray-700">
          {/* <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-1">Wega di Number</h1>
              <p className="text-lg font-light text-[#EDB726] tracking-widest">online</p>
            </div> */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mb-3">
            {userData?.profile_image ? (
              <img
                src={userData.profile_image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-[#EDB726]">
            {userData?.name || "User"}
          </h2>
          <p className="text-sm text-gray-400">{userData?.phone_number}</p>
        </div>

        {/* Profile Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {profileMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        transition-all duration-200 text-left
                        ${
                          isActive
                            ? "bg-[#EDB726] text-[#1D1F27] font-semibold"
                            : "text-gray-300 hover:bg-[#3A3D46] hover:text-white"
                        }
                      `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-red-500 hover:bg-[#3A3D46] hover:text-red-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button in Profile Sidebar */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            onClick={handleLogoutClick}
            className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-3 px-6 rounded-lg hover:bg-[#d4a422] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Right Column: Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-[#2A2D36] border-b border-gray-700 p-4">
          <h1 className="text-xl font-bold text-white">Profile Settings</h1>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-[#1D1F27] text-white flex flex-col">
      {showProfileOptions ? (
        <div className="flex-1 flex flex-col">
          {/* Back Button for Profile Options Page */}
          <div className="p-4 border-b border-gray-700 flex justify-start w-full">
            <Link
              to="/home"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Link>
          </div>

          {/* Profile Info and Logo */}
          <div className="flex flex-col items-center p-6 border-b border-gray-700">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-1">
                Wega di Number
              </h1>
              <p className="text-lg font-light text-[#EDB726] tracking-widest">
                online
              </p>
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mb-3">
              {userData?.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-[#EDB726]">
              {userData?.name || "User"}
            </h2>
            <p className="text-sm text-gray-400">{userData?.phone_number}</p>
          </div>

          {/* Profile Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {profileMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        transition-all duration-200 text-left
                        ${
                          isActive
                            ? "bg-[#EDB726] text-[#1D1F27] font-semibold"
                            : "text-gray-300 hover:bg-[#3A3D46] hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-red-500 hover:bg-[#3A3D46] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </li>
            </ul>
          </nav>

          {/* Logout Button in Profile Sidebar */}
          <div className="p-4 border-t border-gray-700 mt-auto">
            <button
              onClick={handleLogoutClick}
              className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-3 px-6 rounded-lg hover:bg-[#d4a422] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Header for sub-pages on small screen */}
          <header className="bg-[#2A2D36] border-b border-gray-700 p-4 flex items-center">
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-300 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">Back</h1>{" "}
            {/* Dynamic title could be added here */}
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      )}
    </div>
  );

  // Render for large screens (two-column layout)

  return (
    <>
      {layoutContent}

      {showModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center
      ${
        modalType === "logout" ? "bg-black bg-black/80" : "bg-black bg-black/80"
      }
    `}
        >
          <div className="bg-[#1D1F27] text-white rounded-lg shadow-lg p-6 w-11/12 max-w-sm border border-[#EDB726]">
            <p className="text-lg text-center mb-6">
              {modalType === "logout"
                ? "Do you really want to Logout?"
                : "Do you really want to Delete your Account?"}
            </p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-white text-white hover:bg-gray-700 transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleConfirmModal}
                className="flex-1 py-2 rounded-lg bg-[#EDB726] text-[#1D1F27] font-semibold hover:bg-[#d4a422] transition-colors cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileLayout;
