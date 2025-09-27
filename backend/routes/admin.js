// backend/routes/admin.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = express.Router();

// 🔐 Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// 📋 Get all users (Admin only)
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users"
    );
    res.json(rows); // ✅ return array (not {rows})
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🗑️ Delete user (Admin only)
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

// ✏️ Update user (Admin only)
router.put("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    let query;
    let params;

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      query = `UPDATE users SET name=?, email=?, password=?, role=? WHERE id=?`;
      params = [name, email, hashed, role, id];
    } else {
      query = `UPDATE users SET name=?, email=?, role=? WHERE id=?`;
      params = [name, email, role, id];
    }

    await db.query(query, params);
    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

export default router;
