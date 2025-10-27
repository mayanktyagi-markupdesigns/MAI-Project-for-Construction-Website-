import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,

  Download,
  X,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchProjectsApi } from "../../apiServices";

const PENDING_ACTION_KEY = "mai_pending_action";

export default function DocumentParsing() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scanning, setScanning] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

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
      fetchProjects();
    }
  }, []);

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

        if (action?.type === "uploadDoc" && action?.documentId) {
          await parseDocuments([{ documentId: action.documentId }]);
          await fetchProjects();
        } else if (
          action?.type === "uploadDocMulti" &&
          Array.isArray(action?.documentIds)
        ) {
          const docs = action.documentIds.map((id) => ({ documentId: id }));
          await parseDocuments(docs);
          await fetchProjects();
        } else if (action?.type === "uploadDoc" && action?.projectId) {
          await fetchProjects();
        }

        sessionStorage.removeItem(PENDING_ACTION_KEY);
        navigate(location.pathname, { replace: true });
      } catch (err) {
        console.error("DEBUG: error exchanging code for token:", err);
        Swal.fire({
          icon: "error",
          title: "Exchange failed",
          text: err.message || "See console for details",
        });
        sessionStorage.removeItem(PENDING_ACTION_KEY);
        navigate(location.pathname, { replace: true });
      } finally {
        setScanning(false);
      }
    })();
  }, [location.search, navigate]);

  const startGoogleAuth = async (action = null) => {
    try {
      if (action) {
        sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
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
    } finally {
      setScanning(false);
    }
  };

  const fetchParseDocumentRaw = useCallback(async (documentId) => {
    const token = localStorage.getItem("mai_token");
    if (!token) throw new Error("Authentication token not found (mai_token)");

    const resp = await fetch(
      "https://www.markupdesigns.net/mai-beta/api/ai/parse-document",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: documentId }),
      }
    );

    const json = await resp.json();
    if (!resp.ok) {
      const errMsg = (json && json.message) || "Failed to parse document.";
      throw new Error(errMsg);
    }

    return json;
  }, []);

  // ===== Helper: escape html so we can safely inject into Swal html =====
  const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // ===== Helper: pretty format values (arrays, objects, primitives) =====
  const formatValueForHtml = (val) => {
    if (val === null || val === undefined) return "-";
    if (Array.isArray(val)) {
      if (val.length === 0) return "-";
      // join simple array values; if array has objects, pretty print each item
      const containsObject = val.some(
        (v) => typeof v === "object" && v !== null
      );
      if (!containsObject) {
        return escapeHtml(val.join(", "));
      }
      // array with objects -> pretty JSON
      return `<pre style="white-space:pre-wrap;margin:6px 0;padding:8px;border-radius:8px;background:#f7fafc;border:1px solid #e6edf3">${escapeHtml(
        JSON.stringify(val, null, 2)
      )}</pre>`;
    }
    if (typeof val === "object") {
      return `<pre style="white-space:pre-wrap;margin:6px 0;padding:8px;border-radius:8px;background:#f7fafc;border:1px solid #e6edf3">${escapeHtml(
        JSON.stringify(val, null, 2)
      )}</pre>`;
    }
    // primitive
    return escapeHtml(String(val));
  };

  // ===== Full dynamic renderer: will render *all* keys in the parsed object =====
  const generateDynamicHtmlForParsedData = (titleMessage, parsedObj = {}) => {
    // normalize parsedObj — if server returns {data: {...}} handle upstream; but here we assume parsedObj is the object to inspect.
    if (!parsedObj || typeof parsedObj !== "object") {
      const msg =
        typeof parsedObj === "string" ? parsedObj : "No structured data found";
      return `<div><strong>${escapeHtml(
        titleMessage
      )}</strong><div style="margin-top:8px">${escapeHtml(msg)}</div></div>`;
    }

    const entries = Object.entries(parsedObj);

    if (!entries.length) {
      return `<div><strong>${escapeHtml(
        titleMessage
      )}</strong><div style="margin-top:8px">No fields detected in parsed data.</div></div>`;
    }

    const rowsHtml = entries
      .map(([key, value]) => {
        const displayKey = escapeHtml(key);
        const displayVal = formatValueForHtml(value);
        return `<tr style="vertical-align:top;border-bottom:1px solid #eef2f7">
                  <td style="padding:10px 8px;font-weight:700;width:30%;min-width:160px;background:#fff">${displayKey}</td>
                  <td style="padding:10px 8px">${displayVal}</td>
                </tr>`;
      })
      .join("");

    const html = `
      <div style="text-align:left; font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
        <p style="margin:0 0 8px 0"><strong>${escapeHtml(
          titleMessage
        )}</strong></p>
        <div style="overflow:auto; max-height:420px; padding-right:8px">
          <table style="width:100%;border-collapse:collapse">
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
    return html;
  };

  // ===== Parse single document & show dynamic modal =====
  const callParseDocument = async (documentId) => {
    try {
      Swal.fire({
        title: "Parsing document...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const json = await fetchParseDocumentRaw(documentId);
      Swal.close();

      const parsed = json?.data ?? {};
      const message = json?.message ?? "Document parsed";

      const resultHtml = generateDynamicHtmlForParsedData(message, parsed);

      Swal.fire({
        icon: "success",
        title: "Document parsed successfully",
        html: resultHtml,
        width: "700px",
      });

      return { ok: true, json };
    } catch (error) {
      console.error("Parse error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "An unexpected error occurred while parsing the document.",
      });
      return { ok: false, error };
    }
  };

  // ===== Parse multiple documents (keeps dynamic display for each) =====
  const parseDocuments = async (docs = []) => {
    if (!docs.length) return { ok: false, error: "No documents provided" };

    Swal.fire({
      title: `Parsing ${docs.length} document(s)...`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const results = [];

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      try {
        const json = await fetchParseDocumentRaw(doc.documentId);
        results.push({
          ok: true,
          documentId: doc.documentId,
          fileName: doc.fileName,
          projectId: doc.projectId,
          json,
        });
      } catch (err) {
        results.push({
          ok: false,
          documentId: doc.documentId,
          fileName: doc.fileName,
          projectId: doc.projectId,
          error: err.message,
        });
      }
    }

    Swal.close();

    const sections = results.map((r) => {
      if (!r.ok) {
        return `<div style="margin-bottom:12px;"><strong>${escapeHtml(
          r.fileName ?? r.documentId
        )} — Error</strong><div>${escapeHtml(r.error)}</div></div>`;
      }
      const parsed = r.json?.data ?? {};
      const message = r.json?.message ?? "Document parsed";
      const html = generateDynamicHtmlForParsedData(message, parsed);
      return `<div style="margin-bottom:18px"><h3 style="margin:0 0 6px 0">${escapeHtml(
        r.fileName ?? r.documentId
      )}</h3>${html}</div>`;
    });

    const finalHtml = `<div style="text-align:left">${sections.join("")}</div>`;

    Swal.fire({
      icon: "success",
      title: `Parsed ${results.filter((r) => r.ok).length} / ${results.length}`,
      html: finalHtml,
      width: "880px",
      customClass: {
        popup: "bricolage-grotesque",
      },
    });

    return { ok: true, results };
  };

  const handleSelectDocument = async (project) => {
    const docs = Array.isArray(project.documents) ? project.documents : [];

    if (!docs.length) {
      Swal.fire({
        icon: "info",
        title: "No documents",
        text: "This project has no documents to select.",
      });
      return;
    }

    let folders = [];
    if (Array.isArray(project.subfolders) && project.subfolders.length) {
      folders = project.subfolders.map((f) => (f && f.name ? f.name : ""));
    } else {
      const set = new Set();
      docs.forEach((d) => set.add(d.folder_name || "Unsorted"));
      folders = Array.from(set);
    }
    if (folders.length === 0) folders = ["Unsorted"];

    const folderOptionsHtml = folders
      .map((name, idx) => {
        const safe = escapeHtml(name || "Unsorted");
        return `<option value="${escapeHtml(name)}"${
          idx === 0 ? " selected" : ""
        }>${safe}</option>`;
      })
      .join("");

    const docsForFolder = docs.filter(
      (d) => (d.folder_name || "Unsorted") === (folders[0] || "Unsorted")
    );

    const docsOptionsHtml =
      docsForFolder.length > 0
        ? docsForFolder
            .map((d) => {
              const label = `${d.file_name || "Untitled"}${
                d.folder_name ? ` (${d.folder_name})` : ""
              }`;
              const id = d.id ?? d.document_id ?? "";
              return `<option value="${escapeHtml(id)}">${escapeHtml(
                label
              )}</option>`;
            })
            .join("")
        : `<option value="">No documents in this folder</option>`;

    const html = `
      <style>
        .custom-select-wrapper { position: relative; width: 100%; }
        .custom-select { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; }
        .custom-select:focus { outline: none; border-color: #312F30; }
        .select-label{ font-weight:600; margin-bottom:6px; display:block; }
      </style>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div>
          <label class="select-label">Select Folder</label>
          <select id="folderSelect" class="custom-select">${folderOptionsHtml}</select>
        </div>
        <div>
          <label class="select-label">Select Documents (multiple)</label>
          <select id="docSelect" class="custom-select" multiple size="6">${docsOptionsHtml}</select>
          <div style="font-size:12px;color:#6b7280;margin-top:6px">Hold Ctrl/Cmd (or Shift) to select multiple documents. Selected documents will be added to the list below.</div>
        </div>
      </div>
    `;

    const { value: selectedIds, isConfirmed } = await Swal.fire({
      title: "Choose Folder & Documents",
      html,
      width: "700px",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add to selection",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const folderEl = document.getElementById("folderSelect");
        const docEl = document.getElementById("docSelect");
        if (!folderEl || !docEl) return;

        const populateDocs = (folderName) => {
          const filtered = docs.filter(
            (d) => (d.folder_name || "Unsorted") === (folderName || "Unsorted")
          );
          if (!filtered.length) {
            docEl.innerHTML = `<option value="">No documents in this folder</option>`;
            docEl.disabled = true;
          } else {
            docEl.disabled = false;
            docEl.innerHTML = filtered
              .map((d) => {
                const label = `${d.file_name || "Untitled"}${
                  d.folder_name ? ` (${d.folder_name})` : ""
                }`;
                const id = d.id ?? d.document_id ?? "";
                return `<option value="${escapeHtml(id)}">${escapeHtml(
                  label
                )}</option>`;
              })
              .join("");
          }
        };

        folderEl.addEventListener("change", (e) => {
          populateDocs(e.target.value);
        });

        populateDocs(folderEl.value);
      },
      preConfirm: () => {
        const el = document.getElementById("docSelect");
        if (!el) return [];
        const selected = Array.from(el.selectedOptions).map((o) => ({
          value: o.value,
          text: o.text,
        }));
        if (!selected.length) {
          Swal.showValidationMessage(
            "Please select at least one document to add"
          );
        }
        return selected;
      },
    });

    if (!isConfirmed || !selectedIds || !selectedIds.length) return;

    const additions = selectedIds.map((s) => ({
      projectId: project.id,
      projectName: project.name,
      documentId: s.value,
      fileName: s.text,
    }));

    setSelectedDocs((prev) => {
      const map = new Map(prev.map((x) => [x.documentId, x]));
      additions.forEach((a) => map.set(a.documentId, a));
      return Array.from(map.values());
    });
  };

  const removeSelectedDoc = (docId) => {
    setSelectedDocs((prev) => prev.filter((d) => d.documentId !== docId));
  };

  const clearSelectedDocs = () => setSelectedDocs([]);

  const parseSelected = async () => {
    if (!selectedDocs.length) {
      Swal.fire({
        icon: "info",
        title: "No documents selected",
        text: "Please add documents to the selection first.",
      });
      return;
    }

    if (!googleAccessToken) {
      await startGoogleAuth({
        type: "uploadDocMulti",
        documentIds: selectedDocs.map((d) => d.documentId),
      });
      return;
    }

    await parseDocuments(selectedDocs);
    await fetchProjects();
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

  const exportCSV = (items = projects) => {
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
    if (isNaN(date.getTime())) return dateString || "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-full mx-auto p-2  min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl bricolage-grotesque font-bold text-gray-900">
            AI Document Parsing
          </h1>
          <p className="text-gray-600 bricolage-grotesque">
            Scan specifications and manage Document with AI assistance
          </p>
        </div>

        <div className="hidden sm:block items-center gap-3">
          <button
            onClick={() => exportCSV()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#312F30] text-white bricolage-grotesque rounded-full hover:bg-[#1f1d1e] transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Compact Selected Documents Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl bricolage-grotesque shadow-md border border-indigo-200 mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Selected Documents
              </h2>
              <p className="text-xs text-gray-600">
                {selectedDocs.length === 0
                  ? "No documents selected"
                  : `${selectedDocs.length} document${
                      selectedDocs.length > 1 ? "s" : ""
                    } ready to parse`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={parseSelected}
              disabled={selectedDocs.length === 0}
              className={`inline-flex items-center cursor-pointer gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
                selectedDocs.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Parse
            </button>
            <button
              onClick={clearSelectedDocs}
              disabled={selectedDocs.length === 0}
              className={`inline-flex items-center cursor-pointer gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                selectedDocs.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {selectedDocs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-indigo-200">
            <FileText className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium mb-0.5">
              No documents selected yet
            </p>
            <p className="text-xs text-gray-500">
              Use “Select Document” to add files
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {selectedDocs.map((d, idx) => (
              <div
                key={d.documentId}
                className="bg-white rounded-lg border border-indigo-200 p-3 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="bg-indigo-100 p-1 rounded-md flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-gray-900 truncate">
                        {d.fileName}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {d.projectName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSelectedDoc(d.documentId)}
                    className="flex-shrink-0 p-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] text-gray-400">Ready</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl bricolage-grotesque shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-b-2 border-gray-200">
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Project Name
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Address
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Client Agency
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Contract Amount
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Start Date
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  End Date
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Architect Name
                </th>
                <th className="px-4 py-3 whitespace-normal break-words font-semibold">
                  Subcontractors
                </th>
                <th className="px-4 py-3 font-semibold">Select Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span>Loading projects...</span>
                    </div>
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
                  <tr key={p.id} className=" transition-colors">
                    <td className="px-4 py-3 text-gray-900 whitespace-normal break-words">
                      <div className="inline-flex items-start rounded-full text-xs font-medium">
                        <span className="px-2 py-1 leading-snug break-words text-left font-semibold">
                          {p.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-normal break-words text-gray-700">
                      {p.address || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-normal break-words text-gray-700">
                      {p.client_agency || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-normal break-words">
                      <span className="font-semibold text-green-700">
                        $
                        {p.contract_amount
                          ? `${Math.round(
                              Number(p.contract_amount)
                            ).toLocaleString()}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-900 whitespace-normal break-words">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          p.start_date
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.start_date ? formatDate(p.start_date) : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-900 whitespace-normal break-words">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          p.end_date
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.end_date ? formatDate(p.end_date) : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-normal break-words text-gray-700">
                      {p.architect_name || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-normal break-words text-gray-700">
                      {parseSubcontractors(p.subcontractors) || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
                        <button
                          onClick={() => handleSelectDocument(p)}
                          className="inline-flex items-center cursor-pointer gap-2 px-3 py-1 border rounded-md text-sm hover:bg-gray-50 whitespace-nowrap flex-shrink-0"
                        >
                          <FileText className="w-4 h-4" />
                          Select Document
                        </button>

                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                          <span className="text-xs font-semibold text-gray-700">
                            {p.documents_count ??
                              (Array.isArray(p.documents)
                                ? p.documents.length
                                : 0)}
                          </span>
                          <span className="text-xs text-gray-500">files</span>
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
    </div>
  );
}
