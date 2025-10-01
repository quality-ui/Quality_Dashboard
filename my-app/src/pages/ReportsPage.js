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

  // ✅ Load reports from localStorage
  useEffect(() => {
    try {
      setChecklistReports(JSON.parse(localStorage.getItem("reports") || "[]"));
      setKpiReports(JSON.parse(localStorage.getItem("kpiReports") || "[]"));

      const storedSurgery = JSON.parse(localStorage.getItem("surgeryQAReport"));
      if (storedSurgery) setSurgeryReports(Array.isArray(storedSurgery) ? storedSurgery : [storedSurgery]);

      const storedAnaesthesia = JSON.parse(localStorage.getItem("anaesthesiaQAReport"));
      if (storedAnaesthesia) setAnaesthesiaReports(Array.isArray(storedAnaesthesia) ? storedAnaesthesia : [storedAnaesthesia]);

      const storedBloodStorage = JSON.parse(localStorage.getItem("bloodStorageQAReport"));
      if (storedBloodStorage) setBloodStorageReports(Array.isArray(storedBloodStorage) ? storedBloodStorage : [storedBloodStorage]);
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  }, []);

  

  // ✅ Excel Download
  const handleDownloadExcel = (report, type) => {
    let worksheet;

    if (type === "Checklist") {
      worksheet = XLSX.utils.json_to_sheet(
        report.rows.map((row) => ({
          Title: report.title,
          "Audit Date": report.auditDate,
          "Check Point": row.checkpoint,
          "Verified By": row.verifiedBy,
          Evidence: row.evidence,
          Compliance: row.compliance,
          "File Name": row.file || "", // ✅ show file name in Excel
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
        report.checklist.map((item) => ({
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

    if (type === "Checklist") {
      csvContent += "Title,Audit Date,File,Check Point,Verified By,Evidence\n";
      report.rows.forEach((row) => {
        csvContent += `"${report.title}","${report.auditDate}","${report.file || ""}","${row.checkpoint}","${row.verifiedBy}","${row.evidence}"\n`;
      });
    } else if (type === "KPI") {
      csvContent += "Month,Department,KPI Sheet,Raw Data\n";
      csvContent += `"${report.month}","${report.department}","${report.kpiSheet}","${report.rawData}"\n`;
    } else {
      csvContent += "Date,Auditor,QA Parameter,Checked,Compliant,Remarks\n";
      report.checklist.forEach((item) => {
        csvContent += `"${report.date}","${report.auditor}","${item.parameter}","${item.checked ? "Yes" : "No"}","${item.compliant}","${item.remarks}"\n`;
      });
      csvContent += `\nCompliance Percentage: ${report.compliancePercent}%`;
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
  const handleDeleteReport = (type, index) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    let updatedReports = [];

    switch (type) {
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

  // ✏️ Edit Report (redirect to form)
  const handleEditReport = (type, index) => {
    const reportData =
      type === "Surgery"
        ? surgeryReports[index]
        : type === "Anaesthesia"
        ? anaesthesiaReports[index]
        : type === "Checklist"
        ? checklistReports[index]
        : type === "BloodStorage"
        ? bloodStorageReports[index]
        : kpiReports[index];

    localStorage.setItem("editingReport", JSON.stringify({ type, data: reportData }));

    if (type === "Surgery") window.location.href = "/surgery-qa";
    if (type === "Anaesthesia") window.location.href = "/anaesthesia-qa";
    if (type === "Checklist") window.location.href = "/checklist";
    if (type === "KPI") window.location.href = "/kpipage";
    if (type === "BloodStorage") window.location.href = "/blood-storage-qa";
  };

  return (
    <Layout title="Reports">
      <div className="space-y-10">

        {/* ✅ Checklist Reports */}
        {renderSection("Checklist Reports", checklistReports, "Checklist")}

        {/* ✅ KPI Reports */}
        {renderSection("KPI Reports", kpiReports, "KPI")}

        {/* ✅ Surgery QA Reports */}
        {renderSection("Surgery QA Reports", surgeryReports, "Surgery")}

        {/* ✅ Anaesthesia QA Reports */}
        {renderSection("Anaesthesia QA Reports", anaesthesiaReports, "Anaesthesia")}

        {/* ✅ Blood Storage QA Reports */}
        {renderSection("Blood Storage QA Reports", bloodStorageReports, "BloodStorage")}
      </div>
    </Layout>
  );

  

  // 🔁 Helper render function
  function renderSection(title, data, type) {
    return (
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-500">No {type.toLowerCase()} reports available.</p>
          ) : (
            data.map((report, idx) => (
              <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium">
                    {type} – {report.date || report.month || report.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.auditor ? `Auditor: ${report.auditor}` : ""}{" "}
                    {report.compliancePercent ? `• Compliance: ${report.compliancePercent}%` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditReport(type, idx)} className="btn-edit">✏️ Edit</button>
                  <button onClick={() => handleDeleteReport(type, idx)} className="btn-delete">🗑️ Delete</button>
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
      </div>
    );
  }
};
