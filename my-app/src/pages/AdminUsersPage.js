// src/pages/AdminDashboard.js
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name} (Admin)</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Logout
      </button>

      {/* TODO: Add user registration/edit/delete table here */}
    </div>
  );
};

export default AdminDashboard;
