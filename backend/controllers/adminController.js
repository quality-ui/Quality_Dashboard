import { db } from "../db.js"; // your MySQL connection

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role FROM Users");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM Users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (password) {
      // Hash password if provided
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE Users SET name=?, email=?, password=?, role=? WHERE id=?",
        [name, email, hashed, role, id]
      );
    } else {
      await db.query(
        "UPDATE Users SET name=?, email=?, role=? WHERE id=?",
        [name, email, role, id]
      );
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
