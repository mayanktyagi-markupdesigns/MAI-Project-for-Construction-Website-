import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { GoArrowRight } from "react-icons/go";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerUser } from "../../apiServices";
import FollowAuth from "./FollowAuth";
import axios from "axios";

export default function CreateAccountPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfrimPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [dropdownStates, setDropdownStates] = useState({
    experience: false,
    taskWish: false,
    workPreference: false,
    communication: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: "",
    projectType: "Construction",
    taskWish: "",
    workPreference: "",
    voiceCommands: "Yes",
    communication: "",
    password: "",
    confirmPassword: "",
  });

  // OTP-related state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(900);
  const otpIntervalRef = useRef(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);

  const totalSteps = 10;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDropdown = (dropdown) => {
    setDropdownStates((prev) => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  const selectOption = (field, value) => {
    handleInputChange(field, value);
    setDropdownStates((prev) => ({ ...prev, [field]: false }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const passwordStrengthValid = (pwd) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return re.test(pwd);
  };

  const projectTypes = ["Construction", "Engineering", "Design", "Other"];

  const taskOptions = [
    "Project Planning",
    "Site Management",
    "Quality Control",
    "Documentation",
    "Client Communication",
    "Budget Management",
  ];
  const workPreferences = [
    "Remote Work",
    "On-site Work",
    "Hybrid Model",
    "Flexible Schedule",
  ];
  const communicationOptions = [
    "Email Updates",
    "SMS Notifications",
    "Phone Calls",
    "In-app Messages",
    "Weekly Reports",
  ];

  const buildPayload = () => {
    const workPrefIndex =
      workPreferences.indexOf(formData.workPreference) >= 0
        ? workPreferences.indexOf(formData.workPreference) + 1
        : null;
    const communicationIndex =
      communicationOptions.indexOf(formData.communication) >= 0
        ? communicationOptions.indexOf(formData.communication) + 1
        : null;

    return {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      years_in_industry: formData.experience,
      project_types: formData.projectType,
      task_wish: formData.taskWish,
      work_preference: workPrefIndex
        ? String(workPrefIndex)
        : String(formData.workPreference || ""),
      voice_enabled: formData.voiceCommands === "Yes" ? "1" : "0",
      communication_style: communicationIndex
        ? String(communicationIndex)
        : String(formData.communication || ""),
    };
  };

  useEffect(() => {
    if (otpTimer > 0 && !otpIntervalRef.current) {
      otpIntervalRef.current = setInterval(() => {
        setOtpTimer((t) => {
          if (t <= 1) {
            clearInterval(otpIntervalRef.current);
            otpIntervalRef.current = null;
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (otpIntervalRef.current) {
        clearInterval(otpIntervalRef.current);
        otpIntervalRef.current = null;
      }
    };
  }, [otpTimer]);

  const startOtpTimer = (seconds = 900) => {
    if (otpIntervalRef.current) {
      clearInterval(otpIntervalRef.current);
      otpIntervalRef.current = null;
    }
    setOtpTimer(seconds);
  };

  const handleSendOtp = async () => {
    const email = formData.email?.trim();
    if (!email || !isValidEmail(email)) {
      Swal.fire({
        title: "Validation Error",
        text: "Please provide a valid email address before proceeding.",
        icon: "warning",
      });
      return;
    }

    setOtpLoading(true);
    try {
      const payload = { email, is_email_verify: 1 };
      const res = await axios.post(
        "https://www.markupdesigns.net/mai-beta/api/forgot-password",
        payload
      );
      setOtpSent(true);
      setOtp("");
      setOtpVerified(false);
      startOtpTimer();
      setCurrentStep(3);
      Swal.fire({
        title: "OTP Sent",
        text: res?.message || "A OTP has been sent to your email.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const msg = err?.message || JSON.stringify(err) || "Failed to send OTP.";
      Swal.fire({ title: "Error", text: msg, icon: "error" });
      console.error("Send OTP error:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const email = formData.email?.trim();
    if (!email || !isValidEmail(email)) {
      Swal.fire({
        title: "Validation Error",
        text: "Please provide a valid email address before resending.",
        icon: "warning",
      });
      return;
    }

    setOtpLoading(true);
    try {
      const payload = { email, is_email_verify: 1 };
      const res = await axios.post(
        "https://www.markupdesigns.net/mai-beta/api/forgot-password",
        payload
      );
      setOtpSent(true);
      setOtp("");
      startOtpTimer();
      Swal.fire({
        title: "OTP Resent",
        text: res?.message || "OTP resent to your email.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      const msg = err?.message || JSON.stringify(err) || "Failed to resend.";
      Swal.fire({ title: "Error", text: msg, icon: "error" });
      console.error("Resend OTP error:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = formData.email?.trim();
    const code = otp.trim();

    if (!email || !isValidEmail(email)) {
      Swal.fire({
        title: "Validation Error",
        text: "Invalid email.",
        icon: "warning",
      });
      return;
    }
    if (!/^\d{4}$/.test(code)) {
      Swal.fire({
        title: "Invalid OTP",
        text: "Please enter the 4-digit OTP sent to your email.",
        icon: "warning",
      });
      return;
    }
    if (otpTimer === 0) {
      Swal.fire({
        title: "OTP Expired",
        text: "OTP has expired. Please resend to get a new OTP.",
        icon: "warning",
      });
      return;
    }

    setOtpVerifyLoading(true);
    try {
      const payload = { email, otp: code, is_reset: "" };
      const res = await axios.post(
        "https://www.markupdesigns.net/mai-beta/api/verify-email",
        payload
      );
      setOtpVerified(true);
      Swal.fire({
        title: "Verified",
        text: res?.message || "Email verified successfully.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
      setTimeout(() => {
        setCurrentStep(4);
      }, 700);
    } catch (err) {
      const msg =
        err?.message ||
        err?.error ||
        JSON.stringify(err) ||
        "OTP verification failed.";
      Swal.fire({ title: "Verification Failed", text: msg, icon: "error" });
      console.error("Verify OTP error:", err);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const handleSubmit = async () => {
    const {
      name,
      email,
      experience,
      projectType,
      taskWish,
      workPreference,
      voiceCommands,
      communication,
      password,
      confirmPassword,
    } = formData;
    if (!otpVerified) {
      Swal.fire({
        title: "Email Not Verified",
        text: "Please verify your email before continuing.",
        icon: "warning",
      });
      return;
    }

    if (
      !(
        name &&
        email &&
        isValidEmail(email) &&
        experience &&
        projectType &&
        taskWish &&
        workPreference &&
        voiceCommands &&
        communication &&
        password &&
        confirmPassword &&
        password === confirmPassword &&
        passwordStrengthValid(password)
      )
    ) {
      let msg = "Please complete all required fields correctly.";
      if (!isValidEmail(email)) msg = "Please provide a valid email address.";
      else if (!passwordStrengthValid(password))
        msg =
          "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.";
      else if (password !== confirmPassword) msg = "Passwords do not match.";

      Swal.fire({ title: "Validation Error", text: msg, icon: "warning" });
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();
      const res = await registerUser(payload);

      if (res.message?.toLowerCase().includes("success")) {
        const userData = { name: res.user.name, email: res.user.email };
        localStorage.setItem("mai_user", JSON.stringify(userData));
        localStorage.setItem("access_token", res.access_token);

        Swal.fire({
          title: "Account Created Successfully!",
          text: res.message || "Redirecting...",
          icon: "success",
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true,
        });

        setFormData({
          name: "",
          email: "",
          experience: "",
          projectType: "Construction",
          taskWish: "",
          workPreference: "",
          voiceCommands: "Yes",
          communication: "",
          password: "",
          confirmPassword: "",
        });
        setCurrentStep(1);
        setOtp("");
        setOtpVerified(false);
        setOtpSent(false);

        setTimeout(() => navigate("/LoginPage"), 1900);
      } else {
        Swal.fire({
          title: "Error",
          text: res.message || "Registration failed.",
          icon: "error",
        });
      }
    } catch (err) {
      const msg =
        err?.message || JSON.stringify(err) || "Something went wrong.";
      Swal.fire({ title: "Registration Failed", text: msg, icon: "error" });
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  const CustomDropdown = ({
    isOpen,
    onToggle,
    selectedValue,
    placeholder,
    options,
    onSelect,
  }) => (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 border border-[#C9C9C9] rounded-full bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200 hover:border-[#312F30]"
      >
        <span
          className={`${
            selectedValue ? "text-black" : "text-gray-500"
          } bricolage-grotesque`}
        >
          {selectedValue || placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`text-gray-400 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#C9C9C9] rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`w-full px-4 py-3 text-left bricolage-grotesque hover:bg-gray-50 transition-colors duration-150 ${
                  index !== options.length - 1 ? "border-b border-gray-100" : ""
                } ${
                  selectedValue === option
                    ? "bg-[#312F30] text-white hover:bg-[#312F30]"
                    : "text-gray-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                What's your name or what would you like me to call you?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 01
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 border border-[#C9C9C9] bricolage-grotesque rounded-full focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={nextStep}
              disabled={!formData.name.trim() || loading}
              className="bg-[#312F30] text-[#FFFFFF] text-sm bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
            >
              Next Step <GoArrowRight size={14} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                What's your Email?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 02
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={(e) => {
                handleInputChange("email", e.target.value);
                setOtp("");
                setOtpSent(false);
                setOtpVerified(false);
              }}
              className="w-full px-4 py-3 border border-[#C9C9C9] bricolage-grotesque rounded-full focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200"
            />
            {!isValidEmail(formData.email) && formData.email.length > 0 && (
              <p className="text-xs text-red-500">
                Please enter a valid email (example@domain.com).
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={handleSendOtp}
                disabled={
                  !isValidEmail(formData.email) || loading || otpLoading
                }
                className="bg-[#312F30] text-[#FFFFFF] text-sm bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                {otpLoading ? "Sending OTP..." : "Send OTP & Next"}
                <GoArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                Verify your Email (OTP)
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 03
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>

            <p className="text-sm text-gray-700">
              We sent an OTP to <strong>{formData.email}</strong>
            </p>

            {/* OTP Input */}
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setOtp(val);
                }}
                className="w-full px-4 py-3 border border-[#C9C9C9] bricolage-grotesque rounded-full focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200"
              />

              {/* Resend OTP */}
              <p className="text-center text-[#A9A9A9] text-xs mt-3 sm:mt-4">
                Didn’t receive the email?{" "}
                <span
                  onClick={handleResendOtp}
                  className={`cursor-pointer text-xs font-semibold underline text-[#312F30] ${
                    otpLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {otpLoading ? "Resending..." : "Click to resend"}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={prevStep}
                className="w-full sm:w-auto border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={
                  otpVerifyLoading || !/^\d{4}$/.test(otp) || otpTimer === 0
                }
                className="w-full sm:w-auto bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                {otpVerifyLoading ? "Verifying..." : "Verify OTP"}
                <GoArrowRight size={16} />
              </button>
            </div>

            {/* Status messages */}
            {otpTimer === 0 && (
              <p className="text-xs text-red-500 text-center">
                OTP expired. Please resend to get a new OTP.
              </p>
            )}

            {otpVerified && (
              <p className="text-xs text-green-600 text-center">
                Email verified — you may continue.
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                How many years have you been in your industry?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 04
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>
            <input
              type="text"
              placeholder="Enter your experience (e.g., 3 years)"
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              className="w-full px-4 py-3 border border-[#C9C9C9] bricolage-grotesque rounded-full focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200"
            />
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.experience || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                Next Step <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                What type of projects do you typically manage?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 05
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleInputChange("projectType", type)}
                  className={`px-6 py-3 text-sm rounded-full border transition-all duration-200 ${
                    formData.projectType === type
                      ? "bg-[#312F30] text-white bricolage-grotesque border-[#312F30] shadow-md"
                      : "bg-white text-gray-700 bricolage-grotesque border-gray-300 hover:border-[#312F30] hover:shadow-sm"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.projectType || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                Next Step <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                What's one task you wish someone else would handle?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 06
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>

            <CustomDropdown
              isOpen={dropdownStates.taskWish}
              onToggle={() => toggleDropdown("taskWish")}
              selectedValue={formData.taskWish}
              placeholder="Select Your Option"
              options={taskOptions}
              onSelect={(option) => selectOption("taskWish", option)}
            />

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.taskWish || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                Next Step <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                How do you prefer to work <br /> with MAi?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 07
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>

            <CustomDropdown
              isOpen={dropdownStates.workPreference}
              onToggle={() => toggleDropdown("workPreference")}
              selectedValue={formData.workPreference}
              placeholder="Select Your Option"
              options={workPreferences}
              onSelect={(option) => selectOption("workPreference", option)}
            />

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.workPreference || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                Next Step <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                Would you like voice commands enabled?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 08
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              {["Yes", "No"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange("voiceCommands", option)}
                  className={`px-8 py-3 rounded-full border transition-all duration-200 bricolage-grotesque ${
                    formData.voiceCommands === option
                      ? "bg-[#312F30] text-white border-[#312F30] shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#312F30] hover:shadow-sm"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.voiceCommands || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                Next Step <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                How would you like me to communicate?
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 09
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>

            <CustomDropdown
              isOpen={dropdownStates.communication}
              onToggle={() => toggleDropdown("communication")}
              selectedValue={formData.communication}
              placeholder="Select Your Option"
              options={communicationOptions}
              onSelect={(option) => selectOption("communication", option)}
            />

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.communication || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                Next Step <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 10:
        const pwd = formData.password;
        const pwdValid = passwordStrengthValid(pwd);
        const pwdMatch = formData.password === formData.confirmPassword;

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl bricolage-grotesque font-bold text-[#000000] mb-2">
                Create a password
              </h2>
              <p className="text-xs font-semibold text-[#000000]">
                Step: 10
                <span className="text-xs font-semibold text-[#A9A9A9]">
                  /{String(totalSteps).padStart(2, "0")}
                </span>
              </p>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 bricolage-grotesque rounded-full focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfrimPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 bricolage-grotesque rounded-full focus:outline-none focus:ring-2 focus:ring-[#312F30] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfrimPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showConfrimPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="text-sm space-y-1">
              {pwd.length > 0 && (
                <p
                  className={`text-xs transition-colors duration-200 ${
                    pwdValid ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {pwdValid ? "✓ Strong password" : "✗ Weak password"}
                </p>
              )}

              {formData.confirmPassword.length > 0 && (
                <p
                  className={`text-xs transition-colors duration-200 ${
                    pwdMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {pwdMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="border border-gray-300 bricolage-grotesque text-gray-700 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft size={16} /> Step Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!(pwdValid && pwdMatch) || loading}
                className="bg-[#312F30] text-white bricolage-grotesque px-6 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a474a] transition-colors duration-200"
              >
                {loading ? "Signing up..." : "Sign Up"}{" "}
                <GoArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* small watermark top-left */}
      <img
        src="/mai-web/assets/About/Watermark.png"
        alt=""
        aria-hidden="true"
        className="absolute top-40 center-4 w-40 sm:w-24 md:w-96 pointer-events-none select-none opacity-80"
        style={{ filter: "brightness(90%)" }}
      />

      <div className="w-full p-6 sm:p-10">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <Link to="/">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 overflow-hidden">
                <img
                  src="/mai-web/assets/home/logo.png"
                  alt="Logo"
                  className="w-22 h-22 object-cover"
                />
              </div>
            </Link>
          </div>

          {/* Form content */}
          {renderStep()}
        </div>
      </div>
      <FollowAuth />
    </div>
  );
}
