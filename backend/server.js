// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

// Routes
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import icuRoutes from "./routes/icuRoutes.js";
import dashboardQuality from "./routes/dashboardQuality.js";

dotenv.config();

const app = express();

// -------------------- ✅ CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://dashboard-checklist-l1wn9khzf-quality-uis-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: origin not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// -------------------- ✅ JWT Secret --------------------
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// -------------------- ✅ Routes --------------------
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", icuRoutes);
app.use("/api/dashboard", dashboardQuality);

// -------------------- 🔐 LOGIN --------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ REMOVED “Registration disabled” override —
// now /api/auth/register works properly via routes/auth.js

// -------------------- ✅ Verify Token --------------------
app.get("/api/auth/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

// -------------------- ✅ Root Test --------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully on Vercel or Local!");
});

// -------------------- ✅ Local Only Server Listener --------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Backend running locally on http://localhost:${PORT}`);
  });
}

// -------------------- ✅ Export App (for Vercel) --------------------
export default app;
