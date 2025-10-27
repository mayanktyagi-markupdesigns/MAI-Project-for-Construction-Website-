import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Download,
  Edit2,
  PlusCircle,
  X,
  Eye,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { fetchProjectsApi } from "../../apiServices";

const TasksPage = ({ projectId, setActiveSection }) => {
  const API_BASE = "https://www.markupdesigns.net/mai-beta/api";
  const TASKS_URL = `${API_BASE}/tasks`;

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // not used heavily here but kept
  const [loading, setLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskDetailsModalOpen, setTaskDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // For the task details modal:
  const [selectedTasks, setSelectedTasks] = useState([]); // tasks loaded for selected project (modal)
  const [modalSearch, setModalSearch] = useState("");
  const [modalPriorityFilter, setModalPriorityFilter] = useState("");
  const [modalDateFrom, setModalDateFrom] = useState("");
  const [modalDateTo, setModalDateTo] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); // ids checked in the modal
  const [processingIds, setProcessingIds] = useState([]); // ids currently updating
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [form, setForm] = useState({
    project_id: "",
    title: "",
    description: "",
    due_date: "",
    priority: "",
    assigned_to: "",
    linked_document_id: "",
    linked_email_id: "",
  });

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    const localData = getLocalProjects();
    if (localData && localData.length > 0) {
      setProjects(localData);
      setLoading(false);
    } else {
      console.log("No data in localStorage. Fetching from API...");
      fetchProjects();
    }
  }, []);

  const fetchTasks = async (pid) => {
    if (!pid) {
      setSelectedTasks([]);
      return [];
    }
    try {
      const res = await fetch(`${API_BASE}/tasks/${pid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      const data = json.data || [];
      return data;
    } catch (err) {
      console.error("Error fetching tasks:", err);
      return [];
    }
  };

  const exportTasks = () => {
    const csvContent = [
      [
        "Project Name",
        "Task Title",
        "Description",
        "Due Date",
        "Priority",
        "Status",
      ],
      ...projects.flatMap((project) =>
        (project.tasks || []).map((task) => [
          project.project_name || "",
          task.title || "",
          task.description || "",
          task.due_date || "",
          task.priority || "",
          task.status || "",
        ])
      ),
    ]
      .map((row) =>
        row
          .map((field) => `"${(field ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Tasks_log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      (p.project_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client_agency || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (p.architect_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const openAddTaskModal = (pid) => {
    const today = new Date().toISOString().slice(0, 10);
    setIsEditing(false);
    setEditingTask(null);
    setSelectedProjectId(pid);
    setForm({
      project_id: pid || "",
      title: "",
      description: "",
      due_date: today,
      priority: "",
      assigned_to: "",
      linked_document_id: "",
      linked_email_id: "",
    });
    setTaskModalOpen(true);
  };

  const openEditModal = (task, pid) => {
    setIsEditing(true);
    setEditingTask(task);
    setSelectedProjectId(pid);
    setForm({
      project_id: pid || "",
      title: task.title || "",
      description: task.description || "",
      due_date: task.due_date || "",
      priority: task.priority || "",
      assigned_to: task.party || "",
      linked_document_id: task.raw?.linked_document_id || "",
      linked_email_id: task.raw?.linked_email_id || "",
    });
    setTaskModalOpen(true);
  };

  const viewTaskDetails = async (pid) => {
    setLoadingProjectId(pid);
    const tasksData = await fetchTasks(pid);
    setSelectedTasks(tasksData);
    setSelectedProjectId(pid);
    // reset modal filters / selections
    setModalSearch("");
    setModalPriorityFilter("");
    setModalDateFrom("");
    setModalDateTo("");
    setSelectedTaskIds([]);
    setSelectAllChecked(false);
    setTaskDetailsModalOpen(true);
    setLoadingProjectId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.project_id) {
      Swal.fire("Error", "Project ID is required.", "error");
      return;
    }

    try {
      setSaving(true);
      if (isEditing && editingTask) {
        const editPayload = {
          project_id: form.project_id,
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          priority: form.priority,
          assigned_to: "",
          linked_document_id: "",
          linked_email_id: "",
        };

        await axios.put(`${TASKS_URL}/${editingTask.id}`, editPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
            "Content-Type": "application/json",
          },
        });

        Swal.fire("Success", "Task updated successfully", "success");
      } else {
        const createPayload = {
          project_id: form.project_id,
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          priority: form.priority,
          assigned_to: "",
          linked_document_id: "",
        };

        await axios.post(TASKS_URL, createPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
            "Content-Type": "application/json",
          },
        });

        Swal.fire("Success", "Task created successfully", "success");
      }

      setTaskModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error("submitForm error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Operation failed";
      Swal.fire("Error", message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- New helpers for modal filtering and completion ----------
  const getVisibleTasks = () => {
    return selectedTasks.filter((task) => {
      // modal search: title or description
      if (
        modalSearch &&
        !(
          String(task.title || "")
            .toLowerCase()
            .includes(modalSearch.toLowerCase()) ||
          String(task.description || "")
            .toLowerCase()
            .includes(modalSearch.toLowerCase())
        )
      ) {
        return false;
      }

      // priority filter
      if (
        modalPriorityFilter &&
        String(task.priority || "").toLowerCase() !==
          modalPriorityFilter.toLowerCase()
      ) {
        return false;
      }

      // date range filter
      if (modalDateFrom) {
        const taskDate = task.due_date ? new Date(task.due_date) : null;
        const from = new Date(modalDateFrom);
        if (!taskDate || taskDate < from) return false;
      }
      if (modalDateTo) {
        const taskDate = task.due_date ? new Date(task.due_date) : null;
        // include full day of 'to'
        const to = new Date(modalDateTo);
        to.setHours(23, 59, 59, 999);
        if (!taskDate || taskDate > to) return false;
      }

      return true;
    });
  };

  const isTaskProcessing = (id) => processingIds.includes(id);

  const markTaskCompleted = async (id) => {
    // do single update
    try {
      setProcessingIds((p) => [...p, id]);
      await axios.put(
        `${TASKS_URL}/${id}`,
        { status: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      // update local selectedTasks state
      setSelectedTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Completed" } : t))
      );
      // ensure it's in selectedTaskIds
      setSelectedTaskIds((prev) => {
        if (!prev.includes(id)) return [...prev, id];
        return prev;
      });

      Swal.fire("Success", "Task marked as completed.", "success");
      // refresh projects list
      fetchProjects();
    } catch (err) {
      console.error("Error marking task completed", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message || err?.message || "Failed to update task",
        "error"
      );
      // revert checkbox handled by caller (we won't change selectedTaskIds here on error)
    } finally {
      setProcessingIds((p) => p.filter((x) => x !== id));
    }
  };

  const handleRowCheckboxChange = async (task, checked) => {
    const id = task.id;
    if (task.status && String(task.status).toLowerCase() === "completed") {
      // already completed - keep it checked and disabled
      return;
    }

    if (checked) {
      // ask for confirmation for single task
      const result = await Swal.fire({
        title: "Confirm",
        text: "Are you sure you want to mark this task as completed?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, mark completed",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await markTaskCompleted(id);
      } else {
        // user cancelled — don't change selection
        setSelectedTaskIds((prev) => prev.filter((x) => x !== id));
      }
    } else {
      // unchecked by user — just remove from selection (do not mark incomplete on server)
      setSelectedTaskIds((prev) => prev.filter((x) => x !== id));
    }
    // ensure selectAll checkbox reflects selection
    setTimeout(() => {
      const visible = getVisibleTasks();
      const allIdsVisible = visible.map((t) => t.id);
      setSelectAllChecked(
        allIdsVisible.every(
          (i) => selectedTaskIds.includes(i) || (i === id && checked)
        )
      );
    }, 50);
  };

  const handleSelectAllChange = async (checked) => {
    const visible = getVisibleTasks();
    const idsToActOn = visible
      .filter((t) => !(String(t.status || "").toLowerCase() === "completed"))
      .map((t) => t.id);

    if (checked) {
      if (idsToActOn.length === 0) {
        // nothing to do
        setSelectAllChecked(true);
        // mark already-completed ones as selected for UI consistency
        setSelectedTaskIds(visible.map((t) => t.id));
        return;
      }

      const result = await Swal.fire({
        title: "Confirm",
        text: `Mark ${idsToActOn.length} visible task(s) as completed?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, mark completed",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // batch update
        try {
          setProcessingIds((p) => [...p, ...idsToActOn]);
          await Promise.all(
            idsToActOn.map((id) =>
              axios.put(
                `${TASKS_URL}/${id}`,
                { status: "Completed" },
                {
                  headers: {
                    Authorization: `Bearer ${
                      localStorage.getItem("mai_token") || ""
                    }`,
                    "Content-Type": "application/json",
                  },
                }
              )
            )
          );
          // update local selectedTasks
          setSelectedTasks((prev) =>
            prev.map((t) =>
              idsToActOn.includes(t.id) ? { ...t, status: "Completed" } : t
            )
          );
          // mark selected ids to include all visible ones
          setSelectedTaskIds(visible.map((t) => t.id));
          Swal.fire(
            "Success",
            `${idsToActOn.length} task(s) marked completed.`,
            "success"
          );
          fetchProjects();
        } catch (err) {
          console.error("Batch update error", err);
          Swal.fire(
            "Error",
            "Failed to update some tasks. Try again.",
            "error"
          );
        } finally {
          setProcessingIds((p) => p.filter((id) => !idsToActOn.includes(id)));
        }
      } else {
        // cancelled
        setSelectAllChecked(false);
        // do not alter selectedTaskIds
      }
    } else {
      // unchecking select all -> deselect visible set (but do not revert status on server)
      const visibleIds = visible.map((t) => t.id);
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
      setSelectAllChecked(false);
    }
  };

  // ensure header select-all reflects current selectedTaskIds when modal selection changes
  useEffect(() => {
    const visible = getVisibleTasks();
    if (visible.length === 0) {
      setSelectAllChecked(false);
      return;
    }
    const allVisibleSelected = visible.every((t) =>
      selectedTaskIds.includes(t.id)
    );
    setSelectAllChecked(allVisibleSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTaskIds,
    modalSearch,
    modalPriorityFilter,
    modalDateFrom,
    modalDateTo,
    selectedTasks,
  ]);

  // -----------------------------------------------------------------

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bricolage-grotesque gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Tasks Management
            </h1>
            <p className="text-gray-600">
              Organize and monitor tasks efficiently to keep your projects on
              track.
            </p>
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={exportTasks}
              className="flex-1 sm:flex-none inline-flex items-center gap-2 px-4 py-2 bg-[#312F30] text-white rounded-full transition-colors justify-center"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="hidden sm:block bg-white rounded-xl shadow-lg border bricolage-grotesque border-gray-200 mb-6 p-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:hidden w-full mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, address, client or architect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl bricolage-grotesque shadow-lg border border-gray-200">
        <div className="bg-[#E9E9E9] rounded-md px-4 py-3">
          <h2 className="text-md font-semibold text-[#5B5B5B]">
            Projects ({filteredProjects.length} items)
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 bricolage-grotesque text-gray-700">
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Project Name
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Address
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Client Agency
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Contract Amount
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Start Date
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    End Date
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Architect Name
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Task Management
                  </th>
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Task Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{project.name || "-"}</div>
                    </td>
                    <td className="px-4 py-3">{project.address || "-"}</td>
                    <td className="px-4 py-2">
                      {project.client_agency || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {project.contract_amount
                        ? `$${Math.round(project.contract_amount)}`
                        : "-"}
                    </td>

                    <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium shadow ${
                          project.start_date
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.start_date
                          ? new Date(project.start_date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium shadow ${
                          project.end_date
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.end_date
                          ? new Date(project.end_date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </span>
                    </td>

                    <td className="px-4 py-2">
                      {project.architect_name || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openAddTaskModal(project.id)}
                        className="inline-flex items-center cursor-pointer gap-1.5 px-3 py-1.5 bg-teal-800 text-white rounded-full hover:bg-teal-900 transition-colors text-xs whitespace-nowrap"
                      >
                        <PlusCircle className="w-3 h-3 shrink-0" /> Add Task
                      </button>
                    </td>

                    <td className="px-4 py-2">
                      <button
                        onClick={() => viewTaskDetails(project.id)}
                        disabled={loadingProjectId === project.id}
                        className={`inline-flex items-center cursor-pointer gap-2 px-3 py-1.5 border rounded-full text-xs transition-colors ${
                          loadingProjectId === project.id
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-700 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {loadingProjectId === project.id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Loading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Eye className="w-3 h-3" /> View
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium bricolage-grotesque text-gray-900 mb-2">
              No Projects found
            </h3>
            <p className="text-gray-500 bricolage-grotesque">
              Create a project to start managing tasks.
            </p>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {taskDetailsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold bricolage-grotesque">
                  Task Details
                </h3>
                <div className="text-sm text-gray-500">
                  ({selectedTasks.length} total)
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Select All checkbox in header */}
                <label className="inline-flex items-center gap-2 text-sm mr-2">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-700">Select All</span>
                </label>

                <button
                  onClick={() => setTaskDetailsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Filters for modal */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Search (title / description)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={modalPriorityFilter}
                    onChange={(e) => setModalPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Due Date From
                  </label>
                  <input
                    type="date"
                    value={modalDateFrom}
                    onChange={(e) => setModalDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Due Date To
                  </label>
                  <input
                    type="date"
                    value={modalDateTo}
                    onChange={(e) => setModalDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {getVisibleTasks().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="px-4 py-2">
                          {/* empty for row checkboxes */}
                        </th>
                        <th className="px-4 py-2">Title</th>
                        <th className="px-4 py-2">Due Date</th>
                        <th className="px-4 py-2">Priority</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getVisibleTasks().map((task) => {
                        const isCompleted =
                          String(task.status || "").toLowerCase() ===
                          "completed";
                        return (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={
                                  selectedTaskIds.includes(task.id) ||
                                  isCompleted
                                }
                                disabled={
                                  isCompleted || isTaskProcessing(task.id)
                                }
                                onChange={(e) => {
                                  // maintain selection attempt, then confirm & act
                                  if (e.target.checked) {
                                    setSelectedTaskIds((prev) => [
                                      ...new Set([...prev, task.id]),
                                    ]);
                                  } else {
                                    setSelectedTaskIds((prev) =>
                                      prev.filter((id) => id !== task.id)
                                    );
                                  }
                                  handleRowCheckboxChange(
                                    task,
                                    e.target.checked
                                  );
                                }}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="font-medium">
                                {task.title || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === "High" ||
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : task.priority === "Medium" ||
                                      task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-teal-100 text-teal-800"
                                }`}
                              >
                                {String(task.priority || "").toUpperCase() ||
                                  "-"}
                              </span>
                            </td>
                            <td className="px-4 py-2 italic text-gray-500">
                              {task.description || "-"}
                            </td>
                            <td className="px-4 py-2">
                              {isTaskProcessing(task.id) ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                  Processing...
                                </div>
                              ) : (
                                task.status || "-"
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => {
                                  setTaskDetailsModalOpen(false);
                                  openEditModal(task, selectedProjectId);
                                }}
                                className="inline-flex items-center gap-2 px-2 py-1 border rounded hover:bg-gray-50"
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Tasks found
                  </h3>
                  <p className="text-gray-500">
                    Add tasks to this project to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold bricolage-grotesque">
                {isEditing ? "Edit Task" : "Add Task"}
              </h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none"
                    placeholder="Enter Task Title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Due Date
                  </label>
                  <input
                    name="due_date"
                    type="date"
                    value={form.due_date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none appearance-none pr-10"
                  >
                    <option value="">Select</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-400 absolute right-4 top-8 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Project ID
                  </label>
                  <input
                    name="project_id"
                    value={form.project_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 text-sm border border-[#C9C9C9] rounded-full outline-none bg-gray-50"
                    readOnly
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 text-sm border border-[#C9C9C9] rounded-xl outline-none"
                    rows={3}
                    placeholder="Enter Task Description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 border border-[#312F30] bricolage-grotesque cursor-pointer text-[#312F30] rounded-full transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-teal-800 cursor-pointer text-white rounded-full hover:bg-teal-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
