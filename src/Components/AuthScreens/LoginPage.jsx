// LoginPage.jsx
import React, { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ProfileContext } from "../../Contexts/ProfileContext";
import { loginUser } from "../../apiServices";
import FollowAuth from "./FollowAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setProfile, setToken } = useContext(ProfileContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!(formData.email && formData.password)) {
      Swal.fire({
        title: "Error!",
        text: "Please enter email and password.",
        icon: "error",
        confirmButtonText: "OK",
        width: "400px",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(formData);

      if (res.success) {
        setProfile(res.user);
        setToken(res.access_token);

        const expiresAt = new Date(res.expires_at).getTime();
        localStorage.setItem("expires_at", expiresAt);

        Swal.fire({
          title: "Login Successful!",
          text: "Redirecting to dashboard...",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          width: "400px",
        });

        setTimeout(() => navigate("/DashHome"), 2200);
      } else {
        Swal.fire({
          title: "Login Failed",
          text: res.message || "Invalid credentials. Please try again.",
          icon: "error",
          width: "420px",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        title: "Login Failed",
        text: "Something went wrong. Please try again.",
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
            BUILT FOR WORK
          </h1>
          <p className="text-[#A9A9A9] bricolage-grotesque text-xs sm:text-sm mt-1">
            Enter your login info to use Mai
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="w-full">
          <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
            Email ID*
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none mb-4"
          />

          <label className="block text-xs font-medium text-[#000000] mb-1">
            Password*
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Your Password"
              className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none mb-2"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-[#C9C9C9]"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-xs text-[#C9C9C9]">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <Link
              to="/ForgetPassword"
              className="text-xs text-[#FF0000] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 text-xs bg-[#312F30] cursor-pointer text-white py-3 rounded-full shadow-md hover:bg-gray-800 transition"
          >
            {loading ? "Please wait..." : "Continue"}
          </button>

          <p className="text-center text-xs mt-4 text-[#C9C9C9]">
            Don’t have an account?{" "}
            <Link
              to="/CreateAccountPage"
              className="font-semibold text-[#000000] underline"
            >
              Create Account
            </Link>
          </p>
        </form>
      </div>

      <FollowAuth />
    </div>
  );
}
