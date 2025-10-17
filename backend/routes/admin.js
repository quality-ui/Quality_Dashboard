// backend/routes/admin.js
import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * ✅ GET /api/admin/users
 * Get all users (admin only)
 */
router.get("/users", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    // 🔹 Adjust columns if your table doesn’t have created_at
    const [rows] = await db.query(
      "SELECT id, name, email, role FROM users"
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ➕ POST /api/admin/users
 * Create new user (admin only)
 */
router.post("/users", verifyToken, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role || "user"]
    );

    res.json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ success: false, message: "Server error while creating user" });
  }
});

/**
 * ✏️ PUT /api/admin/users/:id
 * Update user details (admin only)
 */
router.put("/users/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { id } = req.params;
    const { name, email, password, role } = req.body;

    let query, params;

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

/**
 * 🗑️ DELETE /api/admin/users/:id
 * Delete user (admin only)
 */
router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
