import React, { useState, useEffect } from "react";
import './ICUDashboard.css'; // external CSS

function parseTarget(targetStr) {
  const m = String(targetStr).trim().match(/^(>=|<=|>|<|=)?\s*([0-9]+(?:\.[0-9]+)?)$/);
  return m ? { op: m[1] || "=", value: parseFloat(m[2]) } : { op: "=", value: 0 };
}

function evaluateColor(current, targetStr) {
  const { op, value: target } = parseTarget(targetStr);
  const num = Number(current);
  const tol = Math.max(0.1 * Math.abs(target), 0.1);
  if (op === ">=" || op === ">") return num >= target ? "green" : num >= target - tol ? "yellow" : "red";
  if (op === "<=" || op === "<") return num < target ? "green" : num <= target + tol ? "yellow" : "red";
  if (op === "=") return num === target ? "green" : Math.abs(num - target) <= tol ? "yellow" : "red";
  return "gray";
}

function colorToClass(color) {
  switch (color) {
    case "green": return "status-green";
    case "yellow": return "status-yellow";
    case "red": return "status-red";
    default: return "status-gray";
  }
}

const defaultQAParameters = [
  { id: 1, name: "GCS Documentation Compliance", unit: "%of ICU patients with GCS documented every 8h", currentValue: 0, target: ">=95", frequency: "daily", frequencyValue: "", responsible: "ICU Nurse"},
  { id: 2, name: "Unplanned Extubation", unit: "per 100 ventilator days", currentValue: 0, target: "=0", frequency: "monthly", frequencyValue: "", responsible: "RT / ICU Team"},
  { id: 3, name: "Central Line Removal due to Infection", unit: "per 100 central line days", currentValue: 0, target: "<2", frequency: "monthly", frequencyValue: "", responsible: "ICU Nurse / Infection Control"},
  { id: 4, name: "Daily Fluid Balance Documentation", unit: "%compliance", currentValue: 0, target: ">=95", frequency: "daily", frequencyValue: "", responsible: "ICU Nurse"},
  { id: 5, name: "ET Tube Cuff Pressure Monitoring", unit: "%of patients with cuff pressure checked every 8h", currentValue: 0, target: ">=95", frequency: "daily", frequencyValue: "", responsible: "ICU Nurse / RT"},
  { id: 6, name: "Time to Correct Hypotension After Onset", unit: "minutes", currentValue: 0, target: "<30", frequency: "realtime", frequencyValue: "", responsible: "ICU Resident / Nurse"},
  { id: 7, name: "Hypoglycemic Events", unit: "per 30 ICU days", currentValue: 0, target: "=0", frequency: "monthly", frequencyValue: "", responsible: "ICU Nurse / Resident"},
];

export default function ICUQADashboard() {
  const [params, setParams] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("icuQAReports") || "[]");
    if (saved.length > 0) {
      setParams(saved);
    } else {
      setParams(defaultQAParameters);
    }
  }, []);

  function updateParam(id, key, value) {
    setParams((p) => p.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function saveData() {
    localStorage.setItem("icuQAReports", JSON.stringify(params));
    alert("ICU QA Data saved successfully!");
  }

  function exportCSV() {
    const header = ["Parameter", "Unit", "CurrentValue", "Target", "Frequency", "FrequencyValue", "Status", "Responsible"];
    const rows = params.map((r) => {
      const color = evaluateColor(r.currentValue, r.target); // ✅ FIXED
      return [
        r.name,
        r.unit,
        r.currentValue,
        r.target,
        r.frequency,
        r.frequencyValue || "",
        color.toUpperCase(),
        r.responsible,
      ];
    });

    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "icu_qa_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="icu-dashboard-container">
      <div className="header">
        <h1>ICU QA Dashboard</h1>
        <div className="actions">
          <button onClick={exportCSV} className="btn">Export CSV</button>
          <button onClick={saveData} className="btn save">Save Data</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Current</th>
              <th>Target</th>
              <th>Frequency / Time</th>
              <th>Responsible</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => {
              const color = evaluateColor(p.currentValue, p.target);
              const cls = colorToClass(color);
              return (
                <tr key={p.id}>
                  <td>{p.name}<div className="unit">Unit: {p.unit}</div></td>
                  <td>
                    <input
                      type="number"
                      value={p.currentValue}
                      onChange={(e) => updateParam(p.id, "currentValue", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      value={p.target}
                      onChange={(e) => updateParam(p.id, "target", e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={p.frequency}
                      onChange={(e) => updateParam(p.id, "frequency", e.target.value)}
                    >
                      <option value="realtime">Real-time</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {p.frequency === "realtime" && (
                      <input
                        type="number"
                        min={1}
                        value={p.frequencyValue}
                        onChange={(e) => updateParam(p.id, "frequencyValue", e.target.value)}
                        placeholder="mins"
                      />
                    )}
                    {p.frequency === "daily" && (
                      <input
                        type="date"
                        value={p.frequencyValue}
                        onChange={(e) => updateParam(p.id, "frequencyValue", e.target.value)}
                      />
                    )}
                    {p.frequency === "monthly" && (
                      <input
                        type="month"
                        value={p.frequencyValue}
                        onChange={(e) => updateParam(p.id, "frequencyValue", e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    <input
                      value={p.responsible}
                      onChange={(e) => updateParam(p.id, "responsible", e.target.value)}
                    />
                  </td>
                  <td><span className={cls}>{color.toUpperCase()}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
