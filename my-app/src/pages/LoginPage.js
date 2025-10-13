// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(email, password, isAdmin);

    if (res.success) {
      if (res.role === "admin") {
        navigate("/adminpage");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isAdmin ? "Admin Login" : "User Login"}</h2>

        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${!isAdmin ? "active" : ""}`}
            onClick={() => setIsAdmin(false)}
          >
            User Login
          </button>
          <button
            className={`toggle-btn ${isAdmin ? "active" : ""}`}
            onClick={() => setIsAdmin(true)}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default LoginPage;