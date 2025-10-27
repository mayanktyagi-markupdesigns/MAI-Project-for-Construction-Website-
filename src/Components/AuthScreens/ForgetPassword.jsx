import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { forgotPassword } from "../../apiServices";
import FollowAuth from "./FollowAuth";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "OTP Sent!",
          confirmButtonColor: "#312F30",
          timer: 3000,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate("/PasswordResetPageotp", {
            state: { email, otp: res.otp },
          });
        }, 2900);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: res?.message || "Something went wrong, please try again.",
          confirmButtonColor: "#312F30",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err?.message || "Failed to send reset link. Try again later.",
        confirmButtonColor: "#312F30",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex p-8">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 relative bg-white overflow-hidden">
        {/* Watermark */}
        {/* <img
        src="/mai-web/assets/login/login.png"
        alt=""
        aria-hidden="true"
        className="absolute top-4 left-4 w-40 sm:w-24 md:w-96 pointer-events-none select-none opacity-80"
        style={{ filter: "brightness(110%)" }}
      /> */}
      
        {/* Logo + Heading */}
        <div className="flex flex-col items-center relative z-10">
          <Link to="/">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 overflow-hidden">
              <img
                src="/mai-web/assets/home/logo.png"
                alt="Logo"
                className="w-22 h-22 object-cover"
              />
            </div>
          </Link>

          <h1 className="text-3xl bricolage-grotesque font-semibold tracking-wide whitespace-nowrap text-center">
            Forget Password
          </h1>

          <p className="text-gray-500 mt-1 bricolage-grotesque text-center text-sm">
            Enter your email.
          </p>
        </div>

        {/* Email Field Only */}
        <div className="w-full max-w-sm mt-6 relative z-10">
          <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
            Email*
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email"
            className="w-full px-4 py-3 text-xs bricolage-grotesque border rounded-full border-[#C9C9C9] outline-none"
          />
        </div>

        {/* Form Actions */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mt-6 relative z-10"
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#312F30] cursor-pointer text-xs bricolage-grotesque text-[#FFFFFF] py-3 rounded-full shadow-md hover:bg-gray-800 transition"
          >
            {loading ? "Reseting..." : "Reset Password"}
          </button>

          <p className="text-center text-sm mt-6 text-[#312F30]">
            <Link
              to="/PasswordResetPage"
              className="flex items-center justify-center gap-1 font-semibold underline"
            >
              ← Back to login
            </Link>
          </p>
        </form>
      </div>
      <FollowAuth />
    </div>
  );
}
