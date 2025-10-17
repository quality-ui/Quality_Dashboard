// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardProvider } from "./contexts/DashboardContext";

// ✅ Guards
import  ProtectedRoute  from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";


// ✅ Pages
import { ChecklistPage } from "./pages/ChecklistPage";
import { KPIPage } from "./pages/KPIPage";
import { ReportsPage } from "./pages/ReportsPage";
import  LoginPage  from "./pages/LoginPage";
import  { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { AnaesthesiaQAForm } from "./pages/AnaesthesiaQAForm";
import { SurgeryQAForm } from "./pages/SurgeryQAForm";
import { BloodStorageQAPage } from "./pages/BloodStorageQAPage";
import  ICUDashboard  from "./pages/ICUDashboard";
import     StrokeQADashboard  from "./pages/StrokeQADashboard";
import     QualityDashboard  from "./pages/QualityDashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🔒 Admin-only routes */}
            <Route
              path="/register"
              element={
                <AdminRoute>
                  <RegisterPage />
                </AdminRoute>
              }
            />
            <Route
              path="/adminpage"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />

            {/* 🔐 Protected (logged-in users only) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checklist"
              element={
                <ProtectedRoute>
                  <ChecklistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kpipage"
              element={
                <ProtectedRoute>
                  <KPIPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/anaethesia"
              element={
                <ProtectedRoute>
                  <AnaesthesiaQAForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/surgery"
              element={
                <ProtectedRoute>
                  <SurgeryQAForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bloodstorage-qa"
              element={
                <ProtectedRoute>
                  <BloodStorageQAPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/icudashboard"
              element={
                <ProtectedRoute>
                  <ICUDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/strock-qa"
              element={
                <ProtectedRoute>
                  <StrokeQADashboard   />
                </ProtectedRoute>
              }
            />
             <Route
              path="/qualitydashboard"
              element={
                <ProtectedRoute>
                  <QualityDashboard   />
                </ProtectedRoute>
              }
            />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
