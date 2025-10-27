import React, { useState, useEffect } from "react";
import { Upload, Download, Eye } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AddProject from "./AddProject";
import DocumentUploadModal from "./DocumentUploadModal";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { fetchProjectsApi } from "../../apiServices";

const PENDING_ACTION_KEY = "pending_action";

const ProjectsPage = ({ onViewDetails }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: "",
    address: "",
    client_agency: "",
    contract_amount: "",
    start_date: "",
    end_date: "",
    architect_name: "",
    subcontractors: [],
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

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

;

  useEffect(() => {
    const localData = getLocalProjects();
    if (localData && localData.length > 0) {
      setProjects(localData);
      setLoading(false);
    } else {
      fetchProjects();
    }
  }, []);

  const startGoogleAuth = async (action) => {
    try {
      if (action) {
        sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
        setPendingAction(action);
      }

      setScanning(true);
      const response = await fetch(
        "https://www.markupdesigns.net/mai-beta/api/documents/auth-url",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch auth URL");
      }

      const data = await response.json();
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      } else {
        throw new Error("auth_url not found in response");
      }
    } catch (error) {
      console.error("Error fetching auth_url:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to initiate Google authentication. Please try again.",
      });
      sessionStorage.removeItem(PENDING_ACTION_KEY);
      setPendingAction(null);
    } finally {
      setScanning(false);
    }
  };

  // === CHANGE: Add Project button will open the modal directly (no auth) ===
  const handleAddProjectClick = () => {
    setIsModalOpen(true);
  };

  const handleUploadClick = (projectId) => {
    if (!googleAccessToken) {
      startGoogleAuth({ type: "uploadDoc", projectId });
    } else {
      setSelectedProjectId(projectId);
      setIsUploadModalOpen(true);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (!code) return;

    (async () => {
      try {
        setScanning(true);
        const url = `https://www.markupdesigns.net/mai-beta/api/documents/auth-url?code=${encodeURIComponent(
          code
        )}`;
        const resp = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
            "Content-Type": "application/json",
          },
        });
        const text = await resp.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn("DEBUG: response not JSON; raw text:", text);
          data = { rawText: text };
        }

        const token =
          data.access_token ||
          data.accessToken ||
          data.token ||
          data?.data?.access_token ||
          data?.data?.accessToken ||
          null;

        if (!token) {
          console.error("DEBUG: no access token in exchange response", data);
          sessionStorage.removeItem(PENDING_ACTION_KEY);
          setPendingAction(null);
          navigate(location.pathname, { replace: true });
          return;
        }
        setGoogleAccessToken(token);
        const stored = sessionStorage.getItem(PENDING_ACTION_KEY);
        let action = null;
        if (stored) {
          try {
            action = JSON.parse(stored);
          } catch {
            action = null;
          }
        }
        action = pendingAction || action;
        if (action?.type === "addProject") {
          setIsModalOpen(true);
        } else if (action?.type === "uploadDoc") {
          setSelectedProjectId(action.projectId ?? null);
          setIsUploadModalOpen(true);
        } else {
        }
        sessionStorage.removeItem(PENDING_ACTION_KEY);
        setPendingAction(null);
        navigate(location.pathname, { replace: true });
      } catch (err) {
        console.error("DEBUG: error exchanging code for token:", err);
        Swal.fire({
          icon: "error",
          title: "Exchange failed",
          text: err.message || "See console for details",
        });
        sessionStorage.removeItem(PENDING_ACTION_KEY);
        setPendingAction(null);
        navigate(location.pathname, { replace: true });
      } finally {
        setScanning(false);
      }
    })();
  }, [location.search, navigate]);

  const handleUploadSuccess = (
    remoteDocs = [],
    generatedSubmittals = [],
    projectId = null
  ) => {
    const docsWithProject = remoteDocs.map((d) => ({ ...d, projectId }));
    setDocuments((prev) => [...docsWithProject, ...prev]);

    if (Array.isArray(generatedSubmittals) && generatedSubmittals.length) {
      const subs = generatedSubmittals.map((s) => ({
        ...s,
        parentProjectId: projectId,
      }));
      setProjects((prev) => [...subs, ...prev]);
    }
  };

  // Cancel handler for modal
  const cancelForm = () => {
    setIsModalOpen(false);
    setForm({
      id: null,
      name: "",
      address: "",
      client_agency: "",
      contract_amount: "",
      start_date: "",
      end_date: "",
      architect_name: "",
      subcontractors: [],
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const exportProjects = () => {
    if (!projects || projects.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Projects",
        text: "There are no projects to export.",
      });
      return;
    }
    // CSV Headers
    const headers = [
      "Name",
      "Address",
      "Client Agency",
      "Contract Amount",
      "Start Date",
      "End Date",
      "Architect Name",
      "Subcontractors",
      "Drive Folder ID",
    ];

    // Map projects to CSV rows
    const rows = projects.map((p) => [
      p.name || "",
      p.address || "",
      p.client_agency || "",
      p.contract_amount
        ? `$${parseFloat(p.contract_amount).toLocaleString()}`
        : "",
      p.start_date || "",
      p.end_date || "",
      p.architect_name || "",
      safeSubcontractors(p).join(", ") || "",
      p.drive_folder_id || "",
    ]);

    // Combine headers + rows
    const csvArray = [headers, ...rows];

    // Convert to CSV string
    const csvContent = csvArray
      .map((row) =>
        row
          .map((cell) => `"${(cell ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Exported",
      text: "Projects exported successfully!",
    });
  };

  const getDateColor = (date) => {
    const today = new Date();
    const targetDate = date ? new Date(date) : null;

    if (!targetDate) return "bg-gray-100 text-gray-800";

    const t = new Date(targetDate).setHours(0, 0, 0, 0);
    const n = new Date(today).setHours(0, 0, 0, 0);

    if (t < n) return "bg-red-100 text-red-800";
    if (t === n) return "bg-yellow-100 text-yellow-800";
    return "bg-teal-100 text-teal-800";
  };

  const safeSubcontractors = (project) => {
    try {
      if (!project?.subcontractors) return [];
      if (Array.isArray(project.subcontractors)) return project.subcontractors;
      return JSON.parse(project.subcontractors);
    } catch {
      return [];
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 -mt-2">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold whitespace-nowrap bricolage-grotesque text-gray-900">
            Projects Management
          </h1>
          <p className="text-gray-600 bricolage-grotesque text-sm md:text-base mt-1">
            Scan specifications and manage Project logs
          </p>
        </div>
        <div className="flex flex-row flex-nowrap justify-center gap-3 mt-3">
          <button
            onClick={exportProjects}
            className="flex items-center justify-center gap-2 px-4 py-2 cursor-pointer bg-[#312F30] text-white bricolage-grotesque rounded-full transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={handleAddProjectClick}
            disabled={scanning}
            className={`flex items-center justify-center gap-2 px-4 py-2 ${
              scanning
                ? "bg-gray-400 cursor-not-allowed bricolage-grotesque text-white"
                : "bg-white text-[#312F30] bricolage-grotesque cursor-pointer hover:bg-[#312F30] hover:text-white"
            } rounded-full transition-colors border border-[#312F30]`}
          >
            {scanning ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 bricolage-grotesque border-b-2 border-white rounded-full"></div>
                Loading...
              </div>
            ) : (
              <>
                <img
                  src="/mai-web/assets/Google.png"
                  alt="Add"
                  className="w-4 h-4"
                />
                Add Project
              </>
            )}
          </button>
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="flex items-center  bricolage-grotesque  justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl bricolage-grotesque shadow-lg border border-gray-200">
          <div className="bg-[#E9E9E9] rounded-md px-4 py-3">
            <h2 className="text-md bricolage-grotesque font-semibold text-[#5B5B5B]">
              Project Log ({projects.length} items)
            </h2>
          </div>

          <div className="overflow-x-auto overflow-y-hidden">
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
                    Subcontractors
                  </th>

                  {/* ✅ New Column for Project Details */}
                  <th className="px-4 py-2 whitespace-normal break-words">
                    Project Details
                  </th>

                  {/* <th className="px-4 py-2 whitespace-normal break-words">
                    Task Management
                  </th> */}
                  <th className="px-4 py-2 text-right">Upload Document</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-gray-900 whitespace-normal break-words">
                      <div className="inline-flex items-start rounded-full text-xs font-medium">
                        <span className="px-2 py-1 leading-snug break-words text-left">
                          {project.name || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-2 whitespace-normal break-words">
                      {project.address || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-normal break-words">
                      {project.client_agency || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-normal break-words">
                      {project.contract_amount
                        ? `$${parseFloat(
                            project.contract_amount
                          ).toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-normal break-words">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDateColor(
                          project.start_date
                        )}`}
                      >
                        {project.start_date
                          ? formatDate(project.start_date)
                          : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-normal break-words">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDateColor(
                          project.end_date
                        )}`}
                      >
                        {project.end_date ? formatDate(project.end_date) : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-normal break-words">
                      {project.architect_name || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-normal break-words">
                      {safeSubcontractors(project).join(", ") || "-"}
                    </td>

                    {/* ✅ Project Details Button */}
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => onViewDetails(project.id, project.name)}
                        title={`View details for ${project.name}`}
                        className="inline-flex cursor-pointer items-center justify-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>

                    {/* Upload Button */}
                    <td className="px-4 py-2 text-right">
                      <div className="flex  items-center justify-end flex-nowrap">
                        <button
                          title={`Upload document for ${project.name}`}
                          onClick={() => handleUploadClick(project.id)}
                          className="inline-flex cursor-pointer items-center justify-center w-9 h-9 rounded-md border border-gray-200 hover:bg-gray-50 transition"
                        >
                          <Upload className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddProject
        isOpen={isModalOpen}
        form={form}
        setForm={setForm}
        onCancel={cancelForm}
        googleAccessToken={googleAccessToken}
        fetchProjects={fetchProjects}
      />

      {/* DocumentUploadModal: pass googleAccessToken as prop */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedProjectId(null);
        }}
        onUploaded={handleUploadSuccess}
        targetProjectId={selectedProjectId}
        googleAccessToken={googleAccessToken}
        fetchProjects={fetchProjects}
      />
    </div>
  );
};

export default ProjectsPage;
