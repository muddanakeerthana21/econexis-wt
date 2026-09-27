import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userApi, pickupApi, ewasteApi } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import StatCard from "../../components/StatCard";
import Popup from "../../components/Popup";
import {
  Shield,
  Users,
  Truck,
  Scale,
  Leaf,
  Coins,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MapPin,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  Cpu,
  PackageCheck,
  RefreshCw,
  QrCode,
  Recycle
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [ewasteItems, setEwasteItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    deliveryAgents: 0,
    totalEwaste: 0,
    pendingPickups: 0,
    pickedUpCount: 0,
    recycledCount: 0,
    totalWeightKg: 0,
    totalCo2SavedKg: 0,
  });

  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ewasteRes] = await Promise.all([
        ewasteApi.getAdminStats().catch(() => null),
        ewasteApi.getAll().catch(() => null),
      ]);

      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (ewasteRes && ewasteRes.success && ewasteRes.data) {
        setEwasteItems(ewasteRes.data);
      }
    } catch (err) {
      console.warn("[AdminDashboard] Data fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleMarkRecycled = async (objectId) => {
    setActionLoading(objectId);
    try {
      const res = await ewasteApi.recycleObject(objectId, { notes: "Recycled at campus facility" });
      if (res && res.success) {
        setPopupState({
          isOpen: true,
          title: "Item Recycled! ♻️",
          message: `E-Waste item ${objectId} marked as Recycled in MongoDB. Owner credited with EcoPoints and recycling weight.`,
          type: "success"
        });
        await fetchAdminData();
      } else {
        throw new Error(res?.message || "Failed to mark as recycled.");
      }
    } catch (err) {
      console.error("[Recycle error]:", err);
      setPopupState({
        isOpen: true,
        title: "Recycle Update Failed",
        message: err.message || "Failed to update item status.",
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEwaste = ewasteItems.filter((item) => {
    const objectId = (item.objectId || item.itemId || "").toLowerCase();
    const type = (item.type || item.itemName || "").toLowerCase();
    const aiDetection = (item.aiDetection || "").toLowerCase();
    const owner = (item.owner || item.userName || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      objectId.includes(q) ||
      type.includes(q) ||
      aiDetection.includes(q) ||
      owner.includes(q);

    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter ||
      item.pickupStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Admin Hero Header */}
      <div className="hero-banner" style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.25))" }}>
        <div>
          <div className="badge badge-blue" style={{ marginBottom: "8px" }}>
            <Shield size={14} />
            <span>Master Operations Console</span>
          </div>
          <h1 className="hero-banner-title">
            Sustainability &amp; Operations Center
          </h1>
          <p className="hero-banner-subtitle">
            Welcome, {user?.name || "Dr. Sunita Rao"}. Real-time monitoring of registered E-Waste objects in MongoDB, pickup statuses, and driver verifications.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={fetchAdminData}>
            <RefreshCw size={16} />
            <span>Refresh Telemetry</span>
          </button>
          <Link to="/admin/pickups" className="btn btn-primary">
            <ClipboardList size={18} />
            <span>Manage Pickups</span>
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            <Users size={18} />
            <span>User Registry</span>
          </Link>
        </div>
      </div>

      {/* Aggregate Stats from MongoDB */}
      <div className="grid-4" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Registered E-Waste"
          value={`${stats.totalEwaste} Objects`}
          icon={<Cpu size={26} />}
          variant="green"
          description={`${stats.recycledCount} Recycled • ${stats.totalWeightKg} kg`}
        />
        <StatCard
          title="Active Eco Members"
          value={`${stats.totalUsers}`}
          icon={<Users size={26} />}
          variant="blue"
          description={`${stats.deliveryAgents} Delivery Agents`}
        />
        <StatCard
          title="Pending Pickups"
          value={`${stats.pendingPickups}`}
          icon={<Truck size={26} />}
          variant="amber"
          description="Awaiting Driver Scan"
        />
        <StatCard
          title="Picked Up / In Transit"
          value={`${stats.pickedUpCount}`}
          icon={<PackageCheck size={26} />}
          variant="purple"
          description="Verified by Delivery"
        />
      </div>

      {/* Real E-Waste Object Registry Table from MongoDB */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 className="card-title">
              <Cpu size={20} color="var(--primary-dark)" />
              <span>Registered E-Waste Objects (MongoDB Database)</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
              Live server records created via AI Visual Scanner and verified by delivery partners.
            </p>
          </div>
          <span className="badge badge-green">
            {ewasteItems.length} Registered Objects
          </span>
        </div>

        {/* Filter and Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "36px" }}
              placeholder="Search by Object ID (e.g. OBJ-000001), type, AI detection, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              className="form-select"
              style={{ width: "auto", fontWeight: "600" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Registered">Registered (Pending)</option>
              <option value="Pending">Pending</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Recycled">Recycled</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Object ID</th>
                <th>E-Waste Type</th>
                <th>AI Detection Result</th>
                <th>Owner / User</th>
                <th>Status</th>
                <th>Pickup Status</th>
                <th>Delivery Partner</th>
                <th>Date Created</th>
                <th style={{ textAlign: "right" }}>Recycling Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEwaste.length > 0 ? (
                filteredEwaste.map((item) => {
                  const objectId = item.objectId || item.itemId || "—";
                  const type = item.type || item.itemName || "Electronics";
                  const aiDetection = item.aiDetection || item.type || "Unknown";
                  const confidence = item.aiConfidence ? `${item.aiConfidence}%` : "95%";
                  const owner = item.owner || item.userName || "Eco Contributor";
                  const isRecycled = item.status === "Recycled";
                  const isPickedUp = item.pickupStatus === "Picked Up" || item.status === "Picked Up";
                  const deliveryPartner = item.deliveryPartnerName || (isPickedUp ? "Verified Driver" : "—");
                  const dateStr = formatDate(item.createdAt);

                  return (
                    <tr key={item._id || objectId}>
                      <td style={{ fontFamily: "monospace", fontWeight: "800", color: "var(--primary-dark)", fontSize: "0.95rem" }}>
                        {objectId}
                      </td>
                      <td style={{ fontWeight: "700" }}>
                        {type}
                      </td>
                      <td>
                        <span className="badge badge-blue" style={{ fontSize: "0.78rem" }}>
                          <Sparkles size={12} />
                          <span>{aiDetection} ({confidence})</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", fontSize: "0.88rem" }}>{owner}</div>
                      </td>
                      <td>
                        <span className={`badge ${isRecycled ? "badge-green" : isPickedUp ? "badge-purple" : "badge-blue"}`}>
                          {item.status || "Registered"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isPickedUp || isRecycled ? "badge-green" : "badge-amber"}`}>
                          {item.pickupStatus || "Pending"}
                        </span>
                      </td>
                      <td style={{ color: deliveryPartner === "—" ? "var(--text-muted)" : "var(--primary-dark)", fontWeight: "600" }}>
                        {deliveryPartner}
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {isRecycled ? (
                          <span style={{ fontSize: "0.82rem", color: "var(--green-dark)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={14} />
                            <span>Recycled</span>
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleMarkRecycled(objectId)}
                            disabled={actionLoading === objectId}
                            style={{ borderColor: "var(--green-primary)", color: "var(--green-dark)", fontWeight: "700" }}
                            title="Mark this item as processed & recycled"
                          >
                            <Recycle size={13} />
                            <span>{actionLoading === objectId ? "Recycling..." : "Mark Recycled"}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    {loading ? (
                      <div>Loading MongoDB E-Waste records...</div>
                    ) : (
                      <div>No e-waste objects found matching your query. Register one from the AI Scanner!</div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operations Quick Action Panels */}
      <div className="grid-2" style={{ marginBottom: "28px" }}>
        {/* Quick Operations Shortcuts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={20} color="var(--green-dark)" />
              <span>Operations Quick Actions</span>
            </h3>
          </div>

          <div className="grid-2">
            <Link to="/admin/pickups" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--primary-light)", color: "#1d4ed8" }}>
                <ClipboardList size={22} />
              </div>
              <div>
                <div className="quick-action-title">Pickup Dispatch</div>
                <div className="quick-action-desc">Assign field drivers to open requests</div>
              </div>
            </Link>

            <Link to="/admin/users" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--green-light)", color: "var(--green-dark)" }}>
                <Users size={22} />
              </div>
              <div>
                <div className="quick-action-title">Manage Members</div>
                <div className="quick-action-desc">Grant points &amp; inspect user activity</div>
              </div>
            </Link>

            <Link to="/centers" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--accent-amber-light)", color: "#b45309" }}>
                <MapPin size={22} />
              </div>
              <div>
                <div className="quick-action-title">Collection Centers</div>
                <div className="quick-action-desc">Monitor smart kiosk fill levels</div>
              </div>
            </Link>

            <Link to="/rewards" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--accent-purple-light)", color: "#6d28d9" }}>
                <Coins size={22} />
              </div>
              <div>
                <div className="quick-action-title">EcoRewards Hub</div>
                <div className="quick-action-desc">Audit claimed student vouchers</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Telemetry Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={20} color="var(--primary-dark)" />
              <span>Logistics &amp; Verification Stream</span>
            </h3>
            <span className="badge badge-green">MongoDB Synced</span>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-left">
                <div className="activity-icon" style={{ color: "#059669" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="activity-title">Object ID Generation &amp; QR Tagging</div>
                  <div className="activity-time">Atomic sequential numbering (OBJ-000001) enabled</div>
                </div>
              </div>
              <span className="badge badge-green">Active</span>
            </div>

            <div className="activity-item">
              <div className="activity-left">
                <div className="activity-icon" style={{ color: "#3b82f6" }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div className="activity-title">Delivery QR Verification Scanner</div>
                  <div className="activity-time">Live MongoDB validation via GET /api/ewaste/object/:id</div>
                </div>
              </div>
              <span className="badge badge-blue">Ready</span>
            </div>

            <div className="activity-item">
              <div className="activity-left">
                <div className="activity-icon" style={{ color: "#8b5cf6" }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <div className="activity-title">AI E-Waste Vision Classifier</div>
                  <div className="activity-time">TensorFlow.js COCO-SSD object inference active</div>
                </div>
              </div>
              <span className="badge badge-purple">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Notification Popup */}
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
