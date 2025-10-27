// PasswordResetPage.jsx
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { resetPassword } from "../../apiServices";
import FollowAuth from "./FollowAuth";

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Get email automatically (from state, query, or localStorage)
  useEffect(() => {
    const emailFromState = location?.state?.email;
    const params = new URLSearchParams(location.search || "");
    const emailFromQuery = params.get("email");
    const emailFromStorage = localStorage.getItem("forgot_email") || null;

    const email = emailFromState || emailFromQuery || emailFromStorage;
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { email, password, password_confirmation } = formData;

    if (!email) {
      Swal.fire({
        title: "Error!",
        text: "Email missing — please go through the Forgot Password page.",
        icon: "error",
        width: "400px",
      });
      return;
    }

    if (!password || !password_confirmation) {
      Swal.fire({
        title: "Error!",
        text: "Please fill in both password fields.",
        icon: "error",
        width: "400px",
      });
      return;
    }

    if (password !== password_confirmation) {
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match.",
        icon: "error",
        width: "400px",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { email, password, password_confirmation };
      const res = await resetPassword(payload);

      if (res.success) {
        Swal.fire({
          title: "Password Reset Successful!",
          text: "You can now login with your new password.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          width: "400px",
        });

        localStorage.removeItem("forgot_email");
        setTimeout(() => navigate("/LoginPage"), 2200);
      } else {
        Swal.fire({
          title: "Failed!",
          text: res.message || "Unable to reset password. Try again later.",
          icon: "error",
          width: "420px",
        });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      Swal.fire({
        title: "Error!",
        text: err?.message || "Something went wrong. Please try again.",
        icon: "error",
        width: "400px",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-10 relative">
        {/* Logo and heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 overflow-hidden">
              <img
                src="/mai-web/assets/home/logo.png"
                alt="Logo"
                className="w-22 h-22 object-cover"
              />
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl bricolage-grotesque text-[#312F30] font-medium tracking-wide">
            Reset Your Password
          </h1>
          <p className="text-[#A9A9A9] bricolage-grotesque text-xs sm:text-sm mt-1">
            Enter your new password to reset
          </p>
        </div>

        {/* Hidden email input (not visible to user) */}
        <input
          type="hidden"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Password fields */}
        <form onSubmit={(e) => e.preventDefault()} className="w-full">
          {/* New Password */}
          <label className="block text-xs font-medium text-[#000000] mb-1">
            New Password*
          </label>
          <div className="relative mb-4">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter New Password"
              className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-[#C9C9C9]"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          {/* Confirm Password */}
          <label className="block text-xs font-medium text-[#000000] mb-1">
            Confirm Password*
          </label>
          <div className="relative">
            <input
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm New Password"
              className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-[#C9C9C9]"
              onClick={() => setShowConfirmPassword((s) => !s)}
            >
              {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 text-xs bg-[#312F30] cursor-pointer text-white py-3 rounded-full shadow-md hover:bg-gray-800 transition"
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>

          <p className="text-center text-xs mt-4 text-[#C9C9C9]">
            Remember your password?{" "}
            <Link to="/LoginPage" className="font-semibold text-[#000000] underline">
              Go to Login
            </Link>
          </p>
        </form>
      </div>

      <FollowAuth />
    </div>
  );
}
