import React, { useEffect, useState } from "react";
import { FileText, Search, Download, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";
import { fetchProjectsApi } from "../../apiServices";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const openDriveFolder = (folderId) => {
    if (!folderId) {
      Swal.fire({
        icon: "info",
        title: "No folder",
        text: "Drive folder not available.",
      });
      return;
    }
    const url = `https://drive.google.com/drive/folders/${folderId}`;
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
        "Documents Count",
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
        p.documents_count,
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
            Submittals Library
          </h1>
          <p className="text-gray-600 bricolage-grotesque text-sm md:text-base mt-1">
            Scan specifications and manage submittal logs
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

          {/* Total projects - hidden on small screens */}
          <div className="hidden sm:block text-sm text-gray-500 bricolage-grotesque">
            {projects.length} total
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:hidden w-full mb-6">
        <div className="flex items-center gap-2 w-full">
          {/* Search input */}
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

          {/* Export button */}
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
              <th className="px-4 py-3 whitespace-normal break-words">
                Project Name
              </th>
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
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  Loading projects...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center">
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
                    <div className="inline-flex items-start rounded-full text-xs font-medium ">
                      <span className="px-2 py-1 leading-snug break-words text-left">
                        {p.name || "-"}
                      </span>
                    </div>
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

                  {/* Upload Document column (button always single line) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap ">
                      <button
                        onClick={() => openDriveFolder(p.drive_folder_id)}
                        className="inline-flex items-center gap-2 px-3 py-1 border rounded-md text-sm hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Drive
                      </button>
                      <div className="text-xs text-gray-600">
                        {p.documents_count ?? 0} files
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
