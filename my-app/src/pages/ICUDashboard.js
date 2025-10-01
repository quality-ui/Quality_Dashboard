import React, { useState } from "react";
import { Layout } from "../components/layout";
import "./ICUDashboard.css";

export const ICUDashboard = () => {
  // Predefined QA Parameters
  const [rows, setRows] = useState([
    {
      parameter: "GCS Documentation Compliance",
      unit: "% of ICU patients with GCS documented every 8h",
      target: "≥95",
      frequency: "Daily / Weekly",
      staff: "ICU Nurse",
      value: "",
      status: "—",
    },
    {
      parameter: "Unplanned Extubation",
      unit: "Number per 100 ventilator days",
      target: "0",
      frequency: "Monthly",
      staff: "Respiratory Therapist / ICU Team",
      value: "",
      status: "—",
    },
    {
      parameter: "Central Line Removal due to Infection",
      unit: "Number per 100 central line days",
      target: "<2",
      frequency: "Monthly",
      staff: "ICU Nurse / Infection Control",
      value: "",
      status: "—",
    },
    {
      parameter: "Daily Fluid Balance Documentation",
      unit: "% compliance",
      target: "≥95",
      frequency: "Daily",
      staff: "ICU Nurse",
      value: "",
      status: "—",
    },
    {
      parameter: "ET Tube Cuff Pressure Monitoring",
      unit: "% of patients with cuff pressure checked every 8h",
      target: "≥95",
      frequency: "Daily",
      staff: "ICU Nurse / RT",
      value: "",
      status: "—",
    },
    {
      parameter: "Time to Correct Hypotension After Onset",
      unit: "Average minutes to achieve MAP >65 mmHg",
      target: "<30",
      frequency: "Daily",
      staff: "ICU Resident / Nurse",
      value: "",
      status: "—",
    },
    {
      parameter: "Hypoglycemic Events",
      unit: "Number per 30 ICU days",
      target: "0",
      frequency: "Monthly",
      staff: "ICU Nurse / Resident",
      value: "",
      status: "—",
    },
  ]);

  // Handle Value Change
  const handleValueChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].value = value;

    // ✅ Determine status based on target logic
    const target = updatedRows[index].target;
    const numValue = parseFloat(value);

    if (!value) {
      updatedRows[index].status = "—";
    } else if (target.startsWith("≥")) {
      const targetNum = parseFloat(target.replace("≥", ""));
      updatedRows[index].status = numValue >= targetNum ? "Target Achieved ✅" : "Not Achieved ❌";
    } else if (target.startsWith("<")) {
      const targetNum = parseFloat(target.replace("<", ""));
      updatedRows[index].status = numValue < targetNum ? "Target Achieved ✅" : "Not Achieved ❌";
    } else {
      const targetNum = parseFloat(target);
      updatedRows[index].status = numValue === targetNum ? "Target Achieved ✅" : "Not Achieved ❌";
    }

    setRows(updatedRows);
  };

  return (
    <Layout title="ICU QA Dashboard">
      <div className="icu-dashboard">
        <h2>ICU QA Dashboard</h2>
        <table className="icu-table">
          <thead>
            <tr>
              <th>QA Parameter</th>
              <th>Measurement / Unit</th>
              <th>Target</th>
              <th>Input Value</th>
              <th>Frequency of Review</th>
              <th>Responsible Staff</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row.parameter}</td>
                <td>{row.unit}</td>
                <td>{row.target}</td>
                <td>
                  <input
                    type="number"
                    value={row.value}
                    placeholder="Enter value"
                    onChange={(e) => handleValueChange(index, e.target.value)}
                  />
                </td>
                <td>{row.frequency}</td>
                <td>{row.staff}</td>
                <td className={row.status.includes("Achieved") ? "status-achieved" : "status-failed"}>
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
