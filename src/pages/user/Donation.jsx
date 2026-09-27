import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { donationApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  HeartHandshake,
  Smartphone,
  Laptop,
  Tablet,
  Tv,
  Headphones,
  Cpu,
  Sparkles,
  Gift,
  CheckCircle2,
  Award
} from "lucide-react";

export default function Donation() {
  const { user, addEcoPoints } = useAuth();
  const location = useLocation();
  const prefilled = location.state || {};

  const [selectedCategory, setSelectedCategory] = useState(prefilled.category || "Smartphones");
  const [formData, setFormData] = useState({
    itemName: prefilled.prefilledItem || "",
    category: prefilled.category || "Smartphones",
    condition: "Fully Functional",
    description: "",
    deliveryMethod: "Doorstep Pickup",
    beneficiaryOption: "Underserved School Students"
  });
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { name: "Smartphones", icon: <Smartphone size={24} />, count: "48 Donated" },
    { name: "Laptops", icon: <Laptop size={24} />, count: "62 Donated" },
    { name: "Tablets", icon: <Tablet size={24} />, count: "29 Donated" },
    { name: "TVs & Displays", icon: <Tv size={24} />, count: "15 Donated" },
    { name: "Accessories", icon: <Headphones size={24} />, count: "110 Donated" },
    { name: "Other Electronics", icon: <Cpu size={24} />, count: "34 Donated" }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    setFormData({
      ...formData,
      category: catName
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await donationApi.create({
        userName: user?.name || "Eco Contributor",
        item: formData.itemName,
        category: formData.category,
        quantity: 1,
        condition: formData.condition,
        description: formData.description,
        deliveryMethod: formData.deliveryMethod,
        beneficiaryOption: formData.beneficiaryOption,
        status: "Received",
      });
    } catch (err) {
      console.warn("Donation recorded locally:", err.message);
    }

    addEcoPoints(150); // Generous points bonus for donating usable gadgets
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Donate Usable Electronics</h1>
          <p className="page-subtitle">
            Bridge the digital divide by donating working or repairable devices to students in need.
          </p>
        </div>
        <div className="badge badge-purple">
          <HeartHandshake size={14} />
          <span>Social Impact Program</span>
        </div>
      </div>

      {/* Donation Categories Showcase */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <div className="card-header">
          <h3 className="card-title">
            <Gift size={20} color="var(--accent-purple)" />
            <span>Select Device Category to Donate</span>
          </h3>
        </div>
        <div className="grid-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                border: `2px solid ${selectedCategory === cat.name ? "var(--primary-dark)" : "var(--border-color)"}`,
                backgroundColor: selectedCategory === cat.name ? "var(--primary-light)" : "var(--bg-surface)",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "var(--bg-surface-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: selectedCategory === cat.name ? "var(--primary-darker)" : "var(--text-secondary)"
                }}
              >
                {cat.icon}
              </div>
              <div>
                <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{cat.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{cat.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donation Form & Impact Story Card */}
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={20} color="var(--primary-dark)" />
              <span>Donation Details</span>
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="don-item">Item Name &amp; Model</label>
              <input
                id="don-item"
                name="itemName"
                type="text"
                className="form-input"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Dell Inspiron 15 (2020) or iPad 7th Gen"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="don-category">Category</label>
                <select
                  id="don-category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Tablets">Tablets</option>
                  <option value="TVs & Displays">TVs &amp; Displays</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other Electronics">Other Electronics</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="don-condition">Device Condition</label>
                <select
                  id="don-condition"
                  name="condition"
                  className="form-select"
                  value={formData.condition}
                  onChange={handleChange}
                >
                  <option value="Fully Functional">Fully Functional (Like New)</option>
                  <option value="Working with Minor Scratches">Working with Minor Scratches</option>
                  <option value="Needs Minor Repair / Battery Replacement">Needs Minor Repair / Battery</option>
                  <option value="Functional for Basic Computing">Functional for Basic Computing</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="don-method">Fulfillment Method</label>
              <select
                id="don-method"
                name="deliveryMethod"
                className="form-select"
                value={formData.deliveryMethod}
                onChange={handleChange}
              >
                <option value="Doorstep Pickup">Free Doorstep Pickup</option>
                <option value="Campus Collection Kiosk Drop-off">Campus Collection Kiosk Drop-off</option>
                <option value="EcoNexis Central Hub Drop-off">EcoNexis Central Hub Drop-off</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="don-desc">Description &amp; Included Accessories</label>
              <textarea
                id="don-desc"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Include charger, cases, specifications, or history of device..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg"
              style={{ width: "100%", marginTop: "10px" }}
            >
              <HeartHandshake size={20} />
              <span>Submit Device Donation (+150 EcoPoints)</span>
            </button>
          </form>
        </div>

        {/* Why Donate / Impact Highlight */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(174, 213, 246, 0.25))", borderColor: "var(--green-border)" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "var(--green-light)",
                  color: "var(--green-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>
                  Certified Refurbishing &amp; Data Wipe
                </h4>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Every donated device undergoes military-grade DOD 5220.22-M data sanitization, system sanitization, and hardware diagnostic checks before distribution.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "14px" }}>
              Where Your Donation Goes
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <CheckCircle2 size={18} color="var(--green-dark)" />
                <span>Local Government High Schools &amp; Computer Labs</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <CheckCircle2 size={18} color="var(--green-dark)" />
                <span>Undergraduate STEM Student Hardware Grants</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <CheckCircle2 size={18} color="var(--green-dark)" />
                <span>Community Digital Literacy Centres</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Popup
        isOpen={showModal}
        title="Donation Pledge Registered!"
        message={`Thank you for donating ${formData.itemName || "your device"}! You have been awarded +150 EcoPoints. Our logistics team will contact you for dispatch.`}
        type="success"
        confirmText="View My Rewards"
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
