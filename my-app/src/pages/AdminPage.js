// src/pages/AdminPage.js
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";


export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch users failed:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter + sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changeSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(
        `${API_BASE_URL}/api/admin/users/${editingUser._id || editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingUser),
        }
      );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      <div className="admin-actions">
        <button onClick={() => navigate("/register")} className="register-btn">
          ➕ Register New User
        </button>
      </div>

      <div className="table-controls">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th onClick={() => changeSort("name")}>
              Name {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => changeSort("email")}>
              Email {sortField === "email" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => changeSort("role")}>
              Role {sortField === "role" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((u) => (
              <tr key={u._id || u.id}>
                <td>{u._id || u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(u)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(u._id || u.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅ Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}

      {editingUser && (
        <div className="modal">
          <form onSubmit={handleUpdate} className="edit-form">
            <h3>Edit User</h3>
            <label>Name</label>
            <input
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />
            <label>Email</label>
            <input
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
            <label>Password (optional)</label>
            <input
              type="password"
              onChange={(e) =>
                setEditingUser({ ...editingUser, password: e.target.value })
              }
            />
            <label>Role</label>
            <select
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <div className="edit-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
