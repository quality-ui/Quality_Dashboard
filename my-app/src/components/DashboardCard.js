import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function DashboardCard({ metric, onHistory, onEdit }) {
  const { name, category, value, target, trend, priority, frequency } = metric || {};

  const pct = value ?? 0;
  const trendUp =
    trend && (String(trend).startsWith("+") || Number(trend.replace("%", "")) > 0);

  return (
    <div className="card dashboard-card">
      <div className="card-body">
        {/* Top Section */}
        <div className="card-top">
          <div>
            <h4 className="card-title">{name}</h4>
            <div className="card-sub">{category}</div>
          </div>
          <div className={`priority-badge ${priority}`}>{priority}</div>
        </div>

        {/* Main Section */}
        <div className="card-main">
          <div className="value">
            <span className="big">{value ?? "-"}</span>
            <span className="trend">
              {trend ? (
                trendUp ? (
                  <>
                    <ArrowUpRight /> {trend}
                  </>
                ) : (
                  <>
                    <ArrowDownRight /> {trend}
                  </>
                )
              ) : null}
            </span>
          </div>

          <div className="target">Target: {target ?? "-"}</div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="card-actions">
            <button className="btn btn-sm" onClick={() => onHistory(metric)}>
              History
            </button>
            <button
              className="btn btn-sm outline"
              onClick={() => onEdit(metric)}
            >
              Edit
            </button>
          </div>

          {/* Frequency Label */}
          <div className="freq">{frequency}</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
