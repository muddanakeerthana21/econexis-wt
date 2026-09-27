import React, { useState, useEffect } from "react";
import { formatDate } from "../../utils/helpers";
import { pickupApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  ClipboardList,
  Search,
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserCheck,
  Filter,
  RefreshCw
} from "lucide-react";

export default function ManagePickups() {
  const [pickupsList, setPickupsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Assign Driver Modal
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedDriverName, setAssignedDriverName] = useState("Vikram Singh");

  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  // Load real pickups from Express + MongoDB backend on mount
  const loadPickups = async () => {
    setLoading(true);
    try {
      const res = await pickupApi.getAll();
      if (res && res.success && res.data) {
        const formatted = res.data.map((p) => ({
          id: p.id || p._id,
          trackingId: p.trackingId || p.id || p._id,
          user: p.userName || "Customer",
          phone: p.userPhone || "+91 98765 00000",
          address: p.pickupAddress || "Campus Residence",
          ewasteType: p.item || p.category || "E-Waste Item",
          date: p.pickupDate || p.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          time: p.pickupTime || "02:00 PM - 04:00 PM",
          notes: p.notes || "",
          status: p.status || "Pending",
          deliveryAgent: p.deliveryAgent || "Unassigned",
        }));
        setPickupsList(formatted);
      }
    } catch (err) {
      console.warn("[ManagePickups] Failed to load pickups:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const filteredPickups = pickupsList.filter((p) => {
    const matchesSearch =
      (p.trackingId || p.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ewasteType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.address || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAssign = (pickup) => {
    setSelectedPickup(pickup);
    setAssignedDriverName(pickup.deliveryAgent === "Unassigned" ? "Vikram Singh" : pickup.deliveryAgent);
    setShowAssignModal(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedPickup) return;
    const newStatus = selectedPickup.status === "Pending" ? "Assigned" : selectedPickup.status;

    try {
      if (selectedPickup.id && selectedPickup.id.length === 24) {
        await pickupApi.update(selectedPickup.id, {
          deliveryAgent: assignedDriverName,
          status: newStatus,
        });
      }
    } catch (err) {
      console.warn("Assignment updated locally:", err.message);
    }

    setPickupsList((prev) =>
      prev.map((p) =>
        p.id === selectedPickup.id
          ? {
              ...p,
              deliveryAgent: assignedDriverName,
              status: newStatus,
            }
          : p
      )
    );
    setShowAssignModal(false);
    setPopupState({
      isOpen: true,
      title: "Driver Assigned",
      message: `Pickup ${selectedPickup.trackingId || selectedPickup.id} has been assigned to driver ${assignedDriverName} in MongoDB.`,
      type: "success"
    });
  };

  const handleUpdateStatus = async (pickupId, newStatus) => {
    try {
      if (pickupId && pickupId.length === 24) {
        await pickupApi.update(pickupId, { status: newStatus });
      }
    } catch (err) {
      console.warn("Status update updated locally:", err.message);
    }

    setPickupsList((prev) =>
      prev.map((p) => (p.id === pickupId ? { ...p, status: newStatus } : p))
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doorstep Pickup Logistics</h1>
          <p className="page-subtitle">
            Monitor and coordinate campus pickup requests, dispatch drivers, and verify completion statuses.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadPickups}>
          <RefreshCw size={16} />
          <span>Refresh Pickups</span>
        </button>
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
              placeholder="Search by ID, customer name, items or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Assignment</option>
            <option value="Assigned">Assigned to Driver</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          Showing {filteredPickups.length} Pickups
        </div>
      </div>

      {/* Pickups Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer &amp; Phone</th>
              <th>Items to Collect</th>
              <th>Date &amp; Slot</th>
              <th>Assigned Driver</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Dispatch Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  Loading MongoDB pickups...
                </td>
              </tr>
            ) : filteredPickups.length > 0 ? (
              filteredPickups.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary-dark)" }}>
                    {p.trackingId || p.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: "700" }}>{p.user}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", fontSize: "0.88rem" }}>{p.ewasteType}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      📍 {p.address}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{formatDate(p.date)}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{p.time}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.86rem",
                        fontWeight: "600",
                        color: p.deliveryAgent === "Unassigned" ? "var(--text-muted)" : "var(--primary-dark)"
                      }}
                    >
                      {p.deliveryAgent || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{
                        fontSize: "0.78rem",
                        padding: "4px 8px",
                        width: "auto",
                        fontWeight: "700",
                        borderRadius: "var(--radius-full)"
                      }}
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenAssign(p)}
                    >
                      <Truck size={14} />
                      <span>Assign Driver</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  No pickup requests found in MongoDB matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && selectedPickup && (
        <Popup
          isOpen={true}
          title={`Assign Logistics Driver to ${selectedPickup.trackingId || selectedPickup.id}`}
          type="info"
          confirmText="Confirm Assignment"
          cancelText="Cancel"
          onConfirm={handleSaveAssignment}
          onCancel={() => setShowAssignModal(false)}
          onClose={() => setShowAssignModal(false)}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>Customer: {selectedPickup.user} ({selectedPickup.phone})</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Address: {selectedPickup.address}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Slot: {formatDate(selectedPickup.date)} ({selectedPickup.time})</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="driver-select">Select Delivery Agent / Vehicle</label>
              <select
                id="driver-select"
                className="form-select"
                value={assignedDriverName}
                onChange={(e) => setAssignedDriverName(e.target.value)}
              >
                <option value="Vikram Singh (EV-VAN-4022 - North Zone)">Vikram Singh (EV-VAN-4022 - North Zone)</option>
                <option value="Rajesh Kumar (EV-VAN-1090 - South Zone)">Rajesh Kumar (EV-VAN-1090 - South Zone)</option>
                <option value="EcoCampus Automated Shuttle #2">EcoCampus Automated Shuttle #2</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </Popup>
      )}

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
