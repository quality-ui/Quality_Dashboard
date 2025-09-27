// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // 🔐 Login
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const loggedUser = data.user;
        localStorage.setItem("user", JSON.stringify(loggedUser));
        localStorage.setItem("token", data.token);
        setUser(loggedUser);

        // 🔀 Redirect based on role
        if (loggedUser.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        return { success: false, message: data.message || "Invalid credentials" };
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  // 📝 Register
  const register = async (name, email, password, role = "user") => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) navigate("/login");
      return data;
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Registration failed" };
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
