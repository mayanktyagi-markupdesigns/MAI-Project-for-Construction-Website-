import React, { useState, useEffect } from "react";
import {
  BarChart3,
  ChevronRight,
  ChevronLeft,
  FolderKanban,
  FileText,
  Library,
  Brain,
  CheckSquare,
  Calendar,
  FileSpreadsheet,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { fetchProjectsApi } from "../../apiServices";

const Sidebar = ({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  onViewDetails,
}) => {
  const [openMenus, setOpenMenus] = useState({
    projects: false,
    reports: false,
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    window.refreshProjects = fetchProjects;
    const onProjectsUpdated = (e) => {
      const newProj = e?.detail ?? null;
      if (newProj && newProj?.id != null) {
        setProjects((prev) => {
          const exists = prev.some((p) => String(p.id) === String(newProj.id));
          if (exists) return prev;
          return [newProj, ...prev];
        });
      } else {
        fetchProjects();
      }
    };
    window.addEventListener("projectsUpdated", onProjectsUpdated);
    return () => {
      try {
        delete window.refreshProjects;
      } catch {}
      window.removeEventListener("projectsUpdated", onProjectsUpdated);
    };
  }, []);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    setProjectsError(null);
    try {
      const data = await fetchProjectsApi();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjectsError(error?.message || "Failed to fetch projects.");
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.message || "Failed to fetch projects.",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    window.refreshProjects = fetchProjects;
    return () => {
      try {
        delete window.refreshProjects;
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (activeSection && activeSection.startsWith("project-")) {
      setOpenMenus((prev) => ({ ...prev, projects: true }));
    }
  }, [activeSection]);

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    setMobileOpen(false);
    setSidebarOpen(false);
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "projects", icon: FolderKanban, label: "Projects" },
    { id: "reports", icon: FileText, label: "Reports" },
    { id: "submittals", icon: Library, label: "Submittal Library" },
    { id: "ai-document-parsing", icon: Brain, label: "AI Document Parsing" },
    { id: "tasks", icon: CheckSquare, label: "Tasks Management" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "forms", icon: FileSpreadsheet, label: "Forms" },
  ];

  const onProjectClick = (project) => {
    onViewDetails?.(project.id);
    setMobileOpen(false);
    setSidebarOpen(true);
  };

  const SidebarContent = ({ compact = false, onItemClick }) => (
    <div className="space-y-1 pb-6">
      {menuItems.map((item) => (
        <div key={item.id}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (item.id === "projects") {
                  if (!compact) {
                    toggleMenu("projects");
                  } else {
                    setSidebarOpen(true);
                  }
                  setActiveSection?.("projects");
                } else {
                  setActiveSection?.(item.id);
                  if (onItemClick) onItemClick();
                }
              }}
              className={`flex-1 flex items-center px-4 py-2 text-sm hover:bg-gray-400 transition rounded-md ${
                activeSection === item.id ? "bg-gray-300" : ""
              }`}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              {item.icon && <item.icon className="w-4 h-4 mr-3" />}
              {!compact ? (
                <span
                  className={`transition font-medium ${
                    activeSection === item.id
                      ? "text-[#312F30] font-semibold scale-105"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </button>

            {item.id === "projects" && !compact && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu("projects");
                }}
                className="p-1 mr-2 rounded hover:bg-gray-300"
                aria-label={
                  openMenus["projects"]
                    ? `Collapse ${item.label}`
                    : `Expand ${item.label}`
                }
              >
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transform transition-transform ${
                    openMenus["projects"] ? "rotate-90" : "rotate-0"
                  }`}
                />
              </button>
            )}
          </div>

          {item.id === "projects" && openMenus["projects"] && !compact && (
            <motion.div
              id={`${item.id}-submenu`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-1 space-y-1"
            >
              {loadingProjects && (
                <div className="px-6 py-2 text-xs text-gray-500">
                  Loading projects...
                </div>
              )}
              {projectsError && (
                <div className="px-6 py-2 text-xs text-red-500">
                  {projectsError}
                </div>
              )}
              {!loadingProjects &&
                Array.isArray(projects) &&
                projects.length === 0 && (
                  <div className="px-6 py-2 text-xs text-gray-500">
                    No projects found.
                  </div>
                )}

              {Array.isArray(projects) &&
                projects.map((proj, idx) => (
                  <motion.button
                    key={`proj-${proj.id}-${idx}`}
                    type="button"
                    onClick={() => onProjectClick(proj)}
                    className={`w-full flex items-center px-6 py-2 text-xs rounded-md transition font-medium ${
                      activeSection === `project-${proj.id}`
                        ? "bg-gray-300 text-[#312F30] font-semibold"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.02 }}
                  >
                    <span className="truncate">
                      | {proj.name || proj.title || `Project #${proj.id}`}
                    </span>
                  </motion.button>
                ))}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-[#DCDCDC] shadow-md z-30">
        <div className="flex items-center gap-2">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="/mai-web/assets/home/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <span className="text-sm font-semibold text-[#848484] bricolage-grotesque">
            BUILT FOR WORK
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-gray-300"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar (fixed) */}
      <aside
        className={`hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen z-20 ${
          sidebarOpen ? "w-56" : "w-14"
        } bg-[#DCDCDC] shadow-lg flex-col transition-all duration-300`}
      >
        <div className="p-4 flex items-center space-x-2">
          <Link to="/">
            <div className="w-9 h-9 mt-2 rounded-full flex items-center justify-center mb-2 overflow-hidden">
              <img
                src="/mai-web/assets/home/logo.png"
                alt="Logo"
                className="w-12 h-12 object-cover"
              />
            </div>
          </Link>
          {sidebarOpen && (
            <span className="text-sm font-semibold text-[#848484] bricolage-grotesque">
              BUILT FOR WORK
            </span>
          )}
        </div>

        <nav
          className="mt-4 px-2 hide-scrollbar box-border flex-1"
          aria-label="Main navigation"
          style={{ maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}
        >
          <SidebarContent compact={!sidebarOpen} />
        </nav>

        {/* Logout + Collapse area (stuck to bottom) */}
        <div className="px-3 py-3 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 transition"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-[65%] bg-white shadow-2xl z-50 p-4 overflow-y-auto rounded-r-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <Link to="/" onClick={() => setMobileOpen(false)}>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                      <img
                        src="/mai-web/assets/home/logo.png"
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <span className="text-sm font-semibold text-gray-600">
                    BUILT FOR WORK
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <nav aria-label="Mobile main navigation" className="space-y-1">
                <SidebarContent
                  compact={false}
                  onItemClick={() => setMobileOpen(false)}
                />
              </nav>

              <div className="md:hidden -mt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="ml-1 font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
