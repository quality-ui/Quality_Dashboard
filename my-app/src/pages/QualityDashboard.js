import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";
import { Line } from "react-chartjs-2";
import * as XLSX from "xlsx";
import "./QualityDashboard.css";


// ----- Chart.js registration -----
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const calculateTrend = (history) => {
  if (!history || history.length < 2) return "+0%";
  const last = history[history.length - 1].value;
  const prev = history[history.length - 2].value;
  if (prev === 0) return "+0%";
  const trend = ((last - prev) / prev) * 100;
  return (trend >= 0 ? "+" : "") + trend.toFixed(1) + "%";
};


// ----- MetricCard Component -----
// ----- MetricCard Component -----
const MetricCard = ({ metric }) => {
  const trend = calculateTrend(metric.history);
  const isGood = metric.value >= metric.target;
  const bgColor = "#fff"; // keep clean white like in your image
  const lineColor = isGood ? "#1E88E5" : "#E53935"; // blue for good, red for below target

  const data = {
    labels: metric.history.map((h) => h.date),
    datasets: [
      {
        data: metric.history.map((h) => h.value),
        borderColor: lineColor,
        backgroundColor: "rgba(30,136,229,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className="metric-card">
      <div className="metric-header">
        <div>
          <h4 className="metric-title">{metric.name}</h4>
          <p className="metric-category">{metric.category}</p>
        </div>
        <div
          className={`metric-trend ${isGood ? "up" : "down"}`}
          title={trend}
        >
          {trend}
        </div>
      </div>

      <div className="metric-values">
        <div>
          <span className="metric-value">{metric.value}</span>
          <span className="metric-unit"> / {metric.target}</span>
        </div>
        <span className="metric-frequency">{metric.frequency}</span>
      </div>

      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};



// ----- Main Dashboard -----
function QualityDashboard() {
  const { api, token } = useAuth() || {};
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddKPI, setShowAddKPI] = useState(false);
  const [showKPIEntry, setShowKPIEntry] = useState(false);
  const [showBasicForm, setShowBasicForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showKPIManager, setShowKPIManager] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);

  // Forms
  const [newKPI, setNewKPI] = useState({
    name: "",
    category: "",
    target: "",
    value: "",
    trend: "",
    priority: "medium",
    frequency: "monthly",
    history: [],
  });

  const [entryData, setEntryData] = useState({
    metricName: "",
    value: "",
    trend: "",
  });

  // Fetch initial metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        if (api && typeof api.get === "function") {
          const res = await api.get("/dashboard/quality-metrics");
          setMetrics(res.data?.metrics || []);
        } else {
          // fallback mock data
          setMetrics([
            {
              name: "Patient Satisfaction",
              category: "Quality",
              value: 92,
              target: 90,
              trend: "+3%",
              priority: "high",
              frequency: "monthly",
              history: [
                { date: "Jan", value: 88 },
                { date: "Feb", value: 90 },
                { date: "Mar", value: 92 },
              ],
            },
            {
              name: "Average Wait Time",
              category: "Nursing",
              value: 24,
              target: 30,
              trend: "-5%",
              priority: "medium",
              frequency: "weekly",
              history: [
                { date: "Jan", value: 26 },
                { date: "Feb", value: 25 },
                { date: "Mar", value: 24 },
              ],
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [api, token]);

  // ----- Add KPI -----
  const handleNewKPIChange = (e) => {
    const { name, value } = e.target;
    setNewKPI((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddKPI = (e) => {
    e.preventDefault();
    // Add KPI Entry
setMetrics((prev) =>
  prev.map((m) =>
    m.name === entryData.metricName
      ? {
          ...m,
          value: Number(entryData.value),
          history: [
            ...m.history,
            { date: new Date().toLocaleDateString(), value: Number(entryData.value) },
          ],
        }
      : m
  )
);

    setNewKPI({
      name: "",
      category: "",
      target: "",
      value: "",
      trend: "",
      priority: "medium",
      frequency: "monthly",
      history: [],
    });
    setShowAddKPI(false);
  };

  // ----- KPI Data Entry -----
  const handleEntryChange = (e) => {
    const { name, value } = e.target;
    setEntryData((prev) => ({ ...prev, [name]: value }));
  };
  const handleKPIEntrySubmit = (e) => {
    e.preventDefault();
    setMetrics((prev) =>
      prev.map((m) =>
        m.name === entryData.metricName
          ? {
              ...m,
              value: Number(entryData.value),
              trend: entryData.trend || m.trend,
              history: [...m.history, { date: new Date().toLocaleDateString(), value: Number(entryData.value) }],
            }
          : m
      )
    );
    setEntryData({ metricName: "", value: "", trend: "" });
    setShowKPIEntry(false);
  };

  // ----- Bulk Upload -----
  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setMetrics((prev) => [
        ...prev,
        ...json.map((kpi) => ({
          ...kpi,
          value: Number(kpi.value) || 0,
          target: Number(kpi.target) || 0,
          history: [{ date: new Date().toLocaleDateString(), value: Number(kpi.value) || 0 }],
        })),
      ]);
    };
    reader.readAsBinaryString(file);
  };

  // ----- KPI Manager -----
  const handleDeleteKPI = (name) => setMetrics((prev) => prev.filter((m) => m.name !== name));

  return (
    <Layout title="Quality KPI Management">
      <div className="quality-dashboard">
        <div className="dashboard-header">
          <h1>Quality KPI Management</h1>
          <div className="header-actions">
            <button className="btn" onClick={() => setShowBulkUpload(true)}>Bulk Data Entry</button>
            <button className="btn" onClick={() => setShowBasicForm(true)}>Basic Forms</button>
            <button className="btn" onClick={() => setShowKPIManager(true)}>KPI Form Manager</button>
            <button className="btn" onClick={() => setShowKPIEntry(true)}>KPI Data Entry</button>
            <button className="btn primary" onClick={() => setShowAddKPI(true)}>+ Add New KPI</button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="cards-grid">
            {metrics.map((m) => (
              <MetricCard key={m.name} metric={m} />
            ))}
          </div>
        )}

        {/* ---------------- Modals ---------------- */}

        {/* Add KPI */}
        {showAddKPI && (
          <div className="modal-overlay" onClick={() => setShowAddKPI(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Add New KPI</h3>
              <form onSubmit={handleAddKPI}>
                <label>Name:</label>
                <input name="name" value={newKPI.name} onChange={handleNewKPIChange} />
                <label>Category:</label>
                <input name="category" value={newKPI.category} onChange={handleNewKPIChange} />
                <label>Target:</label>
                <input type="number" name="target" value={newKPI.target} onChange={handleNewKPIChange} />
                <label>Value:</label>
                <input type="number" name="value" value={newKPI.value} onChange={handleNewKPIChange} />
                <label>Trend:</label>
                <input name="trend" value={newKPI.trend} onChange={handleNewKPIChange} />
                <button type="submit" className="btn primary">Save KPI</button>
              </form>
              
            </div>
          </div>
        )}

        {/* KPI Entry */}
        {showKPIEntry && (
          <div className="modal-overlay" onClick={() => setShowKPIEntry(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>KPI Data Entry</h3>
              <form onSubmit={handleKPIEntrySubmit}>
                <label>Select KPI:</label>
                <select name="metricName" value={entryData.metricName} onChange={handleEntryChange}>
                  <option value="">-- Select KPI --</option>
                  {metrics.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <label>Value:</label>
                <input type="number" name="value" value={entryData.value} onChange={handleEntryChange} />
                <label>Trend:</label>
                <input name="trend" value={entryData.trend} onChange={handleEntryChange} />
                <button type="submit" className="btn primary">Save Entry</button>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload */}
        {showBulkUpload && (
          <div className="modal-overlay" onClick={() => setShowBulkUpload(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Bulk Data Entry</h3>
              <input type="file" onChange={handleBulkUpload} />
            </div>
          </div>
        )}

        {/* KPI Form Manager */}
        {showKPIManager && (
          <div className="modal-overlay" onClick={() => setShowKPIManager(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>KPI Form Manager</h3>
              {metrics.map((m, idx) => (
                <div key={m.name} style={{ display: "flex", justifyContent: "space-between", margin: 5 }}>
                  <span>{m.name}</span>
                  <div>
                    <button className="btn" onClick={() => setEditingKPI({ ...m, index: idx })}>Edit</button>
                    <button className="btn" onClick={() => handleDeleteKPI(m.name)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit KPI */}
        {editingKPI && (
          <div className="modal-overlay" onClick={() => setEditingKPI(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Edit KPI: {editingKPI.name}</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const { index, name, category, target, value, trend } = editingKPI;
                  setMetrics((prev) => {
                    const newMetrics = [...prev];
                    newMetrics[index] = {
                      ...newMetrics[index],
                      name,
                      category,
                      target: Number(target),
                      value: Number(value),
                      trend,
                    };
                    return newMetrics;
                  });
                  setEditingKPI(null);
                }}
              >
                <label>Name:</label>
                <input value={editingKPI.name} onChange={(e) => setEditingKPI(prev => ({ ...prev, name: e.target.value }))} />
                <label>Category:</label>
                <input value={editingKPI.category} onChange={(e) => setEditingKPI(prev => ({ ...prev, category: e.target.value }))} />
                <label>Target:</label>
                <input type="number" value={editingKPI.target} onChange={(e) => setEditingKPI(prev => ({ ...prev, target: e.target.value }))} />
                <label>Value:</label>
                <input type="number" value={editingKPI.value} onChange={(e) => setEditingKPI(prev => ({ ...prev, value: e.target.value }))} />
                <label>Trend:</label>
                <input value={editingKPI.trend} onChange={(e) => setEditingKPI(prev => ({ ...prev, trend: e.target.value }))} />
                <button type="submit" className="btn primary">Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default QualityDashboard;
