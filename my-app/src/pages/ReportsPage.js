import React, { useEffect, useState } from "react";
import { Layout } from "../components/layout";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./ReportPages.css";

export const ReportsPage = () => {
  const [checklistReports, setChecklistReports] = useState([]);
  const [kpiReports, setKpiReports] = useState([]);
  const [surgeryReports, setSurgeryReports] = useState([]);
  const [anaesthesiaReports, setAnaesthesiaReports] = useState([]);
  const [bloodStorageReports, setBloodStorageReports] = useState([]);
  const [icuReports, setIcuReports] = useState([]);
  const [strokeReports, setStrokeReports] = useState([]);

  // ✅ Load all reports from localStorage
  useEffect(() => {
    try {
      setChecklistReports(JSON.parse(localStorage.getItem("reports") || "[]"));
      setKpiReports(JSON.parse(localStorage.getItem("kpiReports") || "[]"));

      const storedSurgery = JSON.parse(localStorage.getItem("surgeryQAReport"));
      if (storedSurgery)
        setSurgeryReports(Array.isArray(storedSurgery) ? storedSurgery : [storedSurgery]);

      const storedAnaesthesia = JSON.parse(localStorage.getItem("anaesthesiaQAReport"));
      if (storedAnaesthesia)
        setAnaesthesiaReports(Array.isArray(storedAnaesthesia) ? storedAnaesthesia : [storedAnaesthesia]);

      const storedBloodStorage = JSON.parse(localStorage.getItem("bloodStorageQAReport"));
      if (storedBloodStorage)
        setBloodStorageReports(Array.isArray(storedBloodStorage) ? storedBloodStorage : [storedBloodStorage]);

      // ✅ ICU (Combine all in one)
      const storedICU = JSON.parse(localStorage.getItem("icuQAReports"));
      if (storedICU)
        setIcuReports(Array.isArray(storedICU) ? storedICU.flat() : [storedICU]);

      // ✅ Stroke (Combine all in one)
      const storedStroke = JSON.parse(localStorage.getItem("StrokeQAReports"));
      if (storedStroke)
        setStrokeReports(Array.isArray(storedStroke) ? storedStroke.flat() : [storedStroke]);
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  }, []);

  // ✅ Status color function
  function evaluateColor(current, targetStr) {
    const cleanTarget = targetStr?.replace("≥", ">=").replace("≤", "<=").replace("%", "") || "0";
    const num = Number(current);
    const targetMatch = cleanTarget.match(/(>=|<=|>|<|=)?\s*([0-9.]+)/);
    const op = targetMatch?.[1] || "=";
    const target = Number(targetMatch?.[2] || 0);
    const tol = Math.max(0.1 * target, 0.1);

    if (op === ">=" || op === ">") return num >= target ? "Green" : num >= target - tol ? "Yellow" : "Red";
    if (op === "<=" || op === "<") return num <= target ? "Green" : num <= target + tol ? "Yellow" : "Red";
    if (op === "=") return num === target ? "Green" : Math.abs(num - target) <= tol ? "Yellow" : "Red";
    return "Gray";
  }

  // ✅ Excel Download
  const handleDownloadExcel = (report, type) => {
    let worksheet;

    if (type === "Stroke") {
      worksheet = XLSX.utils.json_to_sheet(
        strokeReports.map((item) => ({
          Domain: item.domain,
          "Quality Indicator": item.indicator,
          "Method of Check": item.method,
          "Current Value": item.current,
          Target: item.target,
          Status: evaluateColor(item.current, item.target),
          Remarks: item.remarks,
        }))
      );
    } else if (type === "ICU") {
      worksheet = XLSX.utils.json_to_sheet(
        icuReports.map((r) => ({
          Parameter: r.name,
          Unit: r.unit,
          CurrentValue: r.currentValue,
          Target: r.target,
          Frequency: r.frequency,
          FrequencyValue: r.frequencyValue || "",
          Status: evaluateColor(r.currentValue, r.target),
          Responsible: r.responsible,
        }))
      );
    } else if (type === "Checklist") {
      worksheet = XLSX.utils.json_to_sheet(
        report.rows.map((row) => ({
          Title: report.title,
          "Audit Date": report.auditDate,
          "Check Point": row.checkpoint,
          "Verified By": row.verifiedBy,
          Evidence: row.evidence,
          Compliance: row.compliance,
        }))
      );
    } else if (type === "KPI") {
      worksheet = XLSX.utils.json_to_sheet([
        {
          Month: report.month,
          Department: report.department,
          "KPI Sheet": report.kpiSheet,
          "Raw Data": report.rawData,
        },
      ]);
    } else {
      worksheet = XLSX.utils.json_to_sheet(
        (report.checklist || []).map((item) => ({
          Date: report.date,
          Auditor: report.auditor,
          "QA Parameter": item.parameter,
          Checked: item.checked ? "Yes" : "No",
          Compliant: item.compliant,
          Remarks: item.remarks,
        }))
      );
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${type} Report`);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `${type}-report-${Date.now()}.xlsx`);
  };

  // ✅ CSV Download
  const handleDownloadCSV = (report, type) => {
    let csvContent = "";

    if (type === "Stroke") {
      csvContent += "Domain,Quality Indicator,Method of Check,Current Value,Target,Status,Remarks\n";
      strokeReports.forEach((item) => {
        csvContent += `"${item.domain}","${item.indicator}","${item.method}","${item.current}","${item.target}","${evaluateColor(item.current, item.target)}","${item.remarks}"\n`;
      });
    } else if (type === "ICU") {
      csvContent += "Parameter,Unit,CurrentValue,Target,Frequency,FrequencyValue,Status,Responsible\n";
      icuReports.forEach((r) => {
        csvContent += `"${r.name}","${r.unit}","${r.currentValue}","${r.target}","${r.frequency}","${r.frequencyValue || ""}","${evaluateColor(r.currentValue, r.target)}","${r.responsible}"\n`;
      });
    } else if (type === "Checklist") {
      csvContent += "Title,Audit Date,Check Point,Verified By,Evidence,Compliance,file\n";
      (report.row || []).forEach((row) => {
        csvContent += `"${report.title}","${report.auditDate}","${row.checkpoint}","${row.verifiedBy}","${row.evidence}","${row.compliance}","${row.file}"\n`;
      });
    } else if (type === "KPI") {
      csvContent += "Month,Department,KPI Sheet,Raw Data\n";
      csvContent += `"${report.month}","${report.department}","${report.kpiSheet}","${report.rawData}"\n`;
    } else {
      csvContent += "Date,Auditor,QA Parameter,Checked,Compliant,Remarks\n";
      (report.checklist || []).forEach((item) => {
        csvContent += `"${report.date}","${report.auditor}","${item.parameter}","${item.checked ? "Yes" : "No"}","${item.compliant}","${item.remarks}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🗑️ Delete Report
  const handleDeleteReport = (type) => {
    if (!window.confirm(`Delete all ${type} reports?`)) return;

    switch (type) {
      case "Stroke":
        setStrokeReports([]);
        localStorage.removeItem("StrokeQAReports");
        break;
      case "ICU":
        setIcuReports([]);
        localStorage.removeItem("icuQAReports");
        break;
      case "Surgery":
        updatedReports = surgeryReports.filter((_, i) => i !== index);
        setSurgeryReports(updatedReports);
        localStorage.setItem("surgeryQAReport", JSON.stringify(updatedReports));
        break;
      case "Anaesthesia":
        updatedReports = anaesthesiaReports.filter((_, i) => i !== index);
        setAnaesthesiaReports(updatedReports);
        localStorage.setItem("anaesthesiaQAReport", JSON.stringify(updatedReports));
        break;
      case "Checklist":
        updatedReports = checklistReports.filter((_, i) => i !== index);
        setChecklistReports(updatedReports);
        localStorage.setItem("reports", JSON.stringify(updatedReports));
        break;
      case "KPI":
        updatedReports = kpiReports.filter((_, i) => i !== index);
        setKpiReports(updatedReports);
        localStorage.setItem("kpiReports", JSON.stringify(updatedReports));
        break;
      case "BloodStorage":
        updatedReports = bloodStorageReports.filter((_, i) => i !== index);
        setBloodStorageReports(updatedReports);
        localStorage.setItem("bloodStorageQAReport", JSON.stringify(updatedReports));
        break;
      default:
        break;
    }
  };

  // 🔁 Section renderer (ICU and Stroke simplified to single block)
  function renderSection(title, data, type, combined = false) {
    return (
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {combined && data.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => handleDownloadExcel(null, type)} className="btn-excel">
                <Download className="h-4 w-4 mr-1" /> Excel
              </button>
              <button onClick={() => handleDownloadCSV(null, type)} className="btn-csv">
                <Download className="h-4 w-4 mr-1" /> CSV
              </button>
              <button onClick={() => handleDeleteReport(type)} className="btn-delete">🗑️ Delete</button>
            </div>
          )}
        </div>
        {!combined && (
          <div className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No {type.toLowerCase()} reports available.</p>
            ) : (
              data.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <p className="font-medium">{type} – {report.title || "Saved Data"}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadExcel(report, type)} className="btn-excel">
                      <Download className="h-4 w-4 mr-1" /> Excel
                    </button>
                    <button onClick={() => handleDownloadCSV(report, type)} className="btn-csv">
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Layout title="Reports">
      <div className="space-y-10">
        {renderSection("ICU QA Dashboard Reports", icuReports, "ICU", true)}
        {renderSection("Stroke QA Checklist Reports", strokeReports, "Stroke", true)}
        {renderSection("Checklist Reports", checklistReports, "Checklist")}
        {renderSection("KPI Reports", kpiReports, "KPI")}
        {renderSection("Surgery QA Reports", surgeryReports, "Surgery")}
        {renderSection("Anaesthesia QA Reports", anaesthesiaReports, "Anaesthesia")}
        {renderSection("Blood Storage QA Reports", bloodStorageReports, "BloodStorage")}
      </div>
    </Layout>
  );
};
