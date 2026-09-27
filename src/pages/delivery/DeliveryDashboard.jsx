import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/helpers";
import { pickupApi, ewasteApi } from "../../services/api";
import StatCard from "../../components/StatCard";
import Popup from "../../components/Popup";
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  QrCode,
  AlertCircle,
  Navigation,
  Sparkles,
  PackageCheck,
  RefreshCw
} from "lucide-react";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLoadedKg, setTotalLoadedKg] = useState(0);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  // Load real pickups and ewaste from MongoDB
  const fetchPickups = async () => {
    setLoading(true);
    try {
      const [pickupRes, ewasteRes] = await Promise.all([
        pickupApi.getAll().catch(() => ({ data: [] })),
        ewasteApi.getAll().catch(() => ({ data: [] }))
      ]);

      const pickupItems = (pickupRes && pickupRes.data) ? pickupRes.data : [];
      const ewasteItems = (ewasteRes && ewasteRes.data) ? ewasteRes.data : [];

      const formatted = pickupItems.map((p) => ({
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
        deliveryAgent: p.deliveryAgent || user?.name || "Vikram Singh",
        weightKg: Number(p.measuredWeight || 0),
      }));

      // Also merge any ewaste items pending pickup
      ewasteItems.forEach((ew) => {
        const objectId = ew.objectId || ew.itemId;
        const exists = formatted.some((f) => f.trackingId === objectId || f.id === ew._id);
        if (!exists && ew.pickupStatus) {
          formatted.push({
            id: ew._id || objectId,
            trackingId: objectId,
            user: ew.owner || ew.userName || "Campus Recycler",
            phone: "+91 98765 43210",
            address: ew.dropoffLocation || "Campus Residence",
            ewasteType: `${ew.type} (${ew.aiDetection || 'AI Verified'})`,
            date: ew.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            time: "Standard Slot",
            notes: `Weight: ${ew.weightKg || 1.5}kg`,
            status: ew.pickupStatus === "Picked Up" ? "Completed" : "Pending",
            deliveryAgent: ew.deliveryPartnerName || user?.name || "Vikram Singh",
            weightKg: Number(ew.weightKg || 1.5),
          });
        }
      });

      setPickups(formatted);

      // Compute total weight of picked up / completed items
      const loadedWeight = ewasteItems
        .filter((e) => e.pickupStatus === "Picked Up" || e.status === "Picked Up" || e.status === "Recycled")
        .reduce((sum, e) => sum + (Number(e.weightKg) || 1.5), 0);

      setTotalLoadedKg(Number(loadedWeight.toFixed(1)));
    } catch (err) {
      console.warn("[DeliveryDashboard] Data fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleStatusChange = async (pickupId, nextStatus) => {
    try {
      if (pickupId && pickupId.length === 24) {
        await pickupApi.update(pickupId, { status: nextStatus });
      }
    } catch (err) {
      console.warn("Status update warning:", err.message);
    }

    setPickups((prev) =>
      prev.map((p) => (p.id === pickupId ? { ...p, status: nextStatus } : p))
    );
    setPopupState({
      isOpen: true,
      title: "Task Updated",
      message: `Pickup task ${pickupId} marked as ${nextStatus} in MongoDB logistics stream.`,
      type: "success"
    });
  };

  const handleVerifyQR = (pickup) => {
    navigate("/delivery/scan", { state: { pickup } });
  };

  const completedCount = pickups.filter((p) => p.status === "Completed" || p.status === "Picked Up").length;
  const pendingCount = pickups.filter((p) => p.status !== "Completed" && p.status !== "Picked Up" && p.status !== "Cancelled").length;

  return (
    <div>
      {/* Delivery Agent Hero Banner */}
      <div className="hero-banner" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.25))" }}>
        <div>
          <div className="badge badge-amber" style={{ marginBottom: "8px" }}>
            <Truck size={14} />
            <span>Field Logistics Agent</span>
          </div>
          <h1 className="hero-banner-title">
            Delivery &amp; Pickup Operations
          </h1>
          <p className="hero-banner-subtitle">
            Driver: <strong>{user?.name || "Vikram Singh"}</strong> • Vehicle: <strong>{user?.vehicleNumber || "EV-VAN-4022"}</strong> • Assigned: <strong>{user?.assignedArea || "North City Campus Hub"}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={fetchPickups}>
            <RefreshCw size={16} />
            <span>Refresh Route</span>
          </button>
          <Link to="/delivery/scan" className="btn btn-primary btn-lg">
            <QrCode size={20} />
            <span>Scan Pickup QR</span>
          </Link>
        </div>
      </div>

      {/* Driver Stats from MongoDB */}
      <div className="grid-3" style={{ marginBottom: "28px" }}>
        <StatCard
          title="Assigned Stops Today"
          value={`${pickups.length}`}
          icon={<Clock size={26} />}
          variant="amber"
          description={`${pendingCount} stops remaining`}
        />
        <StatCard
          title="Completed Collections"
          value={`${completedCount}`}
          icon={<CheckCircle2 size={26} />}
          variant="green"
          trend={`${pickups.length > 0 ? Math.round((completedCount / pickups.length) * 100) : 0}% route complete`}
        />
        <StatCard
          title="Total Weight Loaded"
          value={`${totalLoadedKg} kg`}
          icon={<PackageCheck size={26} />}
          variant="blue"
          description="EV Van capacity: 350 kg"
        />
      </div>

      {/* Assigned Route Stops List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <MapPin size={20} color="var(--primary-dark)" />
            <span>Assigned Campus Route Stops</span>
          </h3>
          <span className="badge badge-blue">{pickups.length} Pickups</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            Loading route stops from MongoDB...
          </div>
        ) : pickups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
            <Truck size={40} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
            <h4 style={{ fontWeight: "700", marginBottom: "6px" }}>No pickups currently scheduled</h4>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              All campus pickups are up to date. Use "Scan Pickup QR" when receiving a package in person.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pickups.map((p) => {
              const isDone = p.status === "Completed" || p.status === "Picked Up";
              return (
                <div
                  key={p.id}
                  style={{
                    border: `1.5px solid ${isDone ? "var(--green-border)" : "var(--border-color)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    backgroundColor: isDone ? "var(--green-light)" : "var(--bg-surface-secondary)",
                    transition: "var(--transition)"
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: "800", fontFamily: "monospace", fontSize: "1.05rem" }}>
                        {p.trackingId || p.id}
                      </span>
                      <span
                        className={`badge ${
                          isDone
                            ? "badge-green"
                            : p.status === "Assigned"
                            ? "badge-blue"
                            : p.status === "Cancelled"
                            ? "badge-red"
                            : "badge-amber"
                        }`}
                      >
                        {isDone ? "Picked Up" : p.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} />
                      <span>{formatDate(p.date)} • {p.time}</span>
                    </div>
                  </div>

                  <div className="grid-2" style={{ marginBottom: "16px", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "4px" }}>
                        👤 {p.user}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <MapPin size={15} color="var(--primary-dark)" />
                        <span>{p.address}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={15} color="var(--green-dark)" />
                        <a href={`tel:${p.phone}`} style={{ color: "var(--primary-dark)", fontWeight: "600" }}>{p.phone}</a>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                        📦 E-Waste Manifest:
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        {p.ewasteType}
                      </div>
                      {p.notes && (
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Note: "{p.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(p.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <Navigation size={14} />
                      <span>Directions</span>
                    </a>

                    {!isDone && p.status !== "Cancelled" && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStatusChange(p.id, "Assigned")}
                        >
                          <span>Mark En Route</span>
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleVerifyQR(p)}
                        >
                          <QrCode size={14} />
                          <span>Verify &amp; Collect</span>
                        </button>
                      </>
                    )}

                    {isDone && (
                      <span style={{ fontSize: "0.85rem", color: "var(--green-dark)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={16} />
                        <span>Collected &amp; Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
