import { useEffect, useState } from "react";
import axios from "axios";
import PatientForm from "/PatientForm.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/patients").then((res) => {
      setPatients(res.data);
    });
  }, []);

  const addPatient = (p) => setPatients([...patients, p]);

  // KPI Metrics
  const total = patients.length;
  const within1hr = patients.filter((p) => p.within_1hr).length;
  const completeAccurate = patients.filter(
    (p) => p.completeness && p.accuracy
  ).length;

  // Monthly Delay Trend
  const monthlyData = {};
  patients.forEach((p) => {
    const month = new Date(p.discharge_time).toLocaleString("default", {
      month: "short",
    });
    if (!monthlyData[month]) monthlyData[month] = { month, delays: 0, count: 0 };
    if (!p.within_1hr) monthlyData[month].delays++;
    monthlyData[month].count++;
  });
  const trendData = Object.values(monthlyData).map((d) => ({
    month: d.month,
    delayRate: d.count ? ((d.delays / d.count) * 100).toFixed(1) : 0,
  }));

  // Delay Reason Count
  const reasonCounts = {};
  patients.forEach((p) => {
    if (p.delay_reason) {
      reasonCounts[p.delay_reason] = (reasonCounts[p.delay_reason] || 0) + 1;
    }
  });
  const reasonData = Object.keys(reasonCounts).map((r) => ({
    reason: r,
    count: reasonCounts[r],
  }));

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h1 className="logo">Hospital Portal</h1>
        <nav>
          <a href="#" className="active">Dashboard</a>
          <a href="#patients">Patients</a>
          <a href="#reports">Reports</a>
        </nav>
        <footer>© 2025 Hospital</footer>
      </aside>

      {/* MAIN */}
      <main className="main">
        <h2 className="title">Patient Dashboard</h2>

        {/* Form */}
        <div className="form-container">
          <PatientForm onAdd={addPatient} />
        </div>

        {/* KPI CARDS */}
        <div className="kpi-cards">
          <div className="card">
            <h3>% Summaries within 1 hr</h3>
            <p className="green">
              {total ? ((within1hr / total) * 100).toFixed(1) + "%" : "0%"}
            </p>
          </div>
          <div className="card">
            <h3>% Complete & Accurate</h3>
            <p className="blue">
              {total ? ((completeAccurate / total) * 100).toFixed(1) + "%" : "0%"}
            </p>
          </div>
          <div className="card">
            <h3>Total Patients</h3>
            <p className="dark">{total}</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="charts">
          <div className="chart-box">
            <h3>Monthly Delay Trend</h3>
            <LineChart width={500} height={250} data={trendData}>
              <CartesianGrid stroke="#ddd" strokeDasharray="5 5" />
              <XAxis dataKey="month" />
              <YAxis unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="delayRate" stroke="#e63946" strokeWidth={2} />
            </LineChart>
          </div>

          <div className="chart-box">
            <h3>Delay Reasons</h3>
            <BarChart width={500} height={250} data={reasonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reason" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4361ee" />
            </BarChart>
          </div>
        </div>

        {/* TABLE */}
        <h3 id="patients" className="section-title">Patient Records</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>UHID</th>
                <th>Name</th>
                <th>Delay (min)</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? "even" : "odd"}>
                  <td>{p.uhid}</td>
                  <td>{p.name}</td>
                  <td>{p.delay_minutes.toFixed(1)}</td>
                  <td>{p.delay_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reports */}
        <h3 id="reports" className="section-title">Reports</h3>
        <div className="report-box">
          <p>Coming soon: downloadable reports and analytics.</p>
        </div>
      </main>
    </div>
  );
}
