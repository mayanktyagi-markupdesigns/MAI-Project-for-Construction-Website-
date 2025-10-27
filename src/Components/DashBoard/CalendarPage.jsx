import React, { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllTasksApi } from "../../apiServices";

const CompactCalendar = () => {
  const [currentView, setCurrentView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // ---------- Helpers ----------
  const parseDateFromYYYYMMDD = (isoDateString) => {
    if (!isoDateString) return null;
    const parts = isoDateString.split("-").map((p) => parseInt(p, 10));
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  const priorityToColor = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "medium":
        return "bg-gradient-to-r from-orange-400 to-orange-500";
      case "low":
      default:
        return "bg-gradient-to-r from-emerald-400 to-emerald-500";
    }
  };

  const mapApiTasksToInternal = (rawTasks) => {
    return (rawTasks || []).map((t) => {
      const dateObj = t.due_date ? parseDateFromYYYYMMDD(t.due_date) : null;
      return {
        id: `task-${t.id}`,
        title: t.title || "Untitled task",
        description: t.description || "",
        date: dateObj,
        due_date_raw: t.due_date || null,
        priority: t.priority || "Low",
        projectName: t.project?.name || t.project_name || t.project || "",
        status: t.status || "",
        color: priorityToColor(t.priority),
        type: "task",
        raw: t,
      };
    });
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      if (typeof fetchAllTasksApi === "function") {
        const result = await fetchAllTasksApi();
        const tasksArray = Array.isArray(result) ? result : result?.data || [];
        setTasks(mapApiTasksToInternal(tasksArray));
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const combinedItems = [...events, ...tasks];

  const getEventsForDay = (day, month, year) =>
    combinedItems.filter(
      (item) =>
        item.date &&
        item.date.getDate() === day &&
        item.date.getMonth() === month &&
        item.date.getFullYear() === year
    );

  const getTodayEvents = () => {
    const today = new Date();
    return getEventsForDay(
      today.getDate(),
      today.getMonth(),
      today.getFullYear()
    );
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevDaysInMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
      calendarDays.push({
        day: prevDaysInMonth - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;
      calendarDays.push({ day, isCurrentMonth: true, isToday });
    }

    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({ day, isCurrentMonth: false, isToday: false });
    }

    return calendarDays;
  };

  const navigateMonth = (direction) => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="min-h-screen p-3 -mt-2">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage your schedule</p>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <button
              onClick={loadTasks}
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              disabled={loadingTasks}
            >
              {loadingTasks ? "Loading..." : "Refresh Tasks"}
            </button>
          </div>
        </div>

        {/* View Toggle & Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-white rounded-lg p-0.5 shadow-sm border border-gray-200">
            {["month", "week", "day"].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  currentView === view
                    ? "bg-sky-600 text-white"
                    : "text-gray-600"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded hover:bg-white hover:shadow"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h2 className="text-sm font-semibold text-gray-900 min-w-[140px] text-center">
              {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 rounded hover:bg-white hover:shadow"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {days.map((day) => (
                  <div key={day} className="p-2 text-center">
                    <span className="text-xs font-semibold text-gray-600">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {generateCalendarDays().map((date, index) => {
                  const dayEvents = date.isCurrentMonth
                    ? getEventsForDay(
                        date.day,
                        selectedDate.getMonth(),
                        selectedDate.getFullYear()
                      )
                    : [];
                  return (
                    <div
                      key={index}
                      className={`min-h-[70px] p-1.5 border-b border-r border-gray-100 transition-colors hover:bg-sky-50 ${
                        !date.isCurrentMonth ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div
                        className={`text-xs mb-1 ${
                          date.isToday
                            ? "w-5 h-5 bg-sky-600 text-white rounded-full flex items-center justify-center font-semibold"
                            : date.isCurrentMonth
                            ? "text-gray-900 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {date.day}
                      </div>

                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate text-white ${
                              ev.color || "bg-sky-600"
                            }`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-gray-500 text-center">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Today's Tasks */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-sky-100 rounded">
                  <Calendar className="w-4 h-4 text-sky-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Today's Items
                </h3>
              </div>

              <div className="space-y-2">
                {getTodayEvents().length > 0 ? (
                  getTodayEvents().map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <div
                        className={`${
                          item.color || "bg-sky-100"
                        } p-3 rounded-lg text-white shadow hover:shadow-lg transition-all`}
                      >
                        <h4 className="font-semibold text-xs mb-2">
                          {item.title}
                        </h4>
                        {item.type === "task" && (
                          <>
                            <div className="text-[11px] opacity-90 mb-1">
                              <strong className="mr-1">Due:</strong>
                              {item.due_date_raw || "-"}
                            </div>
                            <div className="text-[11px] opacity-90">
                              <strong className="mr-1">Project:</strong>
                              {item.projectName || "—"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No items today
                  </p>
                )}
              </div>
            </div>

            {/* Tasks list & Quick Stats */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
                <span className="text-xs text-gray-500">
                  {loadingTasks ? "Loading..." : `${tasks.length} tasks`}
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto">
                {tasks.length === 0 && !loadingTasks && (
                  <p className="text-xs text-gray-500">No tasks found</p>
                )}

                {tasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-3">
                    <div className="min-w-[46px]">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] ${t.color}`}
                      >
                        {t.priority ? t.priority[0].toUpperCase() : "L"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {t.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.due_date_raw
                            ? new Date(t.due_date_raw).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {t.projectName
                          ? `${t.projectName} • ${t.status}`
                          : t.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* quick stats */}
              <div className="mt-4 border-t pt-3">
                <h4 className="text-xs text-gray-600 mb-2">This Month</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Tasks</span>
                    <span className="text-sm font-semibold text-teal-600">
                      {tasks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Pending</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {
                        tasks.filter(
                          (t) => (t.status || "").toLowerCase() !== "completed"
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactCalendar;
