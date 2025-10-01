import React, { useState } from "react";
import { Layout } from "../components/layout";
import "./ChecklistPage.css";

export const ChecklistPage = () => {
  const [title, setTitle] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [rows, setRows] = useState([
    { checkpoint: "", verifiedBy: "", evidence: "", compliance: "Compliant", file: null },
  ]);

  // ➕ Add New Row
  const addRow = () => {
    setRows([...rows, { checkpoint: "", verifiedBy: "", evidence: "", compliance: "Compliant", file: null }]);
  };

  // 🗑️ Remove Row
  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // 📝 Handle Row Change
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // 📂 Handle File Upload
  const handleFileUpload = (index, file) => {
    const updatedRows = [...rows];
    updatedRows[index].file = file ? file.name : null; // store only filename
    setRows(updatedRows);
  };

  // 💾 Submit Checklist
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !auditDate) {
      alert("Please fill Title and Audit Date");
      return;
    }

    const newReport = {
      id: Date.now(),
      title,
      auditDate,
      rows,
    };

    const existing = JSON.parse(localStorage.getItem("reports") || "[]");
    existing.push(newReport);
    localStorage.setItem("reports", JSON.stringify(existing));

    alert("Checklist saved successfully ✅");
    window.location.href = "/reports";
  };

  return (
    <Layout title="Checklist">
      <form onSubmit={handleSubmit} className="checklist-form">
        <div className="form-header">
          <input
            type="text"
            placeholder="Enter Checklist Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-title"
          /><br></br><br></br><br></br>
          <input
            type="date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            required
            className="input-date"
          /><br></br>
        </div>

        <table className="checklist-table">
          <thead>
            <tr>
              <th>Check Point</th>
              <th>Verified By</th>
              <th>Evidence / Remarks</th>
              <th>Compliance</th>
              <th>File</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    placeholder="Enter checkpoint"
                    value={row.checkpoint}
                    onChange={(e) => handleRowChange(index, "checkpoint", e.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Verified by"
                    value={row.verifiedBy}
                    onChange={(e) => handleRowChange(index, "verifiedBy", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Enter evidence or remarks"
                    value={row.evidence}
                    onChange={(e) => handleRowChange(index, "evidence", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={row.compliance}
                    onChange={(e) => handleRowChange(index, "compliance", e.target.value)}
                  >
                    <option value="Compliant">Compliance</option>
                    <option value="Non-Compliant">Non-Compliance</option>
                  </select>
                </td>
                <td>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(index, e.target.files[0])}
                  />
                  {row.file && (
                    <span className="file-name">{row.file}</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => removeRow(index)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="form-actions">
          <button type="button" className="btn-add" onClick={addRow}>
            ➕ Add Row
          </button>
          <button type="submit" className="btn-submit">
            💾 Save & View Report
          </button>
        </div>
      </form>
    </Layout>
  );
};
