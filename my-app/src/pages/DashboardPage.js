import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileCheck, BarChart3, Users, Clock, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout";
import API from "../api/axiosInstance"; // ✅ Use centralized API
import "./Dashboardpage.css";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // -------------------- Dashboard Stats --------------------
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    recentSignups: 0,
    totalChecklists: 0,
    completedItems: 0,
    pendingReviews: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------- Surgery QA Checklist --------------------
  const [surgeryDate, setSurgeryDate] = useState("");
  const [auditor, setAuditor] = useState("");
  const [surgeryChecklist, setSurgeryChecklist] = useState([
    { section: "Pre-op" },
    { parameter: "Pre-op checklist completed", checked: false, compliant: "", remarks: "" },
    { parameter: "Informed consent documented", checked: false, compliant: "", remarks: "" },
    { parameter: "Pre-op antibiotics given within 60 min before incision", checked: false, compliant: "", remarks: "" },
    { section: "Intra-op" },
    { parameter: "WHO surgical safety checklist compliance", checked: false, compliant: "", remarks: "" },
    { parameter: "Sponge / instrument count accurate", checked: false, compliant: "", remarks: "" },
    { section: "Post-op" },
    { parameter: "Surgical site infection rate monitored", checked: false, compliant: "", remarks: "" },
    { parameter: "Unplanned reoperation within 48 hrs documented", checked: false, compliant: "", remarks: "" },
    { parameter: "Post-op pain assessment documented", checked: false, compliant: "", remarks: "" },
  ]);

  // -------------------- Fetch Dashboard Stats --------------------
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/api/dashboard"); // ✅ include /api
        if (res.data.success) {
          setStats(res.data.stats);
        } else {
          setError(res.data.message || "Failed to load stats");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // -------------------- Logout --------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // -------------------- Surgery QA Handlers --------------------
  const handleCheck = (idx, checked) => {
    const updated = [...surgeryChecklist];
    updated[idx].checked = checked;
    setSurgeryChecklist(updated);
  };

  const handleCompliance = (idx, val) => {
    const updated = [...surgeryChecklist];
    updated[idx].compliant = val;
    setSurgeryChecklist(updated);
  };

  const handleRemarks = (idx, val) => {
    const updated = [...surgeryChecklist];
    updated[idx].remarks = val;
    setSurgeryChecklist(updated);
  };

  const handleSubmitSurgeryQA = async () => {
    const totalItems = surgeryChecklist.filter((i) => i.parameter).length;
    const compliantCount = surgeryChecklist.filter((i) => i.compliant === "Y").length;
    const compliancePercent = totalItems ? Math.round((compliantCount / totalItems) * 100) : 0;

    const payload = {
      date: surgeryDate,
      auditor,
      compliancePercent,
      checklist: surgeryChecklist.filter((i) => i.parameter),
    };

    try {
      await API.post("/api/surgeryqa", payload); // ✅ include /api
      localStorage.setItem("surgeryQAReport", JSON.stringify(payload));
      alert("✅ Surgery QA Checklist saved successfully!");
      navigate("/reports");
    } catch (err) {
      console.error("Error saving Surgery QA:", err);
      alert("❌ Failed to save report");
    }
  };

  // -------------------- Dashboard Cards --------------------
  const cards = [
    { name: "Total Checklists", value: stats.totalChecklists ?? 0, icon: FileCheck, color: "stat-icon blue" },
    { name: "Completed Items", value: stats.completedItems ?? 0, icon: TrendingUp, color: "stat-icon green" },
    { name: "Pending Reviews", value: stats.pendingReviews ?? 0, icon: Clock, color: "stat-icon amber" },
    { name: "Active Users", value: stats.activeUsers ?? 0, icon: Users, color: "stat-icon purple" },
    { name: "Admins", value: stats.totalAdmins ?? 0, icon: Users, color: "stat-icon pink" },
    { name: "New Signups (7d)", value: stats.recentSignups ?? 0, icon: TrendingUp, color: "stat-icon orange" },
  ];

  return (
    <Layout title="Dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="welcome-header">
          <h2>Welcome, {user?.name} 👋</h2>
          <p>You are logged in as <b>{user?.role}</b></p>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : error ? (
          <div className="error-message">
            <AlertCircle className="h-5 w-5 text-red-500" /> {error}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {cards.map((stat) => (
                <div key={stat.name} className="stat-card">
                  <div className="stat-content">
                    <div className={`${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="stat-text">
                      <p className="stat-name">{stat.name}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="quick-actions-header">Quick Actions</div>
              <div className="quick-actions-grid">
                <Link to="/checklist" className="quick-action-card bg-blue-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>NC Checklist</h4>
                      <p>Create and manage non-conformity checklists</p>
                    </div>
                    <FileCheck className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/kpipage" className="quick-action-card bg-purple-gradient">
                  <div className="flex-between">
                    <div>
                      <h4 style={{ color: "white" }}>KPI Page</h4>
                      <p>Manage KPI tracking and updates</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/surgery" className="quick-action-card bg-red-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>Surgery QA Checklist</h4>
                      <p>Audit surgical processes and compliance</p>
                    </div>
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/anaethesia" className="quick-action-card bg-gray-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>Anaesthesia QA Checklist</h4>
                      <p>Evaluate anaesthesia quality and safety</p>
                    </div>
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/bloodstorage-qa" className="quick-action-card bg-brown-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>Blood Storage Unit QA Checklist</h4>
                      <p>Manage and audit blood storage safety & compliance</p>
                    </div>
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/icudashboard" className="quick-action-card bg-brown-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>ICU Dashboard QA Checklist</h4>
                      <p>Monitor ICU performance indicators</p>
                    </div>
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/strock-qa" className="quick-action-card bg-purple-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>Stroke QA Checklist</h4>
                      <p>Evaluate stroke management quality</p>
                    </div>
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/reports" className="quick-action-card bg-green-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>Reports</h4>
                      <p>View and export comprehensive reports</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </Link>

                <Link to="/qualitydashboard" className="quick-action-card bg-green-gradient">
                  <div className="flex-between">
                    <div>
                      <h4>Quality - Dashboard</h4>
                      <p>View and analyze charts.</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
