// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardProvider } from "./contexts/DashboardContext";

// ✅ Pages
import { ChecklistPage } from "./pages/ChecklistPage";
import { KPIPage } from "./pages/KPIPage";
import { ReportsPage } from "./pages/ReportsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { AnaesthesiaQAForm } from "./pages/AnaesthesiaQAForm";
import { SurgeryQAForm } from "./pages/SurgeryQAForm";


function App() {
  return (
    <Router>
      {/* AuthProvider handles login/register state */}
      <AuthProvider>
        {/* DashboardProvider handles dashboard data */}
        <DashboardProvider>
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/kpipage" element={<KPIPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/anaethesia" element={<AnaesthesiaQAForm />}/>
            <Route path="/surgery" element={<SurgeryQAForm />}/>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
