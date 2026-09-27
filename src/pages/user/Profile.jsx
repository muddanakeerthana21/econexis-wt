import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  User,
  Mail,
  Phone,
  Coins,
  Award,
  Edit2,
  Save,
  CheckCircle2,
  Building2,
  MapPin,
  Sparkles,
  Shield,
  Truck,
  Calendar,
  Layers,
  Leaf
} from "lucide-react";

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();

  const [profileUser, setProfileUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    address: "",
    department: "",
    vehicleNumber: "",
    assignedArea: "",
  });

  const [showSavedPopup, setShowSavedPopup] = useState(false);

  // Fetch real profile from MongoDB on mount
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.getMe();
        if (res && res.success && res.user) {
          if (isMounted) {
            setProfileUser(res.user);
            setFormData({
              name: res.user.name || "",
              email: res.user.email || "",
              phone: res.user.phone || "",
              college: res.user.college || "",
              address: res.user.address || "",
              department: res.user.department || "",
              vehicleNumber: res.user.vehicleNumber || "",
              assignedArea: res.user.assignedArea || "",
            });
          }
        }
      } catch (err) {
        console.warn("[Profile] Failed to fetch latest profile from backend:", err.message);
        if (isMounted && authUser) {
          setProfileUser(authUser);
          setFormData({
            name: authUser.name || "",
            email: authUser.email || "",
            phone: authUser.phone || "",
            college: authUser.college || "",
            address: authUser.address || "",
            department: authUser.department || "",
            vehicleNumber: authUser.vehicleNumber || "",
            assignedArea: authUser.assignedArea || "",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateUser(formData);
      if (updated) {
        setProfileUser(updated);
      }
      setIsEditing(false);
      setShowSavedPopup(true);
    } catch (err) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const userRole = (profileUser?.role || authUser?.role || "USER").toUpperCase();
  const joinDate = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Jan 2026";

  if (loading && !profileUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid var(--border-color)",
              borderTopColor: "var(--green-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Loading profile details from MongoDB...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile &amp; Eco Credentials</h1>
          <p className="page-subtitle">
            Manage your personal contact details, campus address, and view your verified MongoDB sustainability credentials.
          </p>
        </div>
        <button
          className={`btn ${isEditing ? "btn-secondary" : "btn-primary"}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit2 size={16} />
          <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
        </button>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* User Card Overview */}
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              background: userRole === "ADMIN"
                ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                : userRole === "DELIVERY"
                ? "linear-gradient(135deg, #f59e0b, #ea580c)"
                : "linear-gradient(135deg, var(--primary), var(--green-primary))",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.4rem",
              fontWeight: "800",
              color: userRole === "USER" ? "#0f172a" : "#ffffff",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
          >
            {(formData.name || profileUser?.name || "U").charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", marginBottom: "4px" }}>
            {formData.name || profileUser?.name || "Eco Member"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
            <span
              style={{
                fontWeight: "700",
                color: userRole === "ADMIN" ? "#3b82f6" : userRole === "DELIVERY" ? "#f59e0b" : "var(--green-dark)",
              }}
            >
              {userRole}
            </span>{" "}
            • Joined {joinDate} • Status:{" "}
            <span style={{ color: profileUser?.status === "Active" ? "#10b981" : "#ef4444", fontWeight: "600" }}>
              {profileUser?.status || "Active"}
            </span>
          </p>

          {/* Badges / Metrics */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
            {userRole === "USER" && (
              <>
                <span className="badge badge-green">
                  <Award size={13} />
                  <span>{profileUser?.greenLevel || "Eco Hero"}</span>
                </span>
                <span className="badge badge-blue">
                  <Coins size={13} />
                  <span>{profileUser?.ecoPoints !== undefined ? profileUser.ecoPoints : 100} EcoPoints</span>
                </span>
                <span className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                  <Leaf size={13} />
                  <span>{profileUser?.recycledKg || 0} kg Recycled</span>
                </span>
              </>
            )}

            {userRole === "ADMIN" && (
              <>
                <span className="badge badge-blue">
                  <Shield size={13} />
                  <span>System Administrator</span>
                </span>
                <span className="badge badge-green">
                  <CheckCircle2 size={13} />
                  <span>Full Administrative Privileges</span>
                </span>
              </>
            )}

            {userRole === "DELIVERY" && (
              <>
                <span className="badge badge-green">
                  <Truck size={13} />
                  <span>Field Logistics Agent</span>
                </span>
                <span className="badge badge-blue">
                  <span>{profileUser?.vehicleNumber || "EV-VAN-4022"}</span>
                </span>
              </>
            )}
          </div>

          <div
            style={{
              textAlign: "left",
              backgroundColor: "var(--bg-surface-secondary)",
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "0.9rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Mail size={16} color="var(--primary-dark)" />
              <span style={{ color: "var(--text-secondary)", wordBreak: "break-all" }}>
                {profileUser?.email || formData.email}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Phone size={16} color="var(--primary-dark)" />
              <span style={{ color: "var(--text-secondary)" }}>
                {formData.phone || "+91 98765 00000"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Building2 size={16} color="var(--primary-dark)" />
              <span style={{ color: "var(--text-secondary)" }}>
                {formData.college || "National Institute of Technology"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MapPin size={16} color="var(--primary-dark)" />
              <span style={{ color: "var(--text-secondary)" }}>
                {formData.address || "Campus Residence"}
              </span>
            </div>

            {userRole === "ADMIN" && formData.department && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Shield size={16} color="var(--primary-dark)" />
                <span style={{ color: "var(--text-secondary)" }}>{formData.department}</span>
              </div>
            )}

            {userRole === "DELIVERY" && formData.assignedArea && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Truck size={16} color="var(--primary-dark)" />
                <span style={{ color: "var(--text-secondary)" }}>{formData.assignedArea}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={20} color="var(--primary-dark)" />
              <span>Personal &amp; Campus Details</span>
            </h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                name="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="prof-email">Email Address</label>
                <input
                  id="prof-email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  disabled={true}
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">Phone Number</label>
                <input
                  id="prof-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-college">University / College Campus</label>
              <input
                id="prof-college"
                name="college"
                type="text"
                className="form-input"
                value={formData.college}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-address">Hostel / Campus Room / Street Address</label>
              <textarea
                id="prof-address"
                name="address"
                className="form-textarea"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
              ></textarea>
            </div>

            {userRole === "ADMIN" && (
              <div className="form-group">
                <label className="form-label" htmlFor="prof-dept">Administrative Department</label>
                <input
                  id="prof-dept"
                  name="department"
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            )}

            {userRole === "DELIVERY" && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-vehicle">Vehicle Number</label>
                  <input
                    id="prof-vehicle"
                    name="vehicleNumber"
                    type="text"
                    className="form-input"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-area">Assigned Delivery Area</label>
                  <input
                    id="prof-area"
                    name="assignedArea"
                    type="text"
                    className="form-input"
                    value={formData.assignedArea}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}

            {isEditing && (
              <button
                type="submit"
                className="btn btn-success btn-lg"
                style={{ width: "100%", marginTop: "10px" }}
                disabled={saving}
              >
                <Save size={18} />
                <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
              </button>
            )}
          </form>
        </div>
      </div>

      <Popup
        isOpen={showSavedPopup}
        title="Profile Updated"
        message="Your profile details have been successfully updated in MongoDB."
        type="success"
        confirmText="OK"
        onClose={() => setShowSavedPopup(false)}
      />
    </div>
  );
}
