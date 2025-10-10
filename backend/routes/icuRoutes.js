// backend/routes/icuRoutes.js
import express from "express";
const router = express.Router();

router.get("/icu-metrics", (req, res) => {
  const metrics = [
    {
      parameter: "GCS Documentation Compliance",
      measurement: "% of ICU patients with GCS documented every 8h",
      target: 95,
      value: 96,
      frequency: "Daily / Weekly",
      staff: "ICU Nurse",
      notes: "Highlight missed documentation",
    },
    {
      parameter: "Unplanned Extubation",
      measurement: "Number per 100 ventilator days",
      target: 0,
      value: 1,
      frequency: "Monthly",
      staff: "Respiratory Therapist / ICU Team",
      notes: "Root cause analysis if >0",
    },
    // ...other metrics
  ];
  res.json(metrics);
});

export default router;
