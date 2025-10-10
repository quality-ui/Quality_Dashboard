import React, { useState } from "react";
import axios from "axios";
import "./RegisterPage.css";

const RegisterPage = () => {
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
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || "User created successfully");
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error("Register error:", err);
      setMessage("Error creating user");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create New User</h2>
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

          <button type="submit" className="register-btn">
            Create
          </button>
        </form>

        {message && <p className="register-message">{message}</p>}
      </div>
    </div>
  );
};

export default RegisterPage;
