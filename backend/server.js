// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import icuRoutes from "./routes/icuRoutes.js";

dotenv.config();

const app = express();

// -------------------- ✅ CORS --------------------
const allowedOrigins = [
  "http://localhost:5000", // local frontend
  "https://your-frontend.vercel.app", // replace with deployed frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // only if you use cookies/sessions
  })
);

app.use(express.json());

// -------------------- ✅ JWT --------------------
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// -------------------- ✅ Routes --------------------
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", icuRoutes);

// ------------------------- 🔐 LOGIN -------------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------- ✅ Registration disabled --------------------
app.post("/api/auth/register", (req, res) => {
  return res.status(403).json({
    success: false,
    message:
      "Registration is disabled. Only admin can add users directly in database.",
  });
});

// -------------------- ✅ Verify token --------------------
app.get("/api/auth/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

// -------------------- ✅ Root test route --------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully on Vercel!");
});

// -------------------- ✅ Export for Vercel --------------------
export default app;
