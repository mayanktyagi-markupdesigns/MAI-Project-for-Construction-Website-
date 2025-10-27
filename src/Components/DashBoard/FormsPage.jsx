import React, { useState, useEffect } from "react";
import { Clock, Mail, Bell, Sparkles, ArrowRight } from "lucide-react";

const FormsPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = () => {
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-white relative overflow-hidden text-gray-900">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168,85,247,0.25), transparent 40%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-sky-300 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center mt-0">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-sky-500 via-sky-500 to-sky-500 bg-clip-text text-transparent animate-pulse">
            Forms
          </h1>

          {/* Subheading */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles
              className="w-5 h-5 text-yellow-500 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-700">
              Coming Soon
            </h2>
            <Sparkles
              className="w-5 h-5 text-yellow-500 animate-spin"
              style={{ animationDuration: "3s" }}
            />
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            We’re crafting something extraordinary. Get ready for a revolutionary
            forms experience that will transform how you collect and manage data.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 max-w-2xl mx-auto">
            {[
              {
                icon: Clock,
                text: "Lightning Fast",
                color: "from-blue-500 to-cyan-400",
              },
              {
                icon: Bell,
                text: "Smart Alerts",
                color: "from-sky-500 to-sky-400",
              },
              {
                icon: Sparkles,
                text: "Clean Design",
                color: "from-yellow-400 to-orange-400",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-300 hover:scale-105"
              >
                <f.icon
                  className={`w-6 h-6 mx-auto mb-2 bg-gradient-to-br ${f.color} bg-clip-text text-transparent`}
                />
                <p className="text-sm md:text-base font-medium text-gray-700">
                  {f.text}
                </p>
              </div>
            ))}
          </div>

          {/* Email Notification */}
          <div className="max-w-sm mx-auto">
            {!submitted ? (
              <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-300">
                <div className="flex-1 flex items-center px-3">
                  <Mail className="w-5 h-5 text-sky-500 mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-transparent text-gray-800 placeholder-gray-400 outline-none w-full text-sm"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-1 group"
                >
                  Notify
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="bg-green-100 border border-green-400 rounded-xl p-4 animate-pulse">
                <p className="text-green-700 font-semibold text-sm">
                  ✓ Thank you! We’ll notify you when we launch.
                </p>
              </div>
            )}
          </div>

          {/* Launch info */}
          <div className="mt-12 text-sky-600">
            <p className="text-xs uppercase tracking-wider mb-1">
              Expected Launch
            </p>
            <p className="text-xl font-bold">Q4 2025</p>
          </div>
        </div>
      </div>

  
    </div>
  );
};

export default FormsPage;
