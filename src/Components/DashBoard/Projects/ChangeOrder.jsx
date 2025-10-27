import React, { useEffect, useState } from "react";
import { FileText, Search, Download, ExternalLink, Upload } from "lucide-react";
import Swal from "sweetalert2";
import { fetchProjectsApi } from "../../../apiServices";
import { useNavigate, useLocation } from "react-router-dom";
import DocumentUploadModal from "../DocumentUploadModal";

const PENDING_ACTION_KEY = "pendingChangeOrderAction";

export default function ChangeOrder() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

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
       console.log("Using localStorage data:", localData);
       setProjects(localData);
       setLoading(false);
     } else {
       console.log("No data in localStorage. Fetching from API...");
       fetchProjects();
     }
   }, []);
   

  // Google Auth Flow
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

        if (action?.type === "uploadDoc") {
          setSelectedProjectId(action.projectId ?? null);
          setIsUploadModalOpen(true);
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

  const handleUploadSuccess = () => {
    fetchProjects();
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Document uploaded successfully!",
    });
  };

  const parseSubcontractors = (val) => {
    if (!val) return "-";
    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      if (Array.isArray(parsed)) return parsed.join(", ");
      return String(parsed);
    } catch (e) {
      return String(val);
    }
  };

  const openChangeOrderFolder = (project) => {
    if (!project?.subfolders || project.subfolders.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No folder",
        text: "No subfolders available.",
      });
      return;
    }

    const ChangeOrderFolder = project.subfolders.find(
      (sf) => sf.name === "Change Order"
    );
    if (!ChangeOrderFolder) {
      Swal.fire({
        icon: "info",
        title: "No CADD Files folder",
        text: "Change Order folder not found in this project.",
      });
      return;
    }

    const url = `https://drive.google.com/drive/folders/${ChangeOrderFolder.drive_folder_id}`;
    window.open(url, "_blank");
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q) ||
      (p.client_agency || "").toLowerCase().includes(q) ||
      (p.architect_name || "").toLowerCase().includes(q)
    );
  });

  const exportCSV = (items = filteredProjects) => {
    const csvContent = [
      [
        "Name",
        "Address",
        "Client Agency",
        "Contract Amount",
        "Start Date",
        "End Date",
        "Architect Name",
        "Subcontractors",
        "Drive Folder ID",
      ],
      ...items.map((p) => [
        p.name,
        p.address,
        p.client_agency,
        p.contract_amount,
        p.start_date,
        p.end_date,
        p.architect_name,
        parseSubcontractors(p.subcontractors),
        p.drive_folder_id,
      ]),
    ]
      .map((row) =>
        row
          .map((cell) => `"${(cell ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire({
      icon: "success",
      title: "Exported",
      text: "Projects exported successfully!",
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

  return (
    <div className="max-w-full mx-auto p-2">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold whitespace-nowrap bricolage-grotesque text-gray-900">
          Change Order Management
          </h1>
          <p className="text-gray-600 bricolage-grotesque text-sm md:text-base mt-1">
            Scan specifications and manage Change Order
          </p>
        </div>

        <div className="hidden sm:flex flex-row flex-wrap justify-end md:flex-row gap-3 mt-3 md:mt-0">
          <button
            onClick={() => exportCSV()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#312F30] text-white bricolage-grotesque rounded-full transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="hidden sm:block bg-white rounded-xl bricolage-grotesque shadow-lg border border-gray-200 mb-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, address, client or architect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm sm:text-base"
            />
          </div>

          <div className="hidden sm:block text-sm text-gray-500 bricolage-grotesque">
            {projects.length} total
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:hidden w-full mb-6">
        <div className="flex items-center gap-2 w-full">
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

          <button
            onClick={() => exportCSV()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#312F30] text-white bricolage-grotesque rounded-full transition-colors text-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl bricolage-grotesque shadow-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-3 whitespace-normal break-words">Project Name</th>
              <th className="px-4 py-3 whitespace-normal break-words">
                Address
              </th>
              <th className="px-4 py-3 whitespace-normal break-words">
                Client Agency
              </th>
              <th className="px-4 py-3 whitespace-normal break-words">
                Contract Amount
              </th>
              <th className="px-4 py-3 whitespace-normal break-words">
                Start Date
              </th>
              <th className="px-4 py-3 whitespace-normal break-words">
                End Date
              </th>
              <th className="px-4 py-3 whitespace-normal break-words">
                Architect Name
              </th>
              <th className="px-4 py-3 whitespace-normal break-words">
                Subcontractors
              </th>
              <th className="px-4 py-3">Upload Document</th>
              <th className="px-4 py-3">Open Drive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-500">
                  Loading projects...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center">
                  <div className="mx-auto inline-block text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900">
                      No projects found
                    </div>
                    <div className="text-gray-500 mt-2">
                      Try changing your search or check back later.
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">
                    {p.name || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-normal break-words">
                    {p.address || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-normal break-words">
                    {p.client_agency || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-normal break-words">
                    {p.contract_amount
                      ? `$${Math.round(p.contract_amount).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium shadow ${
                        p.start_date
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.start_date ? formatDate(p.start_date) : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium shadow ${
                        p.end_date
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.end_date ? formatDate(p.end_date) : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-normal break-words">
                    {p.architect_name || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-normal break-words">
                    {parseSubcontractors(p.subcontractors) || "-"}
                  </td>

                  {/* Upload Document Column */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUploadClick(p.id)}
                      className="inline-flex items-center gap-2 cursor-pointer px-3 py-1 border border-blue-500 rounded-md text-sm transition-colors"
                      disabled={scanning}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </td>

                  {/* Drive Column */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openChangeOrderFolder(p)}
                      className="inline-flex items-center gap-2  cursor-pointer px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Drive
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DocumentUploadModal - Add your modal component here */}
      {isUploadModalOpen && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedProjectId(null);
          }}
          onUploaded={handleUploadSuccess}
          targetProjectId={selectedProjectId}
          googleAccessToken={googleAccessToken}
          defaultCategory="Change Order"
        />
      )}
    </div>
  );
}
