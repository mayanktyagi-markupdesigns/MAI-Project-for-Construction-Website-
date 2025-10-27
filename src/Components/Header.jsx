import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CgProfile } from "react-icons/cg";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("mai_token");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignInClick = () => {
    if (token) {
      navigate("/DashHome");
    } else {
      navigate("/LoginPage");
    }
  };

  return (
    <header className="w-full hide-scrollbar bg-white md:shadow-none shadow-md sticky top-0 z-50 md:pt-4">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between md:mt-2">
        {/* Left: Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 md:w-12  md:h-12  rounded-full overflow-hidden bg-black flex items-center justify-center">
            <img
              src="/mai-web/assets/home/logo.png"
              alt="Logo"
              className="w-16 h-16 object-cover "
            />
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex bricolage-grotesque items-center gap-8 md:ml-[120px]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-black" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/aboutHomme"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-black" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            About MAi
          </NavLink>

          <NavLink
            to="/BlogHome"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-black" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Blog
          </NavLink>

          <NavLink
            to="/GetTouch"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-black" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Contact Us
          </NavLink>
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleSignInClick}
            className="inline-flex items-center cursor-pointer px-6 py-2 rounded-full bg-gray-800 text-white text-xs shadow-sm hover:opacity-95"
          >
            {token ? "Go to Dashboard" : "Sign In"}
          </button>
        </div>

        {/* Mobile Right Icons */}
        <div className="flex md:hidden items-center gap-3">
          {/* Menu Icon */}
          <button
            className="p-2 text-gray-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* User Profile Icon */}
          <button onClick={handleSignInClick} className="p-2 text-gray-800">
            <CgProfile size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer - Sliding from Right */}
      <div
        className={`fixed top-0 right-0 h-full w-[65%] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src="/mai-web/assets/home/logo.png"
                  alt="Logo"
                  className="w-10 h-10 object-cover"
                />
              </div>
              <span className="font-semibold text-gray-800">MAi</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={22} className="text-gray-600" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-4 py-6">
            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/aboutHomme"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              About MAi
            </NavLink>

            <NavLink
              to="/BlogHome"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Blog
            </NavLink>

            <NavLink
              to="/GetTouch"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Contact Us
            </NavLink>
          </nav>

   
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}
