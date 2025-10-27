import React, { useState } from "react";
import { FiPhone, FiMail } from "react-icons/fi";
import Swal from "sweetalert2";
import { contactUs } from "./../../apiServices";

const GetTouch = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    company_name: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactUs(formData);
      if (res?.message?.toLowerCase().includes("success")) {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: res.message,
          confirmButtonColor: "#312F30",
          timer: 2500,
          showConfirmButton: false,
        });
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          company_name: "",
          message: "",
        });
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
        text: "Failed to send message. Please try again later.",
        confirmButtonColor: "#312F30",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center font-sans px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl w-full px-4 relative">
        <img
          src="/mai-web/assets/About/Watermark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute z-0
                     -top-10 right-6 md:right-80
                     w-28 md:w-56 lg:w-72 h-auto object-contain
                     opacity-60 md:opacity-300"
          style={{ mixBlendMode: "multiply" }}
        />

        <div className="relative z-10">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl bricolage-grotesque font-bold text-[#A9A9A9] tracking-tight mb-4">
              GET IN{" "}
              <span className="text-3xl md:text-4xl bricolage-grotesque font-bold text-[#312F30] tracking-tight">
                TOUCH
              </span>
            </h1>
            <p className="text-lg bricolage-grotesque md:text-md text-[#000000] leading-relaxed max-w-3xl mx-auto">
              We'd love to hear from you. Whether you have questions about MAi,
              want to book a demo, or are interested in partnerships — reach out
              below
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-4 md:ml-12 max-w-3xl"
            onSubmit={handleSubmit}
          >
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1"
                >
                  First Name*
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  placeholder="Enter Your Name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastname"
                  className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1"
                >
                  Last Name*
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  placeholder="Enter Last Name"
                  required
                />
              </div>
            </div>

            {/* Email / Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1"
                >
                  Email Address*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  placeholder="Enter Email Address"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="company_name"
                  className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  placeholder="Enter Your Company Name"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs bricolage-grotesque font-medium text-[#000000]"
              >
                Message*
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-lg outline-none"
                placeholder="Type Message Here..."
                required
              ></textarea>
            </div>

            {/* Submit */}
            <div className="text-center mt-10">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center cursor-pointer rounded-full bg-[#312F30] py-3 px-12 text-sm text-white disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>

          {/* Contact Info */}
          <div className="flex justify-center items-center bricolage-grotesque space-x-6 mt-8 text-[#000000] text-md">
            <div className="flex items-center space-x-2">
              <FiPhone className="h-6 w-6" />
              <span>9177716447</span>
            </div>
            <span>/</span>
            <div className="flex items-center space-x-2">
              <FiMail className="h-6 w-6" />
              <span>info@modrninc.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetTouch;
