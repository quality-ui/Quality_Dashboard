import React, { useState } from "react";
import { Layout } from "../components/layout";
import { useNavigate } from "react-router-dom";
import "./Dashboardpage.css";

export const BloodStorageQAPage = () => {
  const navigate = useNavigate();

  // Form state
  const [date, setDate] = useState("");
  const [auditor, setAuditor] = useState("");

  // Checklist Data
  const initialChecklist = [
    // 1️⃣ Storage & Inventory
    { section: "Storage & Inventory", parameter: "Temperature log maintained (2–6°C)", checked: false, compliant: "", remarks: "" },
    { section: "Storage & Inventory", parameter: "Alarm & backup system functional", checked: false, compliant: "", remarks: "" },
    { section: "Storage & Inventory", parameter: "Stock rotation (FIFO) followed", checked: false, compliant: "", remarks: "" },
    { section: "Storage & Inventory", parameter: "Expired / damaged units quarantined & discarded properly", checked: false, compliant: "", remarks: "" },

    // 2️⃣ Issue & Traceability
    { section: "Issue & Traceability", parameter: "Patient identification verified before issue", checked: false, compliant: "", remarks: "" },
    { section: "Issue & Traceability", parameter: "Cross-match / group verification documented", checked: false, compliant: "", remarks: "" },
    { section: "Issue & Traceability", parameter: "Blood issue & return recorded", checked: false, compliant: "", remarks: "" },
    { section: "Issue & Traceability", parameter: "100% traceability (donor → recipient)", checked: false, compliant: "", remarks: "" },

    // 3️⃣ Transfusion Monitoring & Safety
    { section: "Transfusion Monitoring & Safety", parameter: "Pre-, intra-, post-transfusion vitals recorded", checked: false, compliant: "", remarks: "" },
    { section: "Transfusion Monitoring & Safety", parameter: "Transfusion reactions (if any) investigated", checked: false, compliant: "", remarks: "" },
    { section: "Transfusion Monitoring & Safety", parameter: "CAPA documented for adverse events", checked: false, compliant: "", remarks: "" },

    // 4️⃣ Equipment & Calibration
    { section: "Equipment & Calibration", parameter: "Refrigerator/freezer calibrated & serviced", checked: false, compliant: "", remarks: "" },
    { section: "Equipment & Calibration", parameter: "Temperature probes calibrated", checked: false, compliant: "", remarks: "" },
    { section: "Equipment & Calibration", parameter: "Maintenance log updated", checked: false, compliant: "", remarks: "" },

    // 5️⃣ Documentation & SOPs
    { section: "Documentation & SOPs", parameter: "SOPs available & staff trained", checked: false, compliant: "", remarks: "" },
    { section: "Documentation & SOPs", parameter: "Internal audit done as per schedule", checked: false, compliant: "", remarks: "" },
    { section: "Documentation & SOPs", parameter: "Records maintained as per NABH/NACO norms", checked: false, compliant: "", remarks: "" },
  ];

  const [checklist, setChecklist] = useState(initialChecklist);

  // ✅ Handle changes
  const handleCheckChange = (index, field, value) => {
    const updated = [...checklist];
    updated[index][field] = value;
    setChecklist(updated);
  };

  // ✅ Submit Form
  const handleSubmit = () => {
    const total = checklist.length;
    const compliantCount = checklist.filter((item) => item.compliant === "Y").length;
    const compliancePercent = ((compliantCount / total) * 100).toFixed(2);

    const reportData = {
      date,
      auditor,
      checklist,
      compliancePercent,
    };

    localStorage.setItem("bloodStorageQAReport", JSON.stringify(reportData));

    alert("Blood Storage QA Checklist saved successfully ✅");
    navigate("/reports");
  };

  return (
    <Layout title="Blood Storage Unit – QA Checklist">
      <div className="qa-form">
        <h2 className="qa-title">Blood Storage Unit – QA Checklist</h2>

        <div className="qa-header">
          <label>
            Date:{" "}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Auditor/Staff:{" "}
            <input
              type="text"
              placeholder="Enter name"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              required
            />
          </label>
        </div>

        {/* ✅ Checklist Table */}
        <table className="qa-table">
          <thead>
            <tr>
              <th>Section</th>
              <th>QA Parameter</th>
              <th>Check</th>
              <th>Compliance (Y/N)</th>
              <th>Remarks / Action</th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item, index) => (
              <tr key={index}>
                <td>{item.section}</td>
                <td>{item.parameter}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => handleCheckChange(index, "checked", e.target.checked)}
                  />
                </td>
                <td>
                  <select
                    value={item.compliant}
                    onChange={(e) => handleCheckChange(index, "compliant", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={item.remarks}
                    onChange={(e) => handleCheckChange(index, "remarks", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Summary */}
        <div className="qa-summary">
          <p>
            Compliance Items: {checklist.filter((i) => i.compliant === "Y").length} / {checklist.length}
          </p>
          <p>
            % Compliance:{" "}
            {(
              (checklist.filter((i) => i.compliant === "Y").length / checklist.length) *
              100
            ).toFixed(2)}
            %
          </p>
        </div>

        <button className="qa-submit" onClick={handleSubmit}>
          Submit & Save Report
        </button>
      </div>
    </Layout>
  );
};
