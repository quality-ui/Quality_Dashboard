import React, { useState } from "react";
import { Layout } from "../components/layout";
import "./ChecklistPage.css";
import { useDashboard } from "../contexts/DashboardContext";

export const ChecklistPage = () => {
  const [title, setTitle] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [conformity, setConformity] = useState("conformity");
  const [rows, setRows] = useState([
    { checkpoint: "", verifiedBy: "", evidence: "", status: "Pending" },
  ]);
  const [file, setFile] = useState(null);

  const { setTotalChecklists, setCompletedItems, setPendingReviews } =
    useDashboard();

  const handleAddRow = () => {
    setRows([
      ...rows,
      { checkpoint: "", verifiedBy: "", evidence: "", status: "Pending" },
    ]);
  };

  const handleChangeRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleSave = () => {
    const report = {
      id: Date.now(),
      title,
      auditDate,
      rows,
      file: file?.name || null,
      conformity,
    };

    // ✅ Save in localStorage
    const existing = JSON.parse(localStorage.getItem("reports") || "[]");
    const updatedReports = [...existing, report];
    localStorage.setItem("reports", JSON.stringify(updatedReports));

    // ✅ Update dashboard stats
    setTotalChecklists(updatedReports.length);

    let completed = 0;
    let pending = 0;
    updatedReports.forEach((rep) => {
      rep.rows.forEach((row) => {
        if (row.status === "Completed") completed++;
        else pending++;
      });
    });

    setCompletedItems(completed);
    setPendingReviews(pending);

    // ✅ Reset form
    alert("Checklist saved!");
    setTitle("");
    setAuditDate("");
    setRows([
      { checkpoint: "", verifiedBy: "", evidence: "", status: "Pending" },
    ]);
    setFile(null);
    setConformity("conformity");
  };

  return (
    <Layout title="Checklist">
      <div className="form-container">
        <h2>Create Checklist</h2>

        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Audit Date</label>
        <input
          type="date"
          value={auditDate}
          onChange={(e) => setAuditDate(e.target.value)}
        />

        <label>Upload File</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <label>Conformity</label>
        <select
          value={conformity}
          onChange={(e) => setConformity(e.target.value)}
        >
          <option>conformity</option>
          <option>Non-conformity</option>
        </select>

        <h3>Checklist Items</h3>
        {rows.map((row, index) => (
          <div key={index} className="row">
            <input
              type="text"
              placeholder="Check Point"
              value={row.checkpoint}
              onChange={(e) =>
                handleChangeRow(index, "checkpoint", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Verified By"
              value={row.verifiedBy}
              onChange={(e) =>
                handleChangeRow(index, "verifiedBy", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Evidence"
              value={row.evidence}
              onChange={(e) =>
                handleChangeRow(index, "evidence", e.target.value)
              }
            />
            <select
              value={row.status}
              onChange={(e) =>
                handleChangeRow(index, "status", e.target.value)
              }
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        ))}

        <button onClick={handleAddRow}>+ Add Row</button>
        <button className="save-btn" onClick={handleSave}>
          Save Checklist
        </button>
      </div>
    </Layout>
  );
};
