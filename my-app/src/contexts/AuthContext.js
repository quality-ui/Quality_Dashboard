import React, { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

// ✅ Use relative URL in production (works automatically with Vercel routing)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const login = async (email, password, isAdmin) => {
    try {
      // ✅ Choose correct login endpoint
      const endpoint = isAdmin
        ? `${API_BASE_URL}/auth/admin/login`
        : `${API_BASE_URL}/auth/login`;

      const res = await axios.post(endpoint, { email, password });

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
