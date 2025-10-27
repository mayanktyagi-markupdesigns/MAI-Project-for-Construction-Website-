import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Clock,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";
import { fetchProjectsApi, fetchAllTasksApi } from "../../apiServices";

const Overview = ({ setActiveSection }) => {
  const [expandedTasksPanel, setExpandedTasksPanel] = useState(true);
  const [expandProjects, setExpandProjects] = useState(false);
  const [expandCalendar, setExpandCalendar] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [messages] = useState([
    {
      id: 1,
      from: "Ravi",
      snippet:
        "Please review the document I uploaded.Please review the document I uploaded.Please review the document I uploaded.",
      time: "2h ago",
    },
  ]);

  const getLocalProjects = () => {
    const stored = localStorage.getItem("projectsData");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjectsApi();
      if (Array.isArray(data)) {
        setProjects(data);
        localStorage.setItem("projectsData", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
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
    const localData = getLocalProjects();
    if (localData && localData.length > 0) {
      console.log("Using localStorage data:", localData);
      setProjects(localData);
      setLoadingProjects(false);
    } else {
      console.log("No data in localStorage. Fetching from API...");
      fetchProjects();
    }
  }, []);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await fetchAllTasksApi();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const visibleProjects = expandProjects ? projects : projects.slice(0, 3);
  const visibleCalendarTasks = expandCalendar ? tasks : tasks.slice(0, 2);

  return (
    <div className="p-2 min-h-screen bricolage-grotesque">
      <div className="lg:flex lg:gap-3">
        {/* LEFT COLUMN (lg:w-2/3) -> Projects + My Tasks (swapped here) */}
        <div className="lg:w-2/3 space-y-3">
          {/* Projects Card */}
          <div>
            <div className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-indigo-50 px-3 py-3 rounded-t-xl border border-gray-200">
              <h2 className="flex items-center text-sm font-semibold text-gray-800">
                <Calendar className="mr-1.5 w-4 h-4 text-sky-600" />
                Projects Activity
              </h2>
              <button
                onClick={() => setActiveSection("projects")}
                className="text-[12px] font-medium cursor-pointer text-sky-600 hover:text-sky-700 hover:underline"
              >
                See All →
              </button>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-3">
              <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                <div className="w-1 h-4 bg-sky-600 rounded-full mr-2"></div>
                <h3 className="text-xs font-semibold text-gray-700">
                  Document Tracking System
                </h3>
              </div>

              {loadingProjects ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                </div>
              ) : projects.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">
                  No project data available.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {[
                            "Project Name",
                            "Client Agency",
                            "Start Date",
                            "End Date",
                            "Documents",
                          ].map((t, i) => (
                            <th
                              key={i}
                              className="py-2 px-2 text-left text-gray-600 font-semibold whitespace-nowrap"
                            >
                              {t}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProjects.map((project) => (
                          <tr
                            key={project.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 px-2">
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-semibold block whitespace-normal break-words ${
                                  project.name
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                                style={{ maxWidth: "150px" }}
                              >
                                {project.name || "-"}
                              </span>
                            </td>

                            <td className="py-2 px-2 text-gray-700 font-medium whitespace-nowrap">
                              {project.client_agency || "N/A"}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                  project.start_date
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.start_date
                                  ? formatDate(project.start_date)
                                  : "-"}
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                  project.end_date
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.end_date
                                  ? formatDate(project.end_date)
                                  : "-"}
                              </span>
                            </td>

                            <td className="py-2 px-2 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-sky-100 text-sky-700 font-bold text-xs rounded-full">
                                {project.documents?.length || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {projects.length > 3 && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => setExpandProjects((prev) => !prev)}
                        className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center"
                      >
                        {expandProjects ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show more ({projects.length - 3} more)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* --- SWAPPED: My Tasks was originally on the right; now placed here --- */}
          <div>
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-3 rounded-t-xl border border-gray-200">
              <h2 className="flex items-center text-sm font-semibold text-gray-800">
                <Calendar className="mr-1.5 w-4 h-4 text-purple-600" />
                My Tasks
              </h2>
              <button
                onClick={() => setActiveSection("projects")}
                className="text-[12px] cursor-pointer font-medium text-purple-600 hover:text-purple-700 hover:underline"
              >
                See All →
              </button>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-2">
              <div
                className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                onClick={() => setExpandedTasksPanel((s) => !s)}
              >
                <div className="flex items-center">
                  {expandedTasksPanel ? (
                    <ChevronUp className="mr-1 text-gray-600 w-4 h-4" />
                  ) : (
                    <ChevronDown className="mr-1 text-gray-600 w-4 h-4" />
                  )}
                  <span className="font-semibold text-gray-800">
                    In Progress
                  </span>
                  <span className="ml-2 text-gray-500">
                    • {tasks.length} tasks
                  </span>
                </div>
              </div>

              {expandedTasksPanel && (
                <div className="mt-2 overflow-x-auto">
                  {loadingTasks ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-4">
                      No tasks found.
                    </p>
                  ) : (
                    <>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {["Name", "Priority", "Due Date"].map((t, i) => (
                              <th
                                key={i}
                                className="py-1 text-left text-gray-600 font-semibold"
                              >
                                {t}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(showAllTasks ? tasks : tasks.slice(0, 4)).map(
                            (task) => (
                              <tr
                                key={task.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-2">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                      task.priority === "High"
                                        ? "bg-red-100 text-red-700"
                                        : task.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {task.title || "-"}
                                  </span>
                                </td>
                                <td className="py-2">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                      task.priority === "High"
                                        ? "bg-red-100 text-red-600"
                                        : task.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "bg-gray-200 text-gray-600"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </td>
                                <td className="py-2 text-gray-700 font-medium">
                                  {task.due_date
                                    ? new Date(
                                        task.due_date
                                      ).toLocaleDateString()
                                    : "—"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>

                      {/* 👇 Show More / Show Less Button */}
                      {tasks.length > 4 && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => setShowAllTasks((prev) => !prev)}
                            className="text-[12px] text-purple-600 font-medium hover:underline cursor-pointer"
                          >
                            {showAllTasks ? "Show Less ↑" : "Show More ↓"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:w-1/3) -> CALENDAR (swapped here) + MESSAGES 4-card */}
        <div className="lg:w-1/3 mt-3 lg:mt-0 space-y-3">
          {/* Calendar Events Card (moved to right) */}
          <div className="lg:sticky lg:top-2">
            <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-3 rounded-t-xl border border-gray-200">
              <h2 className="flex items-center text-sm font-semibold text-gray-800">
                <Calendar className="mr-1.5 w-4 h-4 text-green-600" />
                Calendar Events
              </h2>
              <button
                onClick={() => setActiveSection("calendar")}
                className="text-[12px] cursor-pointer font-medium text-green-600 hover:text-green-700 hover:underline"
              >
                See All →
              </button>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-3">
              {loadingTasks ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">
                  No upcoming tasks.
                </p>
              ) : (
                <div className="flex flex-col">
                  <div className="space-y-2">
                    {visibleCalendarTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group hover:bg-gray-50 p-2 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="h-2.5 w-2.5 bg-green-500 rounded-full mt-1 mr-2"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-gray-800">
                              {task.project?.name || "Unnamed Project"}
                            </div>
                            <div className="text-[12px] text-gray-600 mb-1">
                              {task.title}
                            </div>
                            <div className="flex items-center text-[12px] mb-1">
                              <Clock className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="text-gray-600 font-medium">
                                Due:
                              </span>
                              <span className="text-red-600 font-semibold ml-1">
                                {task.due_date
                                  ? new Date(task.due_date).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center text-[12px] text-gray-600">
                              <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                              <span className="mr-1">MAI Dashboard</span>
                              <button
                                onClick={() => setActiveSection("calendar")}
                                className="text-[12px] cursor-pointer font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                              >
                                Go to Calendar →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {tasks.length > 2 && (
                    <div className="mt-2 flex justify-end pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setExpandCalendar((s) => !s)}
                        className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center"
                      >
                        {expandCalendar ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show more ({tasks.length - 2} more)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messages Card - 4 small cards, 3rd and 4th side-by-side */}
          <div>
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-3 rounded-t-xl border border-gray-200">
              <h2 className="flex items-center text-sm font-semibold text-gray-800">
                <Mail className="mr-1.5 w-4 h-4 text-gray-700" />
                Messages
              </h2>
              <button
                onClick={() => setActiveSection("messages")}
                className="text-[12px] cursor-pointer font-medium text-gray-700 hover:underline"
              >
                See All →
              </button>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-3">
              <div className="grid grid-cols-1 gap-2">
                {messages.slice(0, 2).map((m) => (
                  <div key={m.id} className="p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      <img
                        src="/mai-web/assets/Dasboard/user.png"
                        alt={m.from}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-800">
                          {m.from}
                        </div>
                        <div className="text-[12px] text-gray-600 ">
                          {m.snippet}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {m.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Third and fourth messages side-by-side */}
                <div className="grid grid-cols-2 gap-2">
                  {messages.slice(2, 4).map((m) => (
                    <div
                      key={m.id}
                      className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-2">
                        {/* ✅ Profile Image */}
                        <img
                          src="/mai-web/assets/Dasboard/user.png"
                          alt={m.from}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-gray-800">
                            {m.from}
                          </div>
                          <div className="text-[11px] text-gray-600 ">
                            {m.snippet}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {m.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
