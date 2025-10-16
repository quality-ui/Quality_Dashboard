// backend/routes/dashboardQuality.js
import express from "express";
import db from "../db.js"; // your mysql2 connection

const router = express.Router();

/**
 * Helper: safely run query and return rows or []
 */
async function safeQuery(sql, params = []) {
  try {
    const [rows] = await db.execute(sql, params);
    return rows || [];
  } catch (err) {
    console.warn("Query failed:", err.message);
    return [];
  }
}

/**
 * Build one metric object
 * { name, category, value, target, trend, priority, frequency, history: [{date, value}, ...] }
 */
function makeMetric({ name, category = "General", value = null, target = null, trend = null, priority = "medium", frequency = "monthly", history = [] }) {
  return { name, category, value, target, trend, priority, frequency, history };
}

router.get("/quality-metrics", async (req, res) => {
  try {
    const metrics = [];

    // ---- 1) NC Checklist (example table: nc_checklists) ----
    // expects columns: checklist_name, status, score (numeric), created_at
    const ncRows = await safeQuery(`
      SELECT checklist_name AS name,
             AVG(score) AS avg_score,
             MAX(target) AS target,
             DATE(created_at) AS date
      FROM nc_checklists
      GROUP BY checklist_name, DATE(created_at)
      ORDER BY name, date DESC
    `);

    // transform into metrics with last value and simple trend from previous day
    const groupedNC = {};
    ncRows.forEach((r) => {
      const key = r.name || "NC Checklist";
      groupedNC[key] = groupedNC[key] || [];
      groupedNC[key].push({ date: r.date, value: Number(r.avg_score || 0), target: Number(r.target || 0) });
    });

    for (const [name, arr] of Object.entries(groupedNC)) {
      const history = arr.slice(0, 12).map((a) => ({ date: a.date, value: a.value }));
      const latest = history[0] || { value: 0 };
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name,
        category: "NC",
        value: Math.round(latest.value),
        target: Math.round(arr[0].target || 0),
        trend,
        priority: "medium",
        frequency: "monthly",
        history
      }));
    }

    // ---- 2) KPI Status table (example: kpis) ----
    // expects: kpi_name, value, target, period_date
    const kpiRows = await safeQuery(`
      SELECT kpi_name AS name, AVG(value) AS value, MAX(target) AS target, DATE(period_date) as date
      FROM kpis
      GROUP BY kpi_name, DATE(period_date)
      ORDER BY kpi_name, date DESC
    `);

    const groupedKPI = {};
    kpiRows.forEach(r => {
      const key = r.name || "KPI";
      groupedKPI[key] = groupedKPI[key] || [];
      groupedKPI[key].push({ date: r.date, value: Number(r.value || 0), target: Number(r.target || 0) });
    });

    for (const [name, arr] of Object.entries(groupedKPI)) {
      const history = arr.slice(0, 12).map(a => ({ date: a.date, value: a.value }));
      const latest = history[0] || { value: 0 };
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name,
        category: "KPI",
        value: Math.round(latest.value),
        target: Math.round(arr[0].target || 0),
        trend,
        priority: "medium",
        frequency: "monthly",
        history
      }));
    }

    // ---- 3) Surgery QA (example: surgeryqa) ----
    // expects: compliance_percent, created_at
    const surgRows = await safeQuery(`
      SELECT DATE(created_at) AS date, AVG(compliance_percent) AS value
      FROM surgeryqa
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    if (surgRows.length) {
      const history = surgRows.map(r => ({ date: r.date, value: Number(r.value) }));
      const latest = history[0];
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name: "Surgery Checklist Compliance",
        category: "Surgery",
        value: Math.round(latest.value || 0),
        target: 90,
        trend,
        priority: "high",
        frequency: "monthly",
        history
      }));
    }

    // ---- 4) ICU QA (example: icuqa) ----
    const icuRows = await safeQuery(`
      SELECT DATE(created_at) AS date, AVG(compliance_percent) AS value
      FROM icuqa
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    if (icuRows.length) {
      const history = icuRows.map(r => ({ date: r.date, value: Number(r.value) }));
      const latest = history[0];
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name: "ICU Documentation Compliance",
        category: "ICU",
        value: Math.round(latest.value || 0),
        target: 95,
        trend,
        priority: "high",
        frequency: "daily",
        history
      }));
    }

    // ---- 5) Stroke QA (example: strokeqa) ----
    const strokeRows = await safeQuery(`
      SELECT DATE(created_at) AS date, AVG(compliance_percent) AS value
      FROM strokeqa
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    if (strokeRows.length) {
      const history = strokeRows.map(r => ({ date: r.date, value: Number(r.value) }));
      const latest = history[0];
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name: "Stroke QA Compliance",
        category: "Neurology",
        value: Math.round(latest.value || 0),
        target: 90,
        trend,
        priority: "high",
        frequency: "monthly",
        history
      }));
    }

    // ---- 6) Blood Storage QA (example: bloodstorageqa) ----
    const bloodRows = await safeQuery(`
      SELECT DATE(created_at) AS date, AVG(compliance_percent) AS value
      FROM bloodstorageqa
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    if (bloodRows.length) {
      const history = bloodRows.map(r => ({ date: r.date, value: Number(r.value) }));
      const latest = history[0];
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name: "Blood Storage QA",
        category: "Pathology",
        value: Math.round(latest.value || 0),
        target: 95,
        trend,
        priority: "medium",
        frequency: "monthly",
        history
      }));
    }

    // ---- 7) Anaesthesia QA (example: anaesthesiaqa) ----
    const anaRows = await safeQuery(`
      SELECT DATE(created_at) AS date, AVG(compliance_percent) AS value
      FROM anaesthesiaqa
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    if (anaRows.length) {
      const history = anaRows.map(r => ({ date: r.date, value: Number(r.value) }));
      const latest = history[0];
      const prev = history[1] || null;
      const trend = prev ? `${Math.round(((latest.value - prev.value) / (prev.value || 1)) * 100)}%` : null;
      metrics.push(makeMetric({
        name: "Anaesthesia QA",
        category: "Anaesthesia",
        value: Math.round(latest.value || 0),
        target: 92,
        trend,
        priority: "medium",
        frequency: "monthly",
        history
      }));
    }

    // If metrics empty (no DB schema matches), return some fallback sample metrics
    if (!metrics.length) {
      metrics.push(makeMetric({
        name: "Sample KPI: Patient Satisfaction",
        category: "Quality",
        value: 92,
        target: 90,
        trend: "+3%",
        priority: "high",
        frequency: "monthly",
        history: [
          { date: "2025-10-10", value: 88 },
          { date: "2025-10-11", value: 90 },
          { date: "2025-10-12", value: 92 },
        ]
      }));
    }

    res.json({ success: true, metrics });
  } catch (err) {
    console.error("dashboardQuality error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
