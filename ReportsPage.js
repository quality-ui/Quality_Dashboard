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

  // ✅ Load reports from localStorage
  useEffect(() => {
    try {
      // Checklist Reports
      const storedChecklists = JSON.parse(localStorage.getItem("reports") || "[]");
      setChecklistReports(storedChecklists);

      // KPI Reports
      const storedKpi = JSON.parse(localStorage.getItem("kpiReports") || "[]");
      setKpiReports(storedKpi);

      // Surgery QA Reports
      const storedSurgery = localStorage.getItem("surgeryQAReport");
      if (storedSurgery) setSurgeryReports([JSON.parse(storedSurgery)]);

      // Anaesthesia QA Reports
      const storedAnaesthesia = localStorage.getItem("anaesthesiaQAReport");
      if (storedAnaesthesia) setAnaesthesiaReports([JSON.parse(storedAnaesthesia)]);
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
          File: report.file || "",
          "Check Point": row.checkpoint,
          "Verified By": row.verifiedBy,
          Evidence: row.evidence,
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
    } else if (type === "Surgery" || type === "Anaesthesia") {
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
    } else if (type === "Surgery" || type === "Anaesthesia") {
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

  return (
    <Layout title="Reports">
      <div className="space-y-10">

        {/* ✅ Checklist Reports */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Checklist Reports</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {checklistReports.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No checklist reports available.</p>
            ) : (
              checklistReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-xs text-gray-500">
                      {report.auditDate} • {report.rows.length} checkpoints
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadExcel(report, "Checklist")} className="btn-excel">
                      <Download className="h-4 w-4 mr-1" /> Excel
                    </button>
                    <button onClick={() => handleDownloadCSV(report, "Checklist")} className="btn-csv">
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ KPI Reports */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">KPI Reports</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {kpiReports.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No KPI reports available.</p>
            ) : (
              kpiReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      {report.month} – {report.department}
                    </p>
                    <p className="text-xs text-gray-500">
                      KPI Sheet: {report.kpiSheet} • Raw Data: {report.rawData}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadExcel(report, "KPI")} className="btn-excel">
                      <Download className="h-4 w-4 mr-1" /> Excel
                    </button>
                    <button onClick={() => handleDownloadCSV(report, "KPI")} className="btn-csv">
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Surgery QA Reports */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Surgery QA Reports</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {surgeryReports.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No surgery QA reports available.</p>
            ) : (
              surgeryReports.map((report, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Surgery QA – {report.date}</p>
                    <p className="text-xs text-gray-500">
                      Auditor: {report.auditor} • Compliance: {report.compliancePercent}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadExcel(report, "Surgery")} className="btn-excel">
                      <Download className="h-4 w-4 mr-1" /> Excel
                    </button>
                    <button onClick={() => handleDownloadCSV(report, "Surgery")} className="btn-csv">
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Anaesthesia QA Reports */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Anaesthesia QA Reports</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {anaesthesiaReports.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No anaesthesia QA reports available.</p>
            ) : (
              anaesthesiaReports.map((report, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Anaesthesia QA – {report.date}</p>
                    <p className="text-xs text-gray-500">
                      Auditor: {report.auditor} • Compliance: {report.compliancePercent}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadExcel(report, "Anaesthesia")} className="btn-excel">
                      <Download className="h-4 w-4 mr-1" /> Excel
                    </button>
                    <button onClick={() => handleDownloadCSV(report, "Anaesthesia")} className="btn-csv">
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};
