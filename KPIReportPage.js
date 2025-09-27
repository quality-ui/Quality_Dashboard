import React, { useEffect, useState } from "react";
import { Layout } from "../components/layout";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export const KPIReportPage = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("kpiReports") || "[]");
    setReports(data);
  }, []);

  const handleDownload = () => {
    const csv = [
      ["Month", "Department", "KPI Sheet", "Raw Data with Email"],
      ...reports.map((r) => [r.month, r.department, r.kpiStatus, r.rawDataStatus]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpi_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data
  const statusCounts = reports.reduce((acc, r) => {
    acc[r.kpiStatus] = (acc[r.kpiStatus] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <Layout title="KPI Reports">
      <div className="report-container">
        <h2>KPI Report</h2>
        <button onClick={handleDownload} className="download-btn">
          <Download className="icon" /> Download CSV
        </button>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Department</th>
              <th>KPI Sheet</th>
              <th>Raw Data with Email</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.month}</td>
                <td>{r.department}</td>
                <td>{r.kpiStatus}</td>
                <td>{r.rawDataStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="chart-section">
          <h3>KPI Sheet Status Overview</h3>
          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </div>
      </div>
    </Layout>
  );
};
