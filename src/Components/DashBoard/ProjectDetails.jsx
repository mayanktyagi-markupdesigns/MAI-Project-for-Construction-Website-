import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Loader2,
  X,
  ExternalLink,
  Calendar,
  User,
  Building2,
  Users,
  Folder,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DOCUMENT_CATEGORIES = [
  "BID",
  "Submittals",
  "CADD Files",
  "Change Order",
  "Closeout",
  "Correspondence",
  "Daily Reports",
  "Drawings Specs",
  "Insurance",
  "Inspections",
  "Meetings",
  "Misc",
  "Payment",
  "Permit",
  "Photos",
  "Procurement",
  "Project Docs",
  "RFI",
  "Safety",
  "Schedule",
  "Templates",
];

const ProjectDetails = ({ projectId, setActiveSection }) => {
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  // NEW: folder modal state
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const PROJECT_API = `https://www.markupdesigns.net/mai-beta/api/projects/${projectId}`;
  const TASKS_API = `https://www.markupdesigns.net/mai-beta/api/tasks/${projectId}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("mai_token") || "";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [projectRes, taskRes] = await Promise.all([
          fetch(PROJECT_API, { headers }),
          fetch(TASKS_API, { headers }),
        ]);

        const projectJson = await projectRes.json();
        const taskJson = await taskRes.json();

        setProjectData(projectJson);
        setTasks(taskJson?.data || []);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const parseSubcontractors = (raw) => {
    if (!raw) return "";
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
    } catch {
      return String(raw);
    }
  };

  const cleanPdfExtract = (raw) => {
    if (!raw) return "";
    let s = String(raw).replace(/\r/g, "\n").replace(/\x00/g, "");
    if (
      !s.includes("%PDF") &&
      !s.match(/\/Type\s+\/|obj|endobj|stream|endstream/)
    ) {
      return s.trim();
    }

    const pieces = [];
    const metaRe = /\/[A-Za-z]+ \(([^\)]*?)\)/g;
    for (const m of s.matchAll(metaRe)) {
      if (m[1] && m[1].trim().length > 0) pieces.push(m[1].trim());
    }

    const parenRe = /\(([^)\n]{2,}?)\)/g;
    for (const m of s.matchAll(parenRe)) {
      const val = m[1].trim();
      if (val && val.length >= 2 && !/^[\s\d\W]+$/.test(val)) pieces.push(val);
    }

    const runRe = /[A-Za-z0-9][A-Za-z0-9 ,\-\.\:\/\(\)&%]{10,}/g;
    for (const m of s.matchAll(runRe)) {
      const val = m[0].trim();
      if (val && val.length > 10) pieces.push(val);
    }

    const filtered = Array.from(new Set(pieces))
      .map((p) =>
        p
          .replace(/\s+/g, " ")
          .replace(/\s*[\[\]<>]{1,}\s*/g, " ")
          .replace(
            /\b(endobj|obj|stream|endstream|xref|trailer|startxref)\b/gi,
            ""
          )
          .trim()
      )
      .filter((p) => p.length > 1 && !/^[\s\W]+$/.test(p));

    const result = filtered.join("\n\n").trim();
    if (!result) {
      let fallback = s
        .replace(
          /(\/[A-Za-z]+\s+)|(\<\<|\>\>)|(obj|endobj|stream|endstream|xref|trailer|startxref)/gi,
          " "
        )
        .replace(/[^ -~\n]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      return fallback.slice(0, 20000);
    }
    return result;
  };

  const getDocText = (doc) => {
    if (!doc) return "";
    if (doc.parsed_data) {
      try {
        if (typeof doc.parsed_data === "string") {
          const trimmed = doc.parsed_data.trim();
          if (
            (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
            (trimmed.startsWith("[") && trimmed.endsWith("]"))
          ) {
            const parsed = JSON.parse(trimmed);
            return JSON.stringify(parsed, null, 2);
          }
          return trimmed;
        } else {
          return JSON.stringify(doc.parsed_data, null, 2);
        }
      } catch {}
    }

    if (doc.extracted_text) {
      const text = String(doc.extracted_text);
      if (
        text.includes("%PDF") ||
        text.match(/\/Type\s+\/|endobj|obj|stream|endstream/)
      ) {
        return cleanPdfExtract(text);
      }
      return text.trim();
    }
    return "";
  };

  const openDocModal = (doc) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const closeDocModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
  };

  // NEW: open folder modal
  const openFolderModal = (folder) => {
    setSelectedFolder(folder);
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setSelectedFolder(null);
  };

  const groupDocumentsByFolder = () => {
    if (!projectData?.documents) return {};

    const grouped = {};
    DOCUMENT_CATEGORIES.forEach((category) => {
      grouped[category] = [];
    });

    projectData.documents.forEach((doc) => {
      const folder = doc.folder_name || "Misc";
      if (grouped[folder]) {
        grouped[folder].push(doc);
      } else {
        grouped["Misc"].push(doc);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-sky-600 mb-4" />
        <p className="text-lg text-gray-700 font-medium">
          Loading project details...
        </p>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-sky-50 to-sky-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
            <p className="text-red-600 text-lg font-semibold">
              No project data found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const project = projectData;
  const groupedDocs = groupDocumentsByFolder();

  return (
    <div className="min-h-screen p-2 bricolage-grotesque">
      <div className="max-w-full mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setActiveSection("projects")}
          className="group flex items-center mb-5 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-sky-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2 text-sky-600 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-gray-700 font-medium">Back to Projects</span>
        </button>

        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
          <div className="flex items-center mb-3 border-b border-gray-200 pb-2">
            <div className="bg-sky-500 p-2 rounded mr-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {project.name}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors">
              <Building2 className="w-4 h-4 text-sky-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  Address
                </p>
                <p className="text-gray-800 text-sm">{project.address}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-green-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  Client / Agency
                </p>
                <p className="text-gray-800 text-sm">{project.client_agency}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors">
              <FileText className="w-4 h-4 text-purple-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  Contract Amount
                </p>
                <p className="text-gray-800 font-semibold text-sm">
                  ₹{Number(project.contract_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4 text-orange-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  Start Date
                </p>
                <p className="text-gray-800 text-sm">{project.start_date}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4 text-red-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  End Date
                </p>
                <p className="text-gray-800 text-sm">{project.end_date}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-sky-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  Architect
                </p>
                <p className="text-gray-800 text-sm">
                  {project.architect_name}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 transition-colors col-span-2 lg:col-span-2">
              <Users className="w-4 h-4 text-teal-600 mt-1" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">
                  Subcontractors
                </p>
                <p className="text-gray-800 text-sm">
                  {parseSubcontractors(project.subcontractors)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section - Folder View (click opens modal) */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-500 p-2 rounded mr-2">
                <Folder className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Project Folders
              </h2>
              {/* Collapse/Expand Icon */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
              >
                {collapsed ? (
                  <ChevronDown className="w-5 h-5 text-gray-700" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Folder Grid */}
          {!collapsed && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {DOCUMENT_CATEGORIES.map((folder) => {
                const count = groupedDocs[folder]?.length || 0;
                return (
                  <div
                    key={folder}
                    onClick={() => count > 0 && openFolderModal(folder)}
                    className={`${
                      count > 0
                        ? "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                        : "opacity-50 cursor-not-allowed"
                    } bg-white rounded-xl border-2 border-gray-200 p-4 transition-all duration-200`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-blue-500 p-4 rounded-lg mb-3">
                        <Folder className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {folder}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {count} {count === 1 ? "document" : "documents"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-orange-500 p-2 rounded mr-2">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Project Tasks</h2>
          </div>

          {tasks.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-orange-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {task.title}
                          </span>
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-600 max-w-md truncate">
                          {task.description}
                        </td>
                        <td className="px-6 py-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "Medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No tasks found for this project.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Folder Modal: shows documents table for clicked folder */}
      {showFolderModal && selectedFolder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"
            onClick={closeFolderModal}
          />
          <div className="relative z-10 max-w-6xl w-full bg-white rounded-xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-[#DCDCDC] p-2 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/40 p-2 rounded-lg mr-4">
                  <Folder className="w-4 h-4 " />
                </div>
                <div>
                  <h3 className="text-lg font-bold ">{selectedFolder}</h3>
                  <p className="text-xs">
                    {groupedDocs[selectedFolder]?.length || 0}{" "}
                    {groupedDocs[selectedFolder]?.length === 1
                      ? "document"
                      : "documents"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeFolderModal}
                className="bg-white/20 hover:bg-white/30 p-2 cursor-pointer rounded-lg transition-colors"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Upload Date
                        </th>
                        <th className="px-6 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(groupedDocs[selectedFolder] || []).map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-sky-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {doc.file_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                              {doc.file_type}
                            </span>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                            {doc.upload_date
                              ? new Date(doc.upload_date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <div className="flex gap-2">
                              {doc.drive_file_id && (
                                <a
                                  href={`https://drive.google.com/file/d/${doc.drive_file_id}/view`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-sky-500 hover:text-sky-600 transition-all duration-200 flex items-center gap-1"
                                >
                                  Open <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {(groupedDocs[selectedFolder] || []).length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No documents in this folder.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
