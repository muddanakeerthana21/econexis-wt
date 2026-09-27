import React, { useState } from "react";
import { collectionCenters } from "../../data/mockData";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  Search,
  Star
} from "lucide-react";

export default function Centers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCenters = collectionCenters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.accepted.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Verified E-Waste Collection Centers</h1>
          <p className="page-subtitle">
            Find certified drop-off bins, university green kiosks, and authorized processing facilities near you.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: "24px", padding: "16px 20px" }}>
        <div style={{ position: "relative", maxWidth: "480px" }}>
          <div
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          >
            <Search size={18} />
          </div>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px" }}
            placeholder="Search by center name, location, or item (e.g. Batteries)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Centers Cards Grid */}
      <div className="grid-2">
        {filteredCenters.map((center) => (
          <div key={center.id} className="center-card">
            <div>
              <div className="flex-between" style={{ marginBottom: "8px" }}>
                <span className="badge badge-green">
                  <Star size={12} fill="#059669" color="#059669" />
                  <span>{center.rating} / 5.0</span>
                </span>
                <span className="badge badge-blue">{center.distance}</span>
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>
                {center.name}
              </h3>

              <div className="center-meta">
                <div className="center-meta-row">
                  <MapPin size={16} color="var(--primary-dark)" />
                  <span>{center.location}</span>
                </div>
                <div className="center-meta-row">
                  <Clock size={16} color="var(--text-muted)" />
                  <span>{center.hours}</span>
                </div>
                <div className="center-meta-row">
                  <Phone size={16} color="var(--text-muted)" />
                  <span>{center.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                ACCEPTED E-WASTE
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {center.accepted.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: "0.78rem",
                      padding: "3px 8px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-surface-secondary)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-secondary)"
                    }}
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>

              <a
                href={center.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                <Navigation size={16} />
                <span>Get Directions &amp; Open in Maps</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
