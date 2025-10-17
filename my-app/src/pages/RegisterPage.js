// src/pages/RegisterPage.js
import React, { useState } from "react";
import axios from "axios";
import "./RegisterPage.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Admin token required
      const res = await axios.post(`${API_BASE_URL}/admin/users`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || "User created successfully!");
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error("Register error:", err);
      setMessage(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="register-container">
      <h2>Register New User</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" className="register-btn">Register</button>
      </form>

      {message && <p className="register-message">{message}</p>}
    </div>
  );
};
