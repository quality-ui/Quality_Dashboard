import React, { useState } from "react";
import { Layout } from "../components/layout";
import { useNavigate } from "react-router-dom";
import "./Dashboardpage.css";

export const SurgeryQAForm = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [auditor, setAuditor] = useState("");

  const [items, setItems] = useState([
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

  const handleCheck = (index, value) => {
    const newItems = [...items];
    newItems[index].checked = value;
    setItems(newItems);
  };

  const handleCompliance = (index, value) => {
    const newItems = [...items];
    newItems[index].compliant = value;
    setItems(newItems);
  };

  const handleRemarks = (index, value) => {
    const newItems = [...items];
    newItems[index].remarks = value;
    setItems(newItems);
  };

  const totalItems = items.filter((i) => i.parameter).length;
  const compliantCount = items.filter((i) => i.compliant === "Y").length;
  const compliancePercent = totalItems > 0 ? ((compliantCount / totalItems) * 100).toFixed(1) : 0;

  const handleSubmit = () => {
    const newReport = {
      id: Date.now(),
      type: "Surgery QA",
      date,
      auditor,
      items,
      compliantCount,
      totalItems,
      compliancePercent,
    };

    const stored = JSON.parse(localStorage.getItem("surgeryQAReports") || "[]");
    localStorage.setItem("surgeryQAReports", JSON.stringify([...stored, newReport]));

    alert("✅ Surgery QA Checklist saved!");
    navigate("/reports");
  };

  return (
    <Layout title="Surgery QA Checklist">
      <div className="qa-dashboard">
        <h2>Surgery – QA Checklist</h2>

        <div className="surgery-meta">
          <label>
            Date:{" "}
            <input
              type="date"
              className="qa-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Auditor/Staff:{" "}
            <input
              type="text"
              className="qa-input"
              placeholder="Enter name"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
            />
          </label>
        </div>

        <table className="qa-table">
          <thead>
            <tr>
              <th>QA Parameter</th>
              <th>Check</th>
              <th>Compliant (Y/N)</th>
              <th>Remarks / Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              item.section ? (
                <tr key={idx}>
                  <td colSpan="4" className="section-title">{item.section}</td>
                </tr>
              ) : (
                <tr key={idx}>
                  <td>{item.parameter}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => handleCheck(idx, e.target.checked)}
                    />
                  </td>
                  <td>
                    <select
                      className="qa-select"
                      value={item.compliant}
                      onChange={(e) => handleCompliance(idx, e.target.value)}
                    >
                      <option value="">--Select--</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="qa-input"
                      value={item.remarks}
                      placeholder="Remarks / Action"
                      onChange={(e) => handleRemarks(idx, e.target.value)}
                    />
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>

        <div className="summary-row">
          <p>
            Compliant Items: <b>{compliantCount}</b> / {totalItems} &nbsp; | &nbsp;
            % Compliance: <b>{compliancePercent}%</b>
          </p>
        </div>

        <div className="submit-row">
          <button className="submit-btn" onClick={handleSubmit}>
            Submit & View Report
          </button>
        </div>
      </div>
    </Layout>
  );
};
