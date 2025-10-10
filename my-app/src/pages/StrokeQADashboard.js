import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import './ICUDashboard.css';

const defaultParameters = [
  {id: 1, domain: "Emergency & Imaging", indicator: "Door-to-CT completed within 20 min of arrival", method: "Audit stroke registry & imaging logs", current: "", target: "≥ 90%", remarks: "" },
  {id: 2, domain: "Emergency & Imaging", indicator: "Door-to-Needle (IV thrombolysis) within 60 min", method: "Case sheet & stroke audit form", current: "", target: "≥ 85%", remarks: "" },
  {id: 3, domain: "Emergency & Imaging", indicator: "Door-to-Groin puncture for thrombectomy ≤ 90 min", method: "Cath lab & stroke registry", current: "", target: "≥ 80%", remarks: "" },
  {id: 4, domain: "Emergency & Imaging", indicator: "Stroke Code activated for eligible patients", method: "Emergency logbook", current: "", target: "≥ 95%", remarks: "" },
  {id: 5, domain: "Clinical Protocols", indicator: "NIHSS documented on admission & discharge", method: "Patient file audit", current: "", target: "≥ 95%", remarks: "" },
  {id: 6, domain: "Clinical Protocols", indicator: "Dysphagia screening before oral intake", method: "Nursing checklist audit", current: "", target: "≥ 95%", remarks: "" },
  {id: 7, domain: "Clinical Protocols", indicator: "Stroke care bundle compliance", method: "Bundle checklist", current: "", target: "≥ 90%", remarks: "" },
  {id: 8, domain: "Clinical Protocols", indicator: "Antiplatelet/anticoagulant use documented", method: "Drug chart audit", current: "", target: "≥ 95%", remarks: "" },
  {id: 9, domain: "Safety & Outcomes", indicator: "Post-thrombolysis hemorrhage rate <6%", method: "Mortality/morbidity review", current: "", target: "≤ 6%", remarks: "" },
  {id: 10, domain: "Safety & Outcomes", indicator: "Stroke patients with BP management protocol", method: "Nursing & physician notes", current: "", target: "≥ 95%", remarks: "" },
  {id: 11, domain: "Safety & Outcomes", indicator: "Complication reporting done & analyzed", method: "Incident log", current: "", target: "≥ 95%", remarks: "" },
  {id: 12, domain: "Rehabilitation & Discharge", indicator: "Physiotherapy initiated within 48 hrs", method: "Physio notes audit", current: "", target: "≥ 90%", remarks: "" },
  {id: 13, domain: "Rehabilitation & Discharge", indicator: "Patient/family given predischarge education", method: "Discharge checklist", current: "", target: "≥ 95%", remarks: "" },
  {id: 14, domain: "Rehabilitation & Discharge", indicator: "Discharge summary includes NIHSS/mRS & plan", method: "Case sheet audit", current: "", target: "≥ 95%", remarks: "" },
  {id: 15, domain: "Data & Audit", indicator: "All stroke patients entered into registry", method: "Audit registry", current: "", target: "≥ 98%", remarks: "" },
  {id: 16, domain: "Data & Audit", indicator: "Monthly stroke audit meeting conducted", method: "QA records", current: "", target: "100%", remarks: "" },
  {id: 17, domain: "Data & Audit", indicator: "Corrective actions from last audit implemented", method: "CAPA review", current: "", target: "≥ 90%", remarks: "" },
];

// Helper function to evaluate status color
function evaluateColor(current, targetStr) {
  const cleanTarget = targetStr?.replace("≥", ">=").replace("≤", "<=").replace("%","") || "0";
  const num = Number(current);
  const targetMatch = cleanTarget.match(/(>=|<=|>|<|=)?\s*([0-9.]+)/);
  const op = targetMatch?.[1] || "=";
  const target = Number(targetMatch?.[2] || 0);
  const tol = Math.max(0.1 * target, 0.1); // tolerance for yellow

  if (op === ">=" || op === ">") return num >= target ? "Green" : num >= target - tol ? "Yellow" : "Red";
  if (op === "<=" || op === "<") return num <= target ? "Green" : num <= target + tol ? "Yellow" : "Red";
  if (op === "=") return num === target ? "Green" : Math.abs(num - target) <= tol ? "Yellow" : "Red";
  return "Gray";
}

export default function StrokeQADashboard() {
  const [params, setParams] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("StrokeQAReports") || "[]");
    setParams(saved.length ? saved : defaultParameters);
  }, []);

  function handleInputChange(index, key, value) {
    setParams(prev => {
      const copy = [...prev];
      copy[index][key] = value;
      return copy;
    });
  }

  function saveData() {
    localStorage.setItem("StrokeQAReports", JSON.stringify(params));
    alert("Stroke QA Data saved successfully!");
  }

  // Export Excel with Status
  const handleExportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      (params || []).map(p => ({
        Domain: p.domain,
        "Quality Indicator": p.indicator,
        "Method of Check": p.method,
        "Current Value":p.current,
        Target:p.target,
        Status: evaluateColor(p.current, p.target),
        Remarks:p.remarks,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Stroke QA Checklist");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `StrokeQA-${Date.now()}.xlsx`);
  };

  // Export CSV with Status
  const exportCSV = () => {
    const header = ["Domain","Quality Indicator","Method of Check","Current Value","Target","Status","Remarks"];
    const rows = (params || []).map(r => [
      r.domain, r.indicator, r.method,r.current,r.target,r.remarks, evaluateColor(r.current, r.target)
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "stroke_qa_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Stroke QA Checklist">
      <div className="bg-white p-6 shadow rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stroke QA Checklist</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Domain</th>
                <th className="p-2 border">Quality Indicator</th>
                <th className="p-2 border">Method of Check</th>
                <th className="p-2 border">Current Value</th>
                <th className="p-2 border">Target</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {(params || []).map((p, i) => (
                <tr key={i}>
                  <td className="p-2 border">{p.domain}</td>
                  <td className="p-2 border">{p.indicator}</td>
                  <td className="p-2 border">{p.method}</td>
                  <td className="p-2 border text-center">
                    <input
                      type="number"
                      className="border p-1 w-20 text-center"
                      value={p.current}
                      onChange={(e) => handleInputChange(i, "current", e.target.value)}
                      placeholder="%"
                    />
                  </td>
                  <td className="p-2 border text-center">{p.target}</td>
                  <td className={`p-2 border text-center ${
                    evaluateColor(p.current, p.target) === "Green" ? "text-green-600" :
                    evaluateColor(p.current, p.target) === "Yellow" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {evaluateColor(p.current, p.target)}
                  </td>
                  <td>
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={p.remarks}
                    onChange={(e) => handleCheckChange(index, "remarks", e.remarks.value)}
                  />
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="actions mt-4 flex gap-2">
          <button onClick={exportCSV} className="btn">Export CSV</button>
          <button onClick={handleExportExcel} className="btn">Export Excel</button>
          <button onClick={saveData} className="btn save">Save Data</button>
        </div>
      </div>
    </Layout>
  );
}
