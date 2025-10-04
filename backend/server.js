import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import db from "./db.js"; // ✅ MySQL connection

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create default admin if not exists
const createAdminIfNotExists = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");

    if (rows.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin", "admin@example.com", hash, "admin"]
      );
      console.log("✅ Default admin created: admin@example.com / admin123");
    } else {
      console.log("✅ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("🚀 Checklist Management Backend Running...");
});

// ✅ Only run server locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    console.log(`✅ Local Server: http://localhost:${PORT}`);
    await createAdminIfNotExists();
  });
} else {
  // ✅ Run admin creation once on cold start in Vercel
  createAdminIfNotExists();
}

// ✅ Export for Vercel Serverless
export default app;
