import React, { useState, useEffect } from "react";
import { userApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  Users,
  Search,
  UserPlus,
  Coins,
  Shield,
  Truck,
  User,
  CheckCircle2,
  XCircle,
  Award,
  Edit2,
  RefreshCw
} from "lucide-react";

export default function ManageUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(100);

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "Password123",
    role: "User",
    ecoPoints: 100,
    recycledKg: 0,
    status: "Active"
  });

  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      if (res && res.success && res.data) {
        const formatted = res.data.map((u) => ({
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: (u.role || "user").charAt(0).toUpperCase() + (u.role || "user").slice(1),
          ecoPoints: u.ecoPoints !== undefined ? u.ecoPoints : 100,
          recycledKg: u.recycledKg || 0,
          status: u.status || "Active",
        }));
        setUsersList(formatted);
      }
    } catch (err) {
      console.warn("[ManageUsers] Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All" || u.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    try {
      if (user.id && user.id.length === 24) {
        await userApi.update(user.id, { status: newStatus });
      }
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.warn("Status toggle error:", err.message);
    }
  };

  const handleOpenPointsModal = (u) => {
    setSelectedUserForPoints(u);
    setPointsToAdd(100);
    setShowPointsModal(true);
  };

  const handleGrantPoints = async () => {
    if (!selectedUserForPoints) return;
    const newTotal = Number(selectedUserForPoints.ecoPoints || 0) + Number(pointsToAdd);

    try {
      if (selectedUserForPoints.id && selectedUserForPoints.id.length === 24) {
        await userApi.update(selectedUserForPoints.id, { ecoPoints: newTotal });
      }

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === selectedUserForPoints.id
            ? { ...u, ecoPoints: newTotal }
            : u
        )
      );
      setShowPointsModal(false);
      setPopupState({
        isOpen: true,
        title: "EcoPoints Granted",
        message: `Successfully added +${pointsToAdd} EcoPoints to ${selectedUserForPoints.name}'s account in MongoDB.`,
        type: "success"
      });
    } catch (err) {
      console.error("Point update error:", err);
      setPopupState({
        isOpen: true,
        title: "Update Failed",
        message: err.message || "Failed to grant points.",
        type: "error"
      });
    }
  };

  const handleCreateUser = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      alert("Please provide both name and email.");
      return;
    }

    try {
      const res = await userApi.create({
        name: newUserForm.name,
        email: newUserForm.email,
        password: newUserForm.password || "Password123",
        role: newUserForm.role.toLowerCase(),
        ecoPoints: Number(newUserForm.ecoPoints) || 100,
      });

      if (res && res.success) {
        await loadUsers();
        setShowAddModal(false);
        setNewUserForm({
          name: "",
          email: "",
          password: "Password123",
          role: "User",
          ecoPoints: 100,
          recycledKg: 0,
          status: "Active"
        });

        setPopupState({
          isOpen: true,
          title: "User Registered",
          message: `New account for ${newUserForm.name} (${newUserForm.role}) created in MongoDB. They can now log in immediately with password '${newUserForm.password}'.`,
          type: "success"
        });
      } else {
        throw new Error(res?.message || "Failed to create user.");
      }
    } catch (err) {
      console.error("User creation error:", err);
      alert(`Error creating user: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus User &amp; Role Registry</h1>
          <p className="page-subtitle">
            Manage university student accounts, delivery fleet operators, administrators, and grant reward points.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={loadUsers}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={18} />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            >
              <Search size={16} />
            </div>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "36px" }}
              placeholder="Search member name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="User">Students / Users</option>
            <option value="Delivery">Delivery Agents</option>
            <option value="Admin">Administrators</option>
          </select>
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          Total {filteredUsers.length} Registered Members
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Member Details</th>
              <th>Platform Role</th>
              <th>EcoPoints Balance</th>
              <th>Recycled (kg)</th>
              <th>Account Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  Loading MongoDB members...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary-light)",
                          color: "#1d4ed8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "0.9rem"
                        }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700" }}>{u.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "Admin"
                          ? "badge-purple"
                          : u.role === "Delivery"
                          ? "badge-amber"
                          : "badge-blue"
                      }`}
                    >
                      {u.role === "Admin" ? (
                        <Shield size={12} />
                      ) : u.role === "Delivery" ? (
                        <Truck size={12} />
                      ) : (
                        <User size={12} />
                      )}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      <Coins size={12} color="#f59e0b" />
                      <span>{u.ecoPoints} Pts</span>
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: "600" }}>{u.recycledKg} kg</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.status === "Active" ? "badge-green" : "badge-red"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggleStatus(u)}
                      title="Click to toggle status"
                    >
                      {u.status === "Active" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{u.status}</span>
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenPointsModal(u)}
                      title="Grant Bonus EcoPoints"
                    >
                      <Award size={14} color="#f59e0b" />
                      <span>Bonus Points</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  No members found in MongoDB matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grant Bonus Points Modal */}
      {showPointsModal && selectedUserForPoints && (
        <Popup
          isOpen={true}
          title={`Grant Bonus Points to ${selectedUserForPoints.name}`}
          type="info"
          confirmText="Grant Points"
          cancelText="Cancel"
          onConfirm={handleGrantPoints}
          onCancel={() => setShowPointsModal(false)}
          onClose={() => setShowPointsModal(false)}
        >
          <div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Current balance: <strong>{selectedUserForPoints.ecoPoints} EcoPoints</strong>
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="pts-grant">EcoPoints Amount to Credit</label>
              <input
                id="pts-grant"
                type="number"
                min="10"
                step="10"
                className="form-input"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
              />
            </div>
          </div>
        </Popup>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <Popup
          isOpen={true}
          title="Register New Member in MongoDB"
          type="info"
          confirmText="Create Member"
          cancelText="Cancel"
          onConfirm={handleCreateUser}
          onCancel={() => setShowAddModal(false)}
          onClose={() => setShowAddModal(false)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-name">Full Name</label>
              <input
                id="new-name"
                type="text"
                className="form-input"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                placeholder="e.g. Keerthana Reddy"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-email">Email Address</label>
              <input
                id="new-email"
                type="email"
                className="form-input"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="keerthana@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-pwd">Initial Password</label>
              <input
                id="new-pwd"
                type="password"
                className="form-input"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                placeholder="Password123"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="new-role">Role</label>
                <select
                  id="new-role"
                  className="form-select"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="User">User (Student/Faculty)</option>
                  <option value="Delivery">Delivery Agent</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pts">Initial Welcome Points</label>
                <input
                  id="new-pts"
                  type="number"
                  className="form-input"
                  value={newUserForm.ecoPoints}
                  onChange={(e) => setNewUserForm({ ...newUserForm, ecoPoints: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Popup>
      )}

      {/* Action Notification Popup */}
      <Popup
        isOpen={popupState.isOpen}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        confirmText="OK"
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
      />
    </div>
  );
}
