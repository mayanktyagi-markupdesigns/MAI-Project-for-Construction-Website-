import React, { useRef, useEffect, useState } from "react";
import Swal from "sweetalert2";

const PARSE_URL =
  "https://www.markupdesigns.net/mai-beta/api/ai/parse-uploaded-document";

const PENDING_ACTION_KEY = "mai_pending_action";

const AddProject = ({
  isOpen,
  form,
  setForm,
  onSave,
  isSaving: externalSaving = false,
  onCancel,
  googleAccessToken,
  fetchProjects,
}) => {
  const firstInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [localSaving, setLocalSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const saving = externalSaving || localSaving || processing;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const resetForm = () => {
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
    setUploadedFileName(null);
  };

  const escapeHtml = (unsafe) => {
    if (unsafe == null) return "";
    return String(unsafe)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const startGoogleAuth = async (action) => {
    try {
      if (action) {
        sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
      }
      const resp = await fetch(
        "https://www.markupdesigns.net/mai-beta/api/documents/auth-url",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to fetch Google auth URL");
      }

      const data = await resp.json();
      if (!data?.auth_url) throw new Error("auth_url not present in response");
      Swal.fire({
        title: "Redirecting to Google...",
        html: "You will be redirected to Google to authorize Drive access. After authorizing, you'll be brought back and project creation will continue.",
        allowOutsideClick: false,
        showConfirmButton: false,
      });
      setTimeout(() => {
        window.location.href = data.auth_url;
      }, 400);
    } catch (err) {
      console.error("startGoogleAuth error:", err);
      sessionStorage.removeItem(PENDING_ACTION_KEY);
      Swal.fire({
        icon: "error",
        title: "Authentication failed",
        text: err?.message || "Could not start Google authentication.",
      });
    }
  };

  const showLoadingSwal = (title = "Processing...", text = "Please wait") => {
    Swal.fire({
      title,
      html: text,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  };
  const createProjectRequest = async (projectData) => {
    try {
      setLocalSaving(true);
      setProcessing(true);
      showLoadingSwal(
        "Creating project...",
        "Please wait — this may take a few seconds."
      );

      const response = await fetch(
        "https://www.markupdesigns.net/mai-beta/api/projects",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        }
      );

      const respText = await response.text();
      let respJson = null;
      try {
        respJson = respText ? JSON.parse(respText) : null;
      } catch (e) {
        respJson = null;
      }

      if (!response.ok) {
        const errMsg =
          (respJson && respJson.message) ||
          respText ||
          `Failed to create project: ${response.status}`;
        Swal.close();
        throw new Error(errMsg);
      }

      const created = (respJson && (respJson.data || respJson)) || projectData;
      const toStore =
        created && Object.keys(created).length ? created : projectData;

      const existing = JSON.parse(localStorage.getItem("projectsData") || "[]");
      localStorage.setItem(
        "projectsData",
        JSON.stringify([toStore, ...existing])
      );

      if (created && (created.id || created.drive_folder_id || created._id)) {
        window.dispatchEvent(
          new CustomEvent("projectsUpdated", { detail: created })
        );
      } else {
        window.dispatchEvent(new Event("projectsUpdated"));
      }

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Project Created",
        text: "Project created successfully!",
      });

      fetchProjects?.();
      resetForm();
      onCancel?.();
      return { ok: true, created };
    } catch (err) {
      console.error("Error creating project:", err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.message || "Failed to create project. Please try again.",
      });
      return { ok: false, error: err };
    } finally {
      setLocalSaving(false);
      setProcessing(false);
    }
  };

  const fetchDriveProfile = async (token) => {
    try {
      const resp = await fetch(
        "https://www.markupdesigns.net/mai-beta/api/documents/drive-profile",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mai_token") || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ google_access_token: token }),
        }
      );
      if (!resp.ok) {
        return null;
      }
      const json = await resp.json();
      return json?.email || null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const runPendingIfAny = async () => {
      try {
        const pendingRaw = sessionStorage.getItem(PENDING_ACTION_KEY);
        if (!pendingRaw) return;
        const pending = JSON.parse(pendingRaw);
        if (!pending || pending.type !== "createProjectWithDrive") return;
        const token = googleAccessToken || pending.google_access_token || null;
        if (!token) return;
        const projectData = pending.projectData;
        if (!projectData) return;
        sessionStorage.removeItem(PENDING_ACTION_KEY);
        showLoadingSwal(
          "Resuming project creation...",
          "Completing Drive setup and creating the project — please wait."
        );
        await createProjectRequest({
          ...projectData,
          google_access_token: token,
        });
      } catch (err) {
        console.error("runPendingIfAny error:", err);
      }
    };

    runPendingIfAny();
  }, [googleAccessToken]);

  const parseSubcontractors = (value) => {
    if (!value) return [];
    if (Array.isArray(value))
      return value.map((v) => String(v).trim()).filter(Boolean);
    return String(value)
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const flattenParsed = (obj, prefix = "", out = {}) => {
    if (obj == null) return out;
    if (typeof obj !== "object" || obj instanceof Date) {
      out[prefix || "value"] = obj;
      return out;
    }
    if (Array.isArray(obj)) {
      const arePrimitives = obj.every((x) => typeof x !== "object");
      if (arePrimitives) {
        out[prefix || "value"] = obj;
        return out;
      }
      obj.forEach((el, i) =>
        flattenParsed(el, `${prefix}${prefix ? "." : ""}${i}`, out)
      );
      return out;
    }
    Object.keys(obj).forEach((k) => {
      const newPrefix = prefix ? `${prefix}.${k}` : k;
      const val = obj[k];
      if (val == null) return;
      if (typeof val === "object") {
        flattenParsed(val, newPrefix, out);
      } else {
        out[newPrefix] = val;
      }
    });
    return out;
  };

  const findBest = (flattened, candidates = []) => {
    for (const c of candidates) {
      if (flattened.hasOwnProperty(c)) return flattened[c];
    }
    const loweredKeys = Object.keys(flattened).map((k) => ({
      k,
      lk: k.toLowerCase(),
    }));
    for (const cand of candidates) {
      const lc = cand.toLowerCase();
      const found = loweredKeys.find(({ lk }) => lk.includes(lc));
      if (found) return flattened[found.k];
    }
    for (const cand of candidates) {
      const words = cand
        .toLowerCase()
        .split(/[_\s.\-]+/)
        .filter(Boolean);
      const found = loweredKeys.find(({ lk }) =>
        words.some((w) => lk.includes(w))
      );
      if (found) return flattened[found.k];
    }
    return undefined;
  };

  const tryParseDateToISO = (val) => {
    if (!val) return "";
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const parsed = Date.parse(String(val));
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  const mapParsedToForm = (parsed) => {
    if (!parsed || typeof parsed !== "object") return {};
    const flattened = flattenParsed(parsed);

    const direct = {
      name:
        parsed.project_name ??
        parsed.name ??
        parsed.title ??
        parsed.projectTitle,
      address: parsed.address ?? parsed.site ?? parsed.location,
      client_agency: parsed.client_agency ?? parsed.client ?? parsed.owner,
      contract_amount:
        parsed.contract_amount ??
        parsed.amount ??
        parsed.contract_value ??
        parsed.value,
      start_date: parsed.start_date ?? parsed.commence_date ?? parsed.from,
      end_date: parsed.end_date ?? parsed.complete_date ?? parsed.to,
      architect_name:
        parsed.architect_name ?? parsed.architect ?? parsed.consultant,
      subcontractors:
        parsed.subcontractors ??
        parsed.subcontractor ??
        parsed.contractors ??
        parsed.vendors,
    };

    const result = {};
    result.name =
      direct.name ??
      findBest(flattened, [
        "project_name",
        "projectname",
        "name",
        "title",
        "project.title",
      ]);
    result.address =
      direct.address ??
      findBest(flattened, ["address", "site", "location", "project_address"]);
    result.client_agency =
      direct.client_agency ??
      findBest(flattened, [
        "client_agency",
        "client",
        "owner",
        "agency",
        "clientname",
      ]);

    const contractRaw =
      direct.contract_amount ??
      findBest(flattened, [
        "contract_amount",
        "contract",
        "amount",
        "contract_value",
        "value",
        "total",
      ]);
    if (contractRaw != null) {
      const s = String(contractRaw).replace(/[^0-9.,-]/g, "");
      result.contract_amount = s.replace(/,/g, "");
    }

    const sd =
      direct.start_date ??
      findBest(flattened, [
        "start_date",
        "start",
        "commence",
        "from",
        "startdate",
      ]);
    const ed =
      direct.end_date ??
      findBest(flattened, ["end_date", "end", "complete", "to", "enddate"]);
    result.start_date = tryParseDateToISO(sd) || "";
    result.end_date = tryParseDateToISO(ed) || "";

    result.architect_name =
      direct.architect_name ??
      findBest(flattened, [
        "architect_name",
        "architect",
        "architectural",
        "consultant",
      ]);

    let subs =
      direct.subcontractors ??
      findBest(flattened, [
        "subcontractors",
        "subcontractor",
        "contractors",
        "vendors",
        "subcontractors_list",
      ]);
    if (subs != null) result.subcontractors = parseSubcontractors(subs);

    if (!result.name) {
      const candidates = Object.values(flattened).filter(
        (v) => typeof v === "string" && v.length > 5 && v.length < 100
      );
      if (candidates.length) result.name = candidates[0];
    }

    return result;
  };

  const callParseDocument = async (file) => {
    try {
      setProcessing(true);
      Swal.fire({
        title: "Parsing document...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = localStorage.getItem("mai_token");
      if (!token) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "No token",
          text: "Authentication token not found in localStorage (mai_token).",
        });
        setProcessing(false);
        return { ok: false };
      }
      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch(PARSE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await resp.json();
      Swal.close();

      if (!resp.ok) {
        const errMsg =
          (json && json.message) || `Failed to parse (${resp.status})`;
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errMsg,
        });
        setProcessing(false);
        return { ok: false, json };
      }

      const parsed = json?.data ?? {};
      const message = json?.message ?? "Document parsed";
      const mapped = mapParsedToForm(parsed);
      const subcontractorsDisplay =
        mapped.subcontractors && mapped.subcontractors.length
          ? mapped.subcontractors.join(", ")
          : Array.isArray(parsed.subcontractors)
          ? parsed.subcontractors.join(", ")
          : String(parsed.subcontractors || "-") || "-";

      const resultHtml = `
        <div style="text-align:left">
          <p><strong>${escapeHtml(message)}</strong></p>
          <table style="width:100%;margin-top:8px;border-collapse:collapse">
            <tbody>
              <tr><td style="padding:6px;font-weight:600">Project Name</td><td style="padding:6px">${escapeHtml(
                mapped.name ?? parsed.project_name ?? parsed.name ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">Address</td><td style="padding:6px">${escapeHtml(
                mapped.address ?? parsed.address ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">Client Agency</td><td style="padding:6px">${escapeHtml(
                mapped.client_agency ?? parsed.client_agency ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">Contract Amount</td><td style="padding:6px">${escapeHtml(
                mapped.contract_amount ?? parsed.contract_amount ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">Start Date</td><td style="padding:6px">${escapeHtml(
                mapped.start_date ?? parsed.start_date ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">End Date</td><td style="padding:6px">${escapeHtml(
                mapped.end_date ?? parsed.end_date ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">Architect</td><td style="padding:6px">${escapeHtml(
                mapped.architect_name ?? parsed.architect_name ?? "-"
              )}</td></tr>
              <tr><td style="padding:6px;font-weight:600">Subcontractors</td><td style="padding:6px">${escapeHtml(
                subcontractorsDisplay
              )}</td></tr>
            </tbody>
          </table>
        </div>
      `;

      Swal.fire({
        icon: "success",
        title: "Document parsed successfully",
        html: resultHtml,
        width: "600px",
      });

      setProcessing(false);
      return { ok: true, json, parsed, mapped };
    } catch (error) {
      console.error("Parse error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while parsing the document.",
      });
      setProcessing(false);
      return { ok: false, error };
    }
  };

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const res = await callParseDocument(file);
    if (!res?.ok) return;
    const parsed = res.parsed ?? res.json?.data ?? {};
    const mapped = res.mapped ?? {};

    const subcontractorsArr =
      mapped.subcontractors ?? parseSubcontractors(parsed.subcontractors);

    setForm((f) => ({
      ...f,
      name: mapped.name ?? parsed.project_name ?? parsed.name ?? f.name,
      address: mapped.address ?? parsed.address ?? f.address,
      client_agency:
        mapped.client_agency ?? parsed.client_agency ?? f.client_agency,
      contract_amount:
        mapped.contract_amount != null
          ? String(mapped.contract_amount)
          : parsed.contract_amount != null
          ? String(parsed.contract_amount)
          : f.contract_amount,
      start_date:
        mapped.start_date ??
        tryParseDateToISO(parsed.start_date) ??
        f.start_date,
      end_date:
        mapped.end_date ?? tryParseDateToISO(parsed.end_date) ?? f.end_date,
      architect_name:
        mapped.architect_name ?? parsed.architect_name ?? f.architect_name,
      subcontractors: subcontractorsArr.length
        ? subcontractorsArr
        : f.subcontractors ?? [],
      parsed_raw: parsed,
    }));
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onFileChange = async (e) => {
    const files = e.target.files;
    if (files?.length) await handleFiles(files);
  };

  const saveForm = async () => {
    if (!form?.name?.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation",
        text: "Project name is required.",
      });
      return;
    }

    const projectDataBase = {
      name: form.name,
      address: form.address,
      client_agency: form.client_agency,
      contract_amount: form.contract_amount,
      start_date: form.start_date,
      end_date: form.end_date,
      architect_name: form.architect_name,
      subcontractors: form.subcontractors ?? [],
      parsed_raw: form.parsed_raw ?? undefined,
    };

    const choice = await Swal.fire({
      title: "Save to Google Drive?",
      text: "Do you want to create this project and also save its folder structure to Google Drive?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save to Drive",
      cancelButtonText: "No, just create project",
    });

    if (!choice.isConfirmed) {
      await createProjectRequest({
        ...projectDataBase,
        google_access_token: "",
      });
      return;
    }

    if (googleAccessToken) {
      let profileEmail = null;
      try {
        profileEmail = await fetchDriveProfile(googleAccessToken);
      } catch (e) {
        profileEmail = null;
      }

      if (profileEmail) {
        const ok = await Swal.fire({
          title: "Confirm Google Account",
          html: `This will save to Google Drive account: <strong>${escapeHtml(
            profileEmail
          )}</strong>.<br/>Proceed?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, proceed",
          cancelButtonText: "Cancel",
        });
        if (!ok.isConfirmed) {
          Swal.fire({
            icon: "info",
            title: "Cancelled",
            text: "Project will be created without Drive integration.",
          });
          await createProjectRequest({
            ...projectDataBase,
            google_access_token: "",
          });
          return;
        }
      }
      await createProjectRequest({
        ...projectDataBase,
        google_access_token: googleAccessToken,
      });
      return;
    }
    const pendingAction = {
      type: "createProjectWithDrive",
      projectData: projectDataBase,
    };
    sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(pendingAction));
    Swal.fire({
      title: "Authorize Google Drive",
      html: "You will be redirected to Google to allow Drive access. After you grant permission and return, project creation will continue automatically.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    await startGoogleAuth(pendingAction);
  };

  const handleSubcontractorChange = (index, value) => {
    const updated = [...(form.subcontractors ?? [])];
    updated[index] = value;
    setForm((f) => ({ ...f, subcontractors: updated }));
  };

  const addSubcontractor = () =>
    setForm((f) => ({
      ...f,
      subcontractors: [...(f.subcontractors ?? []), ""],
    }));

  const removeSubcontractor = (index) =>
    setForm((f) => ({
      ...f,
      subcontractors: (f.subcontractors ?? []).filter((_, i) => i !== index),
    }));

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isOpen ? "bg-black/5 backdrop-blur-[2px]" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`bg-white w-full h-full md:h-auto md:w-full max-w-2xl md:rounded-xl md:shadow-lg transform transition-all ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 hidden"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Add Project"
      >
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold bricolage-grotesque">
            Add Project
          </h3>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onCancel?.();
            }}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Header */}
        <div className="px-6 mt-4 rounded-t-2xl">
          <h2 className="text-xl md:text-2xl font-bold bricolage-grotesque text-[#1E1E1E] text-start">
            Add Project
          </h2>
        </div>

        {/* Content container */}
        <div className="flex flex-col md:max-h-[85vh]">
          {/* Drag & Drop Upload area */}
          <div
            className={`p-4 border-dashed border-2 rounded-xl mx-6 mt-6 mb-2 transition ${
              dragActive
                ? "border-teal-700 bg-teal-50"
                : "border-gray-200 bg-white"
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Upload document to parse
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Drag & drop a PDF / image here or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                    className="underline font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  After upload we'll call the parser and fill the form
                  automatically.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {processing ? (
                  <div className="text-xs text-gray-600">Processing…</div>
                ) : uploadedFileName ? (
                  <div className="text-xs text-gray-700">
                    {uploadedFileName}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No file selected</div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="px-3 py-2 bg-[#312F30] text-white rounded-full text-sm"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div
            className="p-6 md:p-6 overflow-y-auto"
            style={{ maxHeight: "60vh" }}
          >
            <div className="space-y-4">
              {/* Project Name + Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Project Name
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="Project Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  />
                </div>
              </div>

              {/* Client Agency + Contract Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Client Agency
                  </label>
                  <input
                    type="text"
                    placeholder="Client Agency"
                    value={form.client_agency}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, client_agency: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Contract Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Contract Amount"
                    value={form.contract_amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contract_amount: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_date: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end_date: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Architect */}
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Architect Name
                </label>
                <input
                  type="text"
                  placeholder="Architect Name"
                  value={form.architect_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, architect_name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                />
              </div>

              {/* Subcontractors */}
              <div>
                <label className="block text-xs bricolage-grotesque font-medium text-[#000000] mb-1">
                  Subcontractors
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {(form.subcontractors ?? []).length === 0 && (
                    <div className="text-xs text-gray-500">
                      No subcontractors added.
                    </div>
                  )}

                  {(form.subcontractors ?? []).map((sub, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={sub}
                        onChange={(e) =>
                          handleSubcontractorChange(index, e.target.value)
                        }
                        placeholder={`Subcontractor ${index + 1}`}
                        className="flex-1 px-4 py-2.5 text-sm border border-[#C9C9C9] rounded-full outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubcontractor(index)}
                        disabled={saving}
                        className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={addSubcontractor}
                    disabled={saving}
                    className="px-4 py-2 text-sm bricolage-grotesque cursor-pointer bg-[#312F30] text-white rounded-full disabled:opacity-50"
                  >
                    + Add Subcontractor
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Add as many subcontractors as needed — this list will scroll
                    when long.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCancel?.();
              }}
              disabled={saving}
              className="px-4 py-2 border border-[#312F30] bricolage-grotesque cursor-pointer text-[#312F30] rounded-full transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveForm}
              disabled={saving}
              className="px-4 py-2 bg-teal-800 cursor-pointer text-white rounded-full hover:bg-teal-900 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {(saving || processing) && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {saving ? "Saving..." : "Save Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
