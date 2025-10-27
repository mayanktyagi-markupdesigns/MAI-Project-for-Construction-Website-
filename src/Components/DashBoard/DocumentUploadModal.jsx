import React, { useRef, useState, useEffect } from "react";
import { Upload, FileText, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_TOTAL_SIZE_BYTES = 200 * 1024 * 1024;

const DOCUMENT_CATEGORIES = [
  "BID",
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
  "Submittals",
  "Templates",
];

const DocumentUploadModal = ({
  isOpen,
  onClose,
  onUploaded,
  targetProjectId,
  googleAccessToken,
  fetchProjects,
  defaultCategory = "BID",
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processedDocs, setProcessedDocs] = useState([]);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isOpen) {
      setProcessedDocs([]);
      setError(null);
      setIsDragActive(false);
    } else {
      setSelectedCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  const validateFiles = (files) => {
    if (!files.length) return { ok: false, message: "No files selected." };

    // check types
    for (let f of files) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        return {
          ok: false,
          message: `Unsupported file type: ${f.name}. Allowed: PDF, DOC, DOCX.`,
        };
      }
    }

    // check total size
    const total = files.reduce((s, f) => s + f.size, 0);
    if (total > MAX_TOTAL_SIZE_BYTES) {
      return {
        ok: false,
        message: `Total files size exceeds ${(
          MAX_TOTAL_SIZE_BYTES /
          (1024 * 1024)
        ).toFixed(0)} MB.`,
      };
    }

    return { ok: true };
  };

  const uploadToApi = async (files) => {
    setIsUploading(true);
    setError(null);
    try {
      const validation = validateFiles(files);
      if (!validation.ok) {
        throw new Error(validation.message);
      }

      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));
      formData.append("project_id", targetProjectId ?? "");
      formData.append("subfolder", selectedCategory);
      if (googleAccessToken) {
        formData.append("google_access_token", googleAccessToken);
      }

      const res = await fetch(
        "https://www.markupdesigns.net/mai-beta/api/documents/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        let msg = `Upload failed (${res.status})`;
        try {
          const json = await res.json();
          if (json?.message) msg = json.message;
        } catch (e) {}
        throw new Error(msg);
      }

      const data = await res.json();

      if (data.success || data?.data) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          html:
            `${data.message ?? "Files uploaded successfully."}` +
            (data.drive_link
              ? ` <br/><a href="${data.drive_link}" target="_blank" class="text-sky-600 underline">Open in Google Drive</a>`
              : ""),
          showCloseButton: true,
        });

        const remoteDocs = Array.from(files).map((file, index) => ({
          id: Date.now() + index,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          uploadDate: new Date().toLocaleDateString(),
          status: "processed",
          projectId: targetProjectId,
          category: selectedCategory,
        }));

        setProcessedDocs(remoteDocs);
        await fetchProjects();
        onUploaded(remoteDocs, data.generatedSubmittals ?? [], targetProjectId);

        onClose();
      } else {
        throw new Error(
          data.message || "Upload response missing success flag."
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err?.message || "Upload failed";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: msg,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    uploadToApi(files);
    e.target.value = "";
  };

  // Drag & drop handlers
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only turn off when leaving the drop zone element (not child)
    if (e.currentTarget === e.target) setIsDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const dtFiles = Array.from(e.dataTransfer.files || []);
    if (!dtFiles.length) return;
    uploadToApi(dtFiles);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isOpen ? "bg-black/5 backdrop-blur-[2px]" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative transform transition-all ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 hidden"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            id="upload-modal-title"
            className="text-lg font-semibold flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Documents{" "}
            {targetProjectId ? `for Project #${targetProjectId}` : ""}
          </h3>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-black rounded-lg transition-colors text-sm font-medium"
            >
              {selectedCategory}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                {DOCUMENT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-sky-50 transition-colors text-sm ${
                      selectedCategory === category
                        ? "bg-sky-100 text-sky-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? "border-sky-400 bg-sky-50"
                : "border-dashed border-gray-300 bg-white hover:border-sky-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Uploading…</p>
                <p className="text-sm text-gray-500">
                  Sending files to server and processing. Please wait.
                </p>
              </div>
            ) : (
              <div>
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Specification Documents
                </p>
                <p className="text-sm text-gray-500">
                  Click to browse or drag &amp; drop files here. Supports PDF,
                  DOC, DOCX
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Tip: You can select multiple files
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded">
              {error}
            </div>
          )}

          {processedDocs.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Processed Documents
              </h4>
              <div className="grid gap-2">
                {processedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.size} • Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full border border-teal-200">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isUploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
