import React, { createContext, useState, useContext } from "react";
import API from "../api/axiosInstance"; // Use centralized Axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // Login function
  const login = async (email, password, isAdmin) => {
    try {
      // Add /api here in the endpoint
      const endpoint = isAdmin ? "/api/auth/admin/login" : "/api/auth/login";
      const res = await API.post(endpoint, { email, password });

      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        return { success: true, role: res.data.user.role };
      }

      return { success: false, message: res.data.message };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Invalid credentials" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
