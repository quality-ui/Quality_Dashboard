import express from "express";
import { verifyToken } from "../middleware/auth.js"; // ✅ NOT verifyAdmin

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Decoded user:", req.user); // 👈 add this
    res.json({
      success: true,
      stats: {
        totalUsers: 5,
        totalAdmins: 1,
        recentSignups: 2,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
