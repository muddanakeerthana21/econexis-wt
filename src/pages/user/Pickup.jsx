import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { generatePickupId, formatDate } from "../../utils/helpers";
import { pickupApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  PackageCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function Pickup() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || "Aarav Sharma",
    phone: user?.phone || "+91 98765 43210",
    address: user?.address || "Room 304, Block B, Campus Hostel, National Institute of Technology",
    ewasteType: "Smartphones & Laptops",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    time: "02:00 PM - 04:00 PM",
    notes: ""
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdPickupId, setCreatedPickupId] = useState("");

  // Load real pickups from Express + MongoDB backend
  const loadPickups = async () => {
    setLoading(true);
    try {
      const res = await pickupApi.getAll();
      if (res && res.success && res.data) {
        const formatted = res.data.map((p) => ({
          id: p.id || p._id,
          trackingId: p.trackingId || p.id || p._id,
          user: p.userName || p.user || user?.name,
          phone: p.userPhone || user?.phone || "",
          address: p.pickupAddress || p.address,
          ewasteType: p.item || p.category || p.ewasteType,
          date: p.pickupDate || p.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          time: p.pickupTime || "02:00 PM - 04:00 PM",
          notes: p.notes || "",
          status: p.status || "Pending",
          deliveryAgent: p.deliveryAgent || "Assigning nearest agent...",
        }));
        setPickups(formatted);
      }
    } catch (err) {
      console.warn("[Pickup] Failed to load pickups:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, [user]);

  // Synchronize form with logged-in user details
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await pickupApi.create({
        userName: formData.name,
        userPhone: formData.phone,
        item: formData.ewasteType,
        category: formData.ewasteType,
        quantity: 1,
        pickupAddress: formData.address,
        pickupDate: formData.date,
        pickupTime: formData.time,
        notes: formData.notes,
        status: "Pending",
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const newTrackingId = saved.trackingId || saved.id || saved._id;
        setCreatedPickupId(newTrackingId);
        await loadPickups();
        setShowSuccessPopup(true);
      } else {
        throw new Error(res?.message || "Failed to create pickup.");
      }
    } catch (err) {
      console.error("[Pickup Submission Error]:", err);
      alert(`Could not schedule pickup: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doorstep E-Waste Pickup</h1>
          <p className="page-subtitle">
            Schedule a free campus or doorstep collection with certified e-waste logistics agents.
          </p>
        </div>
        <div className="badge badge-green">
          <Truck size={14} />
          <span>Free Campus Pickup</span>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Schedule Pickup Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PlusCircle size={20} color="var(--primary-dark)" />
              <span>Schedule New Pickup</span>
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="pickup-name">Contact Name</label>
                <input
                  id="pickup-name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pickup-phone">Phone Number</label>
                <input
                  id="pickup-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pickup-address">Pickup Address / Hostel &amp; Room</label>
              <input
                id="pickup-address"
                name="address"
                type="text"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Room 201, Ramanujan Hostel, University Campus"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pickup-ewasteType">E-Waste Categories to Collect</label>
              <select
                id="pickup-ewasteType"
                name="ewasteType"
                className="form-select"
                value={formData.ewasteType}
                onChange={handleChange}
              >
                <option value="Smartphones & Laptops">Smartphones &amp; Laptops</option>
                <option value="Desktop CPU, Monitor & Keyboard">Desktop CPU, Monitor &amp; Keyboard</option>
                <option value="Batteries, Chargers & Power Banks">Batteries, Chargers &amp; Power Banks</option>
                <option value="Printers, Scanners & Peripherals">Printers, Scanners &amp; Peripherals</option>
                <option value="Home Appliances & Television">Home Appliances &amp; Television</option>
                <option value="Mixed Electronic Scraps">Mixed Electronic Scraps</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="pickup-date">Preferred Date</label>
                <input
                  id="pickup-date"
                  name="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pickup-time">Preferred Time Slot</label>
                <select
                  id="pickup-time"
                  name="time"
                  className="form-select"
                  value={formData.time}
                  onChange={handleChange}
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pickup-notes">Special Instructions (Optional)</label>
              <textarea
                id="pickup-notes"
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Call 10 mins before arrival or leave with hostel reception..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "10px" }}
            >
              <Truck size={18} />
              <span>Schedule Pickup</span>
            </button>
          </form>
        </div>

        {/* Upcoming & Active Pickups */}
        <div>
          <div className="card-header" style={{ marginBottom: "14px" }}>
            <h3 className="card-title">
              <PackageCheck size={20} color="var(--green-dark)" />
              <span>Your Pickup Requests</span>
            </h3>
            <span className="badge badge-blue">{pickups.length} Total</span>
          </div>

          {loading ? (
            <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading your pickup requests from MongoDB...
            </div>
          ) : pickups.length === 0 ? (
            <div className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
              <Truck size={36} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
              <h4 style={{ fontWeight: "700", marginBottom: "6px" }}>No pickups scheduled yet</h4>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                Fill out the schedule form on the left to request doorstep pickup of your e-waste items.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pickups.map((p) => (
                <div key={p.id} className="card" style={{ padding: "18px" }}>
                  <div className="flex-between" style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", fontFamily: "monospace", fontSize: "0.95rem" }}>
                        {p.trackingId || p.id}
                      </span>
                      <span
                        className={`badge ${
                          p.status === "Completed"
                            ? "badge-green"
                            : p.status === "Assigned"
                            ? "badge-blue"
                            : p.status === "Cancelled"
                            ? "badge-red"
                            : "badge-amber"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {formatDate(p.date)}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>
                    📦 {p.ewasteType}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={15} color="var(--text-muted)" />
                      <span>{p.time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={15} color="var(--text-muted)" />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.address}
                      </span>
                    </div>
                    {p.deliveryAgent && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Truck size={15} color="var(--primary-dark)" />
                        <span>Agent: <strong>{p.deliveryAgent}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup */}
      <Popup
        isOpen={showSuccessPopup}
        title="Pickup Scheduled!"
        message={`Pickup request ${createdPickupId} has been submitted successfully to the Express MongoDB backend. Our delivery agent will arrive at your selected time slot.`}
        type="success"
        confirmText="Got it"
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}
