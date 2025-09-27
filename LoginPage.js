// src/pages/LoginPage.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./login.css";

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  const handleUserLogin = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    if (!data.success) setError(data.message);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const data = await login(adminEmail, adminPassword);
    if (!data.success) setError(data.message);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>User Login</h2>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleUserLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter user email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="text-center">
          Don’t have an account?{" "}
          <a href="/register" className="link">
            Register
          </a>
        </p>

        <hr style={{ margin: "1rem 0" }} />

        <h2>Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <label>Admin Email</label>
          <input
            type="email"
            value={adminEmail}
            placeholder="Enter admin email"
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={adminPassword}
            placeholder="Enter admin password"
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />

          <button type="submit" className="admin-btn">
            Admin Login
          </button>
        </form>
      </div>
    </div>
  );
};
