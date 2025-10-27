import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { forgotPassword, verifyEmailOtp } from "./../../apiServices";
import FollowAuth from "./FollowAuth";

export default function PasswordResetPageotp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email || loadingResend) return;
    setLoadingResend(true);
    try {
      const res = await forgotPassword(email);
      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "OTP Resent!",
          text: `New OTP: ${res.otp}`,
          timer: 3000,
          showConfirmButton: false,
          confirmButtonColor: "#312F30",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: res?.message || "Unable to resend OTP.",
          confirmButtonColor: "#312F30",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err?.message || "Unable to resend OTP.",
        confirmButtonColor: "#312F30",
      });
    } finally {
      setLoadingResend(false);
    }
  };

  // Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingVerify) return;

    const otpString = otp.join("");
    if (otpString.length < 4) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "Please enter the 4-digit OTP",
        confirmButtonColor: "#312F30",
      });
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await verifyEmailOtp({
        email,
        otp: otpString,
        is_reset: "1",
      });

      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "Email Verified!",
          text: "OTP verified successfully.",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#312F30",
        });

        setTimeout(() => {
          navigate("/PasswordResetPage", { state: { email } });
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "OTP verification failed.",
          confirmButtonColor: "#312F30",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err?.message || "Something went wrong.",
        confirmButtonColor: "#312F30",
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className="min-h-screen flex p-8">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 relative bg-white overflow-hidden">
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
          <h1 className="text-3xl text-[#312F30] bricolage-grotesque font-semibold tracking-wide">
            Password Reset
          </h1>
          <p className="text-[#A9A9A9] bricolage-grotesque mt-1 text-center">
            We have sent a code to <b>{email}</b>
          </p>
        </div>

        {/* OTP Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mt-6 relative z-10"
        >
          <div className="flex justify-center gap-4 mb-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-12 text-center text-lg border rounded-md text-[#C9C9C9] outline-none"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loadingVerify}
            className="w-full bg-[#312F30] mt-4 cursor-pointer text-xs bricolage-grotesque text-[#FFFFFF] py-3 rounded-full shadow-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loadingVerify ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Resend OTP */}
          <p className="text-center text-[#A9A9A9] text-xs mt-6 mb-3">
            Didn't receive the email?{" "}
            <span
              onClick={handleResend}
              className={`cursor-pointer text-xs font-semibold underline text-[#312F30] ${
                loadingResend ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {loadingResend ? "Resending..." : "Click to resend"}
            </span>
          </p>

          {/* Back to login */}
          <p className="text-center text-sm mt-6 text-[#312F30]">
            <Link
              to="/LoginPage"
              className="flex items-center justify-center gap-1 font-semibold underline"
            >
              ← Back to login
            </Link>
          </p>
        </form>
      </div>
      <FollowAuth/>
    </div>
  );
}
