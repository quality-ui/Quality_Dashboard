import React from "react";
import { Line } from "react-chartjs-2";

const MetricCard = ({ metric }) => {
  const data = {
    labels: metric.history.map(h => h.date),
    datasets: [
      {
        data: metric.history.map(h => h.value),
        borderColor: metric.priority === "high" ? "#FF4C4C" : "#4C9AFF",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: { line: { borderWidth: 2 } },
  };

  return (
    <div className="metric-card">
      <h4>{metric.name}</h4>
      <p>Value: {metric.value}</p>
      <p>Target: {metric.target}</p>
      <p>Trend: {metric.trend}</p>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default MetricCard;
