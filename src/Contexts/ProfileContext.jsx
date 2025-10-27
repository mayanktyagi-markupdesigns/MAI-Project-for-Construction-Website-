import React, { createContext, useState, useEffect } from "react";


export const ProfileContext = createContext({
  profile: null,
  token: null,
  setProfile: () => {},
  setToken: () => {},
  logout: () => {},
});

export const ProfileProvider = ({ children }) => {


  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem("mai_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("mai_token") || null;
  });

  useEffect(() => {
    if (profile) localStorage.setItem("mai_user", JSON.stringify(profile));
    else localStorage.removeItem("mai_user");
  }, [profile]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("mai_token", token);
    } else {
      localStorage.removeItem("mai_token");
      localStorage.removeItem("expires_at");
    }
  }, [token]);


  const logout = () => {
    setProfile(null);
    setToken(null);
    localStorage.removeItem("mai_user");
    localStorage.removeItem("mai_token");
    localStorage.removeItem("expires_at");
   
  };


  useEffect(() => {
    const expiresAt = localStorage.getItem("expires_at");

    if (expiresAt) {
      const currentTime = new Date().getTime();
      if (currentTime >= expiresAt) {
        logout();
      } else {
        const remainingTime = expiresAt - currentTime;
        setTimeout(() => {
          logout();
        }, remainingTime);
      }
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        token,
        setProfile,
        setToken,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
