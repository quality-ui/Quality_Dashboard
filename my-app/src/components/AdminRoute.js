// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user || user.role !== "admin") {
    alert("Access denied! Admins only.");
    return <Navigate to="/login" replace />;
  }

  return children;
};


