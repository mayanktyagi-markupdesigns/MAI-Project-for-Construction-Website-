import React, { useState, useContext } from "react";
import { Facebook, Instagram, Twitter, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { earlyAccessSignup } from "../../apiServices";
import { ProfileContext } from "../../Contexts/ProfileContext";

const MaiEarlyAccessForm = () => {
  const navigate = useNavigate();
  const { setProfile, setToken } = useContext(ProfileContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    companyRole: "",
    email: "",
    yearsInConstruction: "",
    password: "",
    confirmPassword: "",
    usageOptions: [],
    experiencePoints: {
      projectManagement: "",
      schedulingPlanning: "",
      estimatingBudgeting: "",
      procurementMaterial: "",
      communicationCollaboration: "",
      qualitySafety: "",
    },
  });

  const [errors, setErrors] = useState({});

  const usageOptionsData = [
    "Submittals",
    "Estimating",
    "Project Management",
    "Scheduling",
    "Closeout",
    "Document Management",
    "Reporting & Compliance",
    "Data Analysis",
    "Cost Control & Tracking",
    "Other",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // clear field error as user types
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleUsageOptionChange = (option) => {
    setFormData((prev) => ({
      ...prev,
      usageOptions: prev.usageOptions.includes(option)
        ? prev.usageOptions.filter((item) => item !== option)
        : [...prev.usageOptions, option],
    }));
    setErrors((prev) => ({ ...prev, usageOptions: "" }));
  };

  const handleExperienceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      experiencePoints: { ...prev.experiencePoints, [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const nextStep = () => {
    // validate current step before moving
    const ok = validateStep(currentStep);
    if (ok) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const normalizeUsageOption = (option) => {
    const map = {
      Submittals: "submittals",
      Estimating: "estimating",
      "Project Management": "project_management",
      Scheduling: "scheduling",
      Closeout: "closeout",
      "Document Management": "document_management",
      "Reporting & Compliance": "reporting_compliance",
      "Data Analysis": "data_analysis",
      "Cost Control & Tracking": "cost_control_tracking",
      Other: "other",
    };
    if (map[option]) return map[option];
    return option.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  };

  const mapExperienceToFlag = (val) => {
    if (!val) return "0";
    if (val === "beginner") return "1";
    return "0";
  };

  // validation helper
  const validateStep = (step) => {
    const newErrors = { ...errors };
    let valid = true;

    if (step === 1) {
      // clear step1 related errors
      [
        "firstName",
        "companyRole",
        "email",
        "yearsInConstruction",
        "password",
        "confirmPassword",
      ].forEach((k) => (newErrors[k] = ""));

      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
        valid = false;
      }

      if (!formData.companyRole?.trim()) {
        newErrors.companyRole = "Company / Role is required";
        valid = false;
      }

      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
        valid = false;
      } else {
        // simple email regex
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(formData.email)) {
          newErrors.email = "Enter a valid email";
          valid = false;
        }
      }

      if (!formData.yearsInConstruction) {
        newErrors.yearsInConstruction = "Please select years of experience";
        valid = false;
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
        valid = false;
      } else if (formData.password.length < 6) {
        // adjust policy as needed
        newErrors.password = "Password must be at least 6 characters";
        valid = false;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        valid = false;
      } else if (
        formData.password &&
        formData.password !== formData.confirmPassword
      ) {
        newErrors.confirmPassword = "Passwords do not match";
        valid = false;
      }
    }

    if (step === 2) {
      newErrors.usageOptions = "";

      if (!formData.usageOptions || formData.usageOptions.length === 0) {
        newErrors.usageOptions = "Select at least one usage option";
        valid = false;
      }
    }

    if (step === 3) {
      // validate experience selects
      const xp = formData.experiencePoints;
      [
        "projectManagement",
        "schedulingPlanning",
        "estimatingBudgeting",
        "procurementMaterial",
        "communicationCollaboration",
        "qualitySafety",
      ].forEach((key) => {
        newErrors[key] = "";
        if (!xp[key]) {
          newErrors[key] = "Please select Yes or No";
          valid = false;
        }
      });
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    // run validation for all steps
    const ok1 = validateStep(1);
    const ok2 = validateStep(2);
    const ok3 = validateStep(3);
    if (!ok1) setCurrentStep(1);
    else if (!ok2) setCurrentStep(2);
    else if (!ok3) setCurrentStep(3);

    if (!(ok1 && ok2 && ok3)) return;

    setLoading(true);

    const payload = {
      name: formData.firstName,
      company_name: formData.companyRole,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      years_in_construction: formData.yearsInConstruction,
      usage_plans: formData.usageOptions.map((opt) =>
        normalizeUsageOption(opt)
      ),
      project_management: mapExperienceToFlag(
        formData.experiencePoints.projectManagement
      ),
      scheduling_planning: mapExperienceToFlag(
        formData.experiencePoints.schedulingPlanning
      ),
      estimating_budgeting: mapExperienceToFlag(
        formData.experiencePoints.estimatingBudgeting
      ),
      procurement_material: mapExperienceToFlag(
        formData.experiencePoints.procurementMaterial
      ),
      communication_collaboration: mapExperienceToFlag(
        formData.experiencePoints.communicationCollaboration
      ),
      quality_safety: mapExperienceToFlag(
        formData.experiencePoints.qualitySafety
      ),
    };

    try {
      const res = await earlyAccessSignup(payload);

      if (res && res.data) {
        const profileFromServer = {
          name: res.data.name || formData.firstName,
          email: res.data.email || formData.email,
        };
        setProfile(profileFromServer);

        if (res.data.token) {
          setToken(res.data.token);
        }

        try {
          localStorage.setItem("mai_user", JSON.stringify(profileFromServer));
          if (res.data.token) localStorage.setItem("mai_token", res.data.token);
        } catch (e) {}
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "You have successfully joined MAi Early Access.",
        timer: 1400,
        showConfirmButton: false,
      });

      setShowThankYou(true);

      setTimeout(() => {
        navigate("/DashHome");
      }, 4000);
    } catch (err) {
      const errMsg =
        (err && (err.message || JSON.stringify(err))) || "Something went wrong";
      Swal.fire({ icon: "error", title: "Submission failed", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="flex items-center justify-center ">
        <div className="rounded-3xl max-w-5xl w-full ">
          <div className="text-center p-2">
            <h1 className="text-3xl font-bold bricolage-grotesque text-[#312F30] mb-4">
              THANK YOU FOR JOINING
            </h1>
            <p className="text-[#312F30] bricolage-grotesque">
              You're now part of our{" "}
              <span className="font-semibold bricolage-grotesque underline">
                Early Access program
              </span>{" "}
              giving you a head start
            </p>
            <p className="text-[#312F30] bricolage-grotesque mb-8">
              with the world's first AI-powered project manager.
            </p>

            <h2 className="text-2xl font-bold bricolage-grotesque text-[#312F30] mb-8">
              Over the next few weeks, you'll receive
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="border-2 border-[#B7B7B7] rounded-2xl flex items-center p-4 h-32 w-full">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 mr-4">
                  <img
                    src="/mai-web/assets/login/Early.png"
                    alt="Updates"
                    className="w-6 h-6"
                  />
                </div>
                <p className="font-semibold text-[#000000] text-left">
                  Updates on your <br /> Early Access status
                </p>
              </div>

              <div className="border-2 border-[#B7B7B7] rounded-2xl flex items-center p-4 h-32 w-full">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 mr-4">
                  <img
                    src="/mai-web/assets/login/Early.png"
                    alt="Invites"
                    className="w-6 h-6"
                  />
                </div>
                <p className="font-semibold text-[#000000] text-left">
                  Invitations to test <br /> MAi's features
                </p>
              </div>

              <div className="border-2 border-[#B7B7B7] rounded-2xl flex items-center p-4 h-32 w-full">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 mr-4">
                  <img
                    src="/mai-web/assets/login/Early.png"
                    alt="Feedback"
                    className="w-6 h-6"
                  />
                </div>
                <p className="font-semibold bricolage-grotesque text-[#312F30] text-left">
                  Request to share feedback <br /> and influence how MAi grows
                </p>
              </div>
            </div>

            <p className="text-lg font-bold text-[#312F30] mb-6">
              Excited to be part of MAi Early Access? Share it with your
              network:
            </p>

            <div className="flex justify-center gap-4">
              <div className="w-8 h-8 bg-[#312F30] rounded-full flex items-center justify-center">
                <Facebook className="text-white" size={20} />
              </div>
              <div className="w-8 h-8 bg-[#312F30] rounded-full flex items-center justify-center">
                <Instagram className="text-white" size={20} />
              </div>
              <div className="w-8 h-8 bg-[#312F30] rounded-full flex items-center justify-center">
                <Twitter className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bricolage-grotesque text-[#A9A9A9]">
              {" "}
              Welcome To{" "}
            </span>
            <span className="bricolage-grotesque text-[#312F30]">MAi</span>
            <span className="bricolage-grotesque text-[#A9A9A9]">
              {" "}
              Early Access
            </span>
          </h1>
          <p className="text-[#312F30] bricolage-grotesque text-lg ">
            You're one of the first to get a head start  with the world's first
            AI-powered
            <br />
         
            project manager for public construction
          </p>
        </div>

        <div className="border border-[#C4C4C4] mb-4"></div>

        {currentStep === 1 && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#312F30] bricolage-grotesque">
                Basic Info
              </h2>
              <span className="text-[#A9A9A9] bricolage-grotesque">
                Step 01/03
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-2">
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                    errors.firstName ? "border-red-400" : "border-[#C9C9C9]"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Company / Role*
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Company Name"
                  value={formData.companyRole}
                  onChange={(e) =>
                    handleInputChange("companyRole", e.target.value)
                  }
                  className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                    errors.companyRole ? "border-red-400" : "border-[#C9C9C9]"
                  }`}
                />
                {errors.companyRole && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.companyRole}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                    errors.email ? "border-red-400" : "border-[#C9C9C9]"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Number of years in construction*
                </label>
                <div className="relative">
                  <select
                    value={formData.yearsInConstruction}
                    onChange={(e) =>
                      handleInputChange("yearsInConstruction", e.target.value)
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.yearsInConstruction
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="0-2">0-2 years</option>
                    <option value="2-4">2-4 years</option>
                    <option value="4-6">4-6 years</option>
                    <option value="6-12">6-12 years</option>
                  </select>
                </div>
                {errors.yearsInConstruction && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.yearsInConstruction}
                  </p>
                )}
              </div>

              {/* Password field with eye icon */}
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Password*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Your Password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 text-sm border rounded-full outline-none mb-1 ${
                      errors.password ? "border-red-400" : "border-[#C9C9C9]"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-3 text-[#C9C9C9] flex items-center"
                  >
                    {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm password field with eye icon */}
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 text-sm border rounded-full outline-none mb-1 ${
                      errors.confirmPassword
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute inset-y-0 right-3 text-[#C9C9C9]  flex items-center"
                  >
                    {showConfirmPassword ? (
                      <Eye size={15} />
                    ) : (
                      <EyeOff size={15} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <button
                onClick={nextStep}
                className="bg-[#312F30] text-white px-12 py-3 rounded-full  bricolage-grotesque transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* remaining steps unchanged... */}
        {currentStep === 2 && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#312F30] bricolage-grotesque">
                How do you plan to use MAi?
              </h2>
              <span className="text-[#A9A9A9]">Step 02/03</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              {usageOptionsData.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.usageOptions.includes(option)}
                    onChange={() => handleUsageOptionChange(option)}
                    className="w-3 h-3  rounded border-2 border-[#A9A9A9]"
                  />
                  <span className="text-[#000000] bricolage-grotesque text-xs">
                    {option}
                  </span>
                </label>
              ))}
            </div>
            {errors.usageOptions && (
              <p className="text-red-500 text-xs mt-1 mb-3">
                {errors.usageOptions}
              </p>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={prevStep}
                className="bg-[#A9A9A9] text-white bricolage-grotesque px-8 py-2.5 rounded-full"
              >
                Step Back
              </button>
              <button
                onClick={nextStep}
                className="bg-[#312F30] text-white bricolage-grotesque px-12 py-2.5 rounded-full"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#312F30] bricolage-grotesque">
                Experience & Pain Points
              </h2>
              <span className="text-[#A9A9A9]">Step 03/03</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
              {/* experience selects (unchanged) */}
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Project Management*
                </label>
                <div className="relative">
                  <select
                    value={formData.experiencePoints.projectManagement}
                    onChange={(e) =>
                      handleExperienceChange(
                        "projectManagement",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.projectManagement
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="beginner">Yes</option>
                    <option value="intermediate">No</option>
                  </select>
                </div>
                {errors.projectManagement && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.projectManagement}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Scheduling & Planning*
                </label>
                <div className="relative">
                  <select
                    value={formData.experiencePoints.schedulingPlanning}
                    onChange={(e) =>
                      handleExperienceChange(
                        "schedulingPlanning",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.schedulingPlanning
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="beginner">Yes</option>
                    <option value="intermediate">No</option>
                  </select>
                </div>
                {errors.schedulingPlanning && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.schedulingPlanning}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Estimating & Budgeting*
                </label>
                <div className="relative">
                  <select
                    value={formData.experiencePoints.estimatingBudgeting}
                    onChange={(e) =>
                      handleExperienceChange(
                        "estimatingBudgeting",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.estimatingBudgeting
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="beginner">Yes</option>
                    <option value="intermediate">No</option>
                  </select>
                </div>
                {errors.estimatingBudgeting && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.estimatingBudgeting}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Procurement & Material Management*
                </label>
                <div className="relative">
                  <select
                    value={formData.experiencePoints.procurementMaterial}
                    onChange={(e) =>
                      handleExperienceChange(
                        "procurementMaterial",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.procurementMaterial
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="beginner">Yes</option>
                    <option value="intermediate">No</option>
                  </select>
                </div>
                {errors.procurementMaterial && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.procurementMaterial}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Communication & Collaboration*
                </label>
                <div className="relative">
                  <select
                    value={formData.experiencePoints.communicationCollaboration}
                    onChange={(e) =>
                      handleExperienceChange(
                        "communicationCollaboration",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.communicationCollaboration
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="beginner">Yes</option>
                    <option value="intermediate">No</option>
                  </select>
                </div>
                {errors.communicationCollaboration && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.communicationCollaboration}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Quality & Safety*
                </label>
                <div className="relative">
                  <select
                    value={formData.experiencePoints.qualitySafety}
                    onChange={(e) =>
                      handleExperienceChange("qualitySafety", e.target.value)
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-full outline-none mb-1 ${
                      errors.qualitySafety
                        ? "border-red-400"
                        : "border-[#C9C9C9]"
                    }`}
                  >
                    <option value="">Select Your Point</option>
                    <option value="beginner">Yes</option>
                    <option value="intermediate">No</option>
                  </select>
                </div>
                {errors.qualitySafety && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.qualitySafety}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={prevStep}
                className="bg-[#A9A9A9] text-white bricolage-grotesque px-8 py-2.5 rounded-full"
              >
                Step Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#312F30] text-white bricolage-grotesque  px-12 py-3 rounded-full"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaiEarlyAccessForm;
