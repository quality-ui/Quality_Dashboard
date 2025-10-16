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
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option>Account</option>
          <option>Internal Audit dept</option>
          <option>LAB</option>
          <option>MRD</option>
          <option>Clinical Pharmacist</option>
          <option>IT</option>
          <option>OM</option>
          <option>HR</option>
          <option>Pharmacy</option>
          <option>Dietician</option>
          <option>Pharmacy_</option>
          <option>HIC</option>
          <option>Radiology</option>
          <option>Physiotherapy</option>
          <option>Casualty</option>
          <option>Public Relations</option>
          <option>OT</option>
          <option>Video Editor</option>
          <option>Housekeeping</option>
          <option>Facility</option>
          <option>Biomedical</option>
          <option>Floor manager</option>
          <option>Front office</option>
          <option>Inpatient coordinator</option>
          <option>IP Billing</option>
          <option>Insurance</option>
          <option>NS (OVER ALL DATA SHEET)</option>
          <option>ICU</option>
        </select>

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
          <option>Received (pending last kpi raw data )</option>
          <option>Received (Need to Discuss)</option>
          <option>Data Having Software</option>
          <option>Have System</option>
          <option>MIS Software</option>
        </select>
        <br /><br />

        <button className="save-btn" onClick={handleSave}>
          Save KPI Status
        </button>
      </div>
    </Layout>
  );
};
