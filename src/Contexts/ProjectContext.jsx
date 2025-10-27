import React, { createContext, useState, useEffect } from "react";
import { fetchProjectsApi } from "../apiServices";
import Swal from "sweetalert2";

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LocalStorage me save karne ka helper
  const saveToStorage = (data) => {
    localStorage.setItem("projectsData", JSON.stringify(data));
  };

  // ✅ LocalStorage se load karne ka helper
  const loadFromStorage = () => {
    const stored = localStorage.getItem("projectsData");
    return stored ? JSON.parse(stored) : null;
  };

  // ✅ Fetch Projects API (dashboard pe ek hi baar call)
  const fetchProjects = async () => {
    try {
      const data = await fetchProjectsApi();
      setProjects(Array.isArray(data) ? data : []);
      saveToStorage(data); // local me save
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

  // ✅ Dashboard mount hone par sirf ek baar API call
  useEffect(() => {
    const localData = loadFromStorage();
    if (localData && localData.length > 0) {
      setProjects(localData);
      setLoading(false);
    } else {
      fetchProjects();
    }
  }, []);

  // ✅ Jab bhi data update/add/delete ho
  const updateLocalProjects = (newData) => {
    setProjects(newData);
    saveToStorage(newData);
  };

  return (
    <ProjectContext.Provider
      value={{ projects, loading, fetchProjects, updateLocalProjects }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
