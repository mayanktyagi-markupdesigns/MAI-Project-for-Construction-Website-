import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import { fetchAllTasksApi, fetchReportDataApi } from "../../apiServices";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/* ---------- Helpers ---------- */
const safeParseInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
};

const formatDateKey = (iso) => {
  try {
    const d = new Date(iso);
    if (isNaN(d)) return String(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(iso);
  }
};

// Normalize possible API wrappers into an array
const normalizeProjectsResponse = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (resp.data && Array.isArray(resp.data)) return resp.data;
  if (resp.projects && Array.isArray(resp.projects)) return resp.projects;
  if (resp.success && Array.isArray(resp.data)) return resp.data;
  const maybe = Object.values(resp).find((v) => Array.isArray(v));
  return Array.isArray(maybe) ? maybe : [];
};

const normalizeTasksResponse = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (resp.data && Array.isArray(resp.data)) return resp.data;
  if (resp.tasks && Array.isArray(resp.tasks)) return resp.tasks;
  if (resp.success && Array.isArray(resp.data)) return resp.data;
  const maybe = Object.values(resp).find((v) => Array.isArray(v));
  return Array.isArray(maybe) ? maybe : [];
};

/* ---------- UI Card ---------- */
const Card = ({ title, value, iconSrc, bgColor, valueColor }) => (
  <div className="bg-white rounded-xl p-5 flex items-center justify-between border border-[#D8D8D8]">
    <div>
      <div className="text-[#A9A9A9] bricolage-grotesque text-sm font-semibold">
        {title}
      </div>
      <div
        className={`text-3xl font-semibold bricolage-grotesque mt-1 ${valueColor}`}
      >
        {value}
      </div>
    </div>
    <div className={`p-3 rounded-full ${bgColor}`}>
      <img
        src={iconSrc}
        alt={`${title} Icon`}
        className="w-4 h-4 object-contain"
      />
    </div>
  </div>
);

/* ---------- Component ---------- */
const ReportsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [error, setError] = useState(null);
  const [apiTasksData, setApiTasksData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchReportDataApi();

        if (cancelled) return;

        // Extract projects
        const projectsArr = normalizeProjectsResponse(raw);
        setProjects(projectsArr);

        // Extract tasks data from API response
        const tasksData = raw?.tasks || [];
        setApiTasksData(tasksData);

        // Extract totals from API response
        const totalDocs =
          raw?.total_documents ||
          projectsArr.reduce((s, p) => s + safeParseInt(p.documents_count), 0);
        const totalTasksCount =
          raw?.total_tasks ||
          projectsArr.reduce((s, p) => s + safeParseInt(p.tasks_count), 0);

        setTotalDocuments(totalDocs);
        setTotalTasks(totalTasksCount);

        // Set default selection
        if (projectsArr.length === 0) {
          setSelectedProjectId("all");
        } else {
          const exists = projectsArr.some(
            (p) => String(p.id) === String(selectedProjectId)
          );
          if (!exists) setSelectedProjectId("all");
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to fetch report data. Check console for details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Pie dataset ---------- */
  const pieData = useMemo(() => {
    try {
      if (selectedProjectId === "all") {
        const docs = totalDocuments;
        const tasks = totalTasks;
        return {
          labels: ["Documents", "Tasks"],
          datasets: [
            {
              data: [docs, tasks],
              backgroundColor: ["#FF0000", "#EC8600"],
              borderWidth: 0,
            },
          ],
        };
      }

      const proj = projects.find(
        (p) => String(p.id) === String(selectedProjectId)
      );

      if (!proj) {
        return {
          labels: ["No Data"],
          datasets: [{ data: [1], backgroundColor: ["#F0F0F0"] }],
        };
      }

      const docCount = safeParseInt(proj.documents_count);
      const taskCount = safeParseInt(proj.tasks_count);

      if (docCount === 0 && taskCount === 0) {
        return {
          labels: ["No Data"],
          datasets: [{ data: [1], backgroundColor: ["#F0F0F0"] }],
        };
      }

      return {
        labels: ["Documents", "Tasks"],
        datasets: [
          {
            data: [docCount, taskCount],
            backgroundColor: ["#FF0000", "#85C46A"],
            borderWidth: 0,
          },
        ],
      };
    } catch (e) {
      console.error("pieData build error:", e);
      return {
        labels: ["No Data"],
        datasets: [{ data: [1], backgroundColor: ["#F0F0F0"] }],
      };
    }
  }, [selectedProjectId, projects, totalDocuments, totalTasks]);

  /* ---------- Line chart data ---------- */
  const lineChartData = useMemo(() => {
    try {
      if (selectedProjectId === "all") {
        // Use API tasks data for "All Projects"
        if (!apiTasksData || apiTasksData.length === 0) {
          return {
            labels: [],
            datasets: [
              {
                label: "Tasks",
                data: [],
                borderColor: "#FF0000",
                backgroundColor: "#FF0000",
                tension: 0.4,
                fill: false,
                pointBorderColor: "#FF0000",
                pointBackgroundColor: "#FF0000",
              },
            ],
          };
        }

        // Sort tasks by date
        const sortedTasks = [...apiTasksData].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });

        const labels = sortedTasks.map((t) => t.date);
        const data = sortedTasks.map((t) => safeParseInt(t.count));

        return {
          labels,
          datasets: [
            {
              label: "Tasks",
              data,
              borderColor: "#FF0000",
              backgroundColor: "#FF0000",
              tension: 0.4,
              fill: false,
              pointBorderColor: "#FF0000",
              pointBackgroundColor: "#FF0000",
            },
          ],
        };
      }

      // For specific project - show single data point
      const proj = projects.find(
        (p) => String(p.id) === String(selectedProjectId)
      );

      if (!proj) {
        return {
          labels: [],
          datasets: [
            {
              label: "Tasks",
              data: [],
              borderColor: "#FF0000",
              backgroundColor: "#FF0000",
              tension: 0.4,
              fill: false,
              pointBorderColor: "#FF0000",
              pointBackgroundColor: "#FF0000",
            },
          ],
        };
      }

      const taskCount = safeParseInt(proj.tasks_count);
      const dateLabel = formatDateKey(
        proj.created_at || proj.start_date || new Date().toISOString()
      );

      return {
        labels: [dateLabel],
        datasets: [
          {
            label: "Tasks",
            data: [taskCount],
            borderColor: "#FF0000",
            backgroundColor: "#FF0000",
            tension: 0.4,
            fill: false,
            pointBorderColor: "#FF0000",
            pointBackgroundColor: "#FF0000",
          },
        ],
      };
    } catch (e) {
      console.error("lineChartData build error:", e);
      return {
        labels: [],
        datasets: [
          {
            label: "Tasks",
            data: [],
            borderColor: "#FF0000",
            backgroundColor: "#FF0000",
            tension: 0.4,
            fill: false,
            pointBorderColor: "#FF0000",
            pointBackgroundColor: "#FF0000",
          },
        ],
      };
    }
  }, [selectedProjectId, projects, apiTasksData]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (Math.floor(value) === value) {
              return value;
            }
          },
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="min-h-screen p-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          title="Total Documents"
          value={loading ? "..." : totalDocuments}
          iconSrc="/mai-web/assets/Dasboard/file-upload.png"
          bgColor="bg-[#F3FFEE]"
          valueColor="text-[#85C46A]"
        />
        <Card
          title="Total Tasks"
          value={loading ? "..." : totalTasks}
          iconSrc="/mai-web/assets/Dasboard/arrow.png"
          bgColor="bg-[#FFF2E2]"
          valueColor="text-[#EC8600]"
        />
        <Card
          title="Total Projects"
          value={loading ? "..." : projects.length}
          iconSrc="/mai-web/assets/Dasboard/shopping-bag.png"
          bgColor="bg-[#F0F0F0]"
          valueColor="text-[#312F30]"
        />
        <Card
          title="Total Documents Uploaded"
          value={loading ? "..." : totalDocuments}
          iconSrc="/mai-web/assets/Dasboard/cart.png"
          bgColor="bg-sky-200"
          valueColor="text-sky-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-6">
        <div className="col-span-1 bg-white rounded-xl shadow-md p-6 flex flex-col items-start">
          <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold bricolage-grotesque mb-2 text-[#312F30]">
              Project Selected
            </h2>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="border rounded px-3 py-1 w-full md:w-auto"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || `Project ${p.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40 h-40 ml-0 md:ml-4 relative mt-4">
            <Pie data={pieData} options={pieOptions} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            {(pieData.labels || []).map((label, i) => (
              <div key={label} className="flex items-center space-x-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      pieData.datasets?.[0]?.backgroundColor?.[i] || "#ccc",
                  }}
                />
                <span className="bricolage-grotesque text-xs text-[#312F30]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold bricolage-grotesque mb-6 text-[#312F30]">
            Traffic Sources / Tasks Over Time
          </h2>
          <div className="w-full h-72">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-gray-500">Loading data...</div>
      )}
      {error && <div className="mt-4 text-sm text-red-500">Error: {error}</div>}
    </div>
  );
};

export default ReportsPage;
