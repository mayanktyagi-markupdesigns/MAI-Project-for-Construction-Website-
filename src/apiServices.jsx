import axios from "axios";

const DEFAULT_BASE_URL = "https://www.markupdesigns.net/mai-beta/api";

const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("mai_token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem("mai_token");
        localStorage.removeItem("mai_profile");
        localStorage.removeItem("activeSection");
        localStorage.removeItem("projectsData");
        localStorage.removeItem("sidebarOpenMenus");
      } catch (e) {}
      if (!window.location.pathname.includes("/mai-web/LoginPage")) {
        window.location.replace("/mai-web/LoginPage");
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

/* --------- API functions --------- */
export const registerUser = async (payload) => {
  try {
    const response = await api.post("/register", payload);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await api.post("/login", payload);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const contactUs = async (payload) => {
  try {
    const response = await api.post("/contact-us", payload);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const verifyEmailOtp = async (payload) => {
  try {
    const response = await api.post("/verify-email", payload);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await api.post("/reset-password", payload);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const earlyAccessSignup = async (payload) => {
  try {
    const response = await api.post("/early-access", payload);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// About Content APIs
export const fetchWhoContent = async () => {
  try {
    const response = await api.get("/about/who");
    return response.data?.data?.content || "";
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const fetchWhyContent = async () => {
  try {
    const response = await api.get("/about/why");
    return response.data?.data?.content || "";
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const fetchVisionContent = async () => {
  try {
    const response = await api.get("/about/vision");
    return response.data?.data?.content || "";
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const fetchValuesApi = async () => {
  try {
    const response = await api.get("/about/values");
    const apiCards = response.data?.data?.cards ?? [];
    return apiCards.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
    }));
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const fetchWhatContent = async () => {
  try {
    const response = await api.get("/about/what");
    const data = response.data?.data || {};
    const contentHtml = data.content || null;
    const apiStages = Array.isArray(data.stages) ? data.stages : [];
    return { contentHtml, apiStages };
  } catch (err) {
    throw err.response?.data || err;
  }
};

// Dashboard: token is now attached by interceptor, so simple calls are enough
export const fetchProjectsApi = async () => {
  try {
    const response = await api.get("/projects");
    return response.data?.data ?? response.data ?? [];
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const fetchAllTasksApi = async () => {
  try {
    const response = await api.get("/alltasks");
    return response.data?.data ?? [];
  } catch (err) {
    throw err.response?.data || err;
  }
};

// reports
export const fetchReportDataApi = async () => {
  try {
    const resp = await api.get("/report-data");
    return resp.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// blog api
export const fetchBlogsApi = async () => {
  try {
    const response = await api.get("/blogs");
    const apiData = response.data?.data?.data || [];
    return apiData;
  } catch (err) {
    throw new Error(err.message || "Failed to load blogs");
  }
};

export const fetchBlogDetailApi = async (slug) => {
  try {
    const response = await api.get(`/blogs/${slug}`);
    const { success, data, related } = response.data || {};
    return success && data
      ? { post: mapApiToPost(data), related: (related || []).map(mapApiToPost) }
      : { post: null, related: [] };
  } catch (err) {
    return { post: null, related: [] };
  }
};

export default api;
