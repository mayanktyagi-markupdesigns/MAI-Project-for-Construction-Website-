import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Chatbot from "./Chatbot";

const DashHome = () => {
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("activeSection") || "dashboard"
  );
  const [showChatbot, setShowChatbot] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const getInitialSidebar = () =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebar);

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  useEffect(() => () => localStorage.removeItem("activeSection"), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !sidebarOpen) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onViewDetails={(id, name) => {
          console.log("DashHome - onViewDetails id:", id);
          setCurrentProjectId(id);
          setActiveSection("ProjectDetail");
        }}
        
      />

      <div
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? "md:ml-56" : "md:ml-14"
        } z-10`}
      >
        <Dashboard
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          projectId={currentProjectId}
          onViewTasks={(projectId) => {
            setCurrentProjectId(projectId);
            setActiveSection("tasks");
          }}
        />
      </div>

      {/* Chatbot Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowChatbot(true)}
          className="flex items-center space-x-2 px-3 py-2 rounded-full transition border border-gray-300 bg-white shadow-md hover:shadow-lg"
        >
          <img
            src="/mai-web/assets/home/logo.png"
            alt="MAI Logo"
            className="w-8 h-8 object-cover"
          />
          <span className="text-sm bricolage-grotesque font-medium text-[#848484]">
            Ask From MAi
          </span>
        </button>
      </div>

      {showChatbot && (
        <>
          <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40"></div>
          <div className="z-50">
            <Chatbot
              onClose={() => setShowChatbot(false)}
              mode={window.innerWidth >= 1024 ? "desktop" : "mobile"}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashHome;
