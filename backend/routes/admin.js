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
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 🗑️ DELETE /api/admin/users/:id
 * Delete user by ID (admin only)
 */
router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete user" });
  }
});

/**
 * ✏️ PUT /api/admin/users/:id
 * Update user details (admin only)
 */
router.put("/users/:id", verifyToken, async (req, res) => {
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
    res
      .status(500)
      .json({ success: false, message: "Failed to update user" });
  }
});

export default router;
