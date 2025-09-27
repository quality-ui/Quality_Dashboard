import React, { useState } from "react";
import { Layout } from "../components/layout";
import "./Kpipage.css";

export const KPIPage = () => {
  const [month, setMonth] = useState("");
  const [department, setDepartment] = useState("");
  const [kpiStatus, setKpiStatus] = useState("Received");
  const [rawDataStatus, setRawDataStatus] = useState("Received");
  
  const handleSave = () => {
    const entry = {
      id: Date.now(),
      month,
      department,
      // ✅ Match ReportsPage fields
      kpiSheet: kpiStatus,
      rawData: rawDataStatus,
    };

    const existing = JSON.parse(localStorage.getItem("kpiReports") || "[]");
    localStorage.setItem("kpiReports", JSON.stringify([...existing, entry]));

    alert("KPI Status saved!");
    setMonth("");
    setDepartment("");
    setKpiStatus("Received");
    setRawDataStatus("Received");
  };

  return (
    <Layout title="KPI Status">
      <div className="form-container">
        <h2>KPI Status Entry</h2>

        <label>Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <label>Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <label>KPI Sheet</label>
        <select value={kpiStatus} onChange={(e) => setKpiStatus(e.target.value)}>
          <option>Received</option>
          <option>Not Received</option>
        </select>

        <label>Raw Data with Email</label>
        <select
          value={rawDataStatus}
          onChange={(e) => setRawDataStatus(e.target.value)}
        >
          <option>Received</option>
          <option>Not Received</option>
          <option>Not Applicable</option>
          <option>Received (Pending Last KPI)</option>
          <option>Received (Need to Discuss)</option>
          <option>Data Having Software</option>
        </select>
        <br /><br />

        <button className="save-btn" onClick={handleSave}>
          Save KPI Status
        </button>
      </div>
    </Layout>
  );
};
