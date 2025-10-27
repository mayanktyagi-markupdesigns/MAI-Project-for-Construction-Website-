import React, { useContext, useState, useRef, useEffect } from "react";
import {  User, LogOut, Folder, BarChart2 } from "lucide-react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ProfileContext } from "../../Contexts/ProfileContext";
import { useNavigate } from "react-router-dom";

const TopNav = ({ activeSection, setActiveSection }) => {
  const { profile } = useContext(ProfileContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileDropdown]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("mai_token");
    localStorage.removeItem("mai_user");
    localStorage.removeItem("projectsData");
    localStorage.removeItem("sidebarOpenMenus");
    navigate("/LoginPage");
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const initials = getInitials(profile?.name);

  return (
    <>
      {showProfileDropdown && (
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

      <div className="flex items-center bricolage-grotesque justify-between bg-[#DCDCDC] h-14 mb-4 relative z-40">
        <div className="w-24"></div>

        {/* Top Nav Buttons */}
        <nav className="flex space-x-6">
          {["projects", "tasks", "Message", "Directory"].map((it) => (
            <button
              key={it}
              onClick={() => setActiveSection(it)}
              className={`text-sm font-medium pb-1 ${
                activeSection === it
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {it.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="flex items-center mr-3.5 space-x-1 relative">
          <button
            className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={() => setActiveSection("projects")}
          >
            <IoIosAddCircleOutline className="w-6 h-5" />
          </button>

          {/* Profile Avatar */}
          <button
            ref={profileButtonRef}
            onClick={toggleProfileDropdown}
            className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors relative"
          >
            <span className="text-white text-sm font-medium">{initials}</span>
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0  top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              {/* Profile Header */}
              <div className="px-4 py-3  border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1  min-w-0">
                    <p className="text-sm cursor-pointer font-medium text-gray-900 truncate">
                      {profile?.name || "User"}
                    </p>
                    <p className="text-sm  text-gray-500 truncate">
                      {profile?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dashboard */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveSection("DashBorad");
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 border-b border-gray-100 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <User className="w-4 h-4" />
                  <span>View Dashboard</span>
                </button>
              </div>

              {/* Projects */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveSection("projects");
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 border-b border-gray-100 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Folder className="w-4 h-4" />
                  <span>View Projects</span>
                </button>
              </div>

              {/* Reports */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveSection("reports");
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>View Report</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopNav;
