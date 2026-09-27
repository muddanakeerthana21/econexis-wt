import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pickupApi, donationApi, ewasteApi } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import {
  History as HistoryIcon,
  Search,
  CheckCircle2,
  Coins,
  Cpu,
  Truck,
  HeartHandshake,
  Scan,
  RefreshCw,
  Sparkles,
  PackageCheck
} from "lucide-react";

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadRealHistory = async () => {
    setLoading(true);
    try {
      const [pickupRes, donationRes, ewasteRes] = await Promise.all([
        pickupApi.getAll().catch(() => null),
        donationApi.getAll().catch(() => null),
        ewasteApi.getMyEwaste().catch(() => null),
      ]);

      const realEntries = [];

      if (ewasteRes && ewasteRes.success && ewasteRes.data) {
        ewasteRes.data.forEach((ew) => {
          realEntries.push({
            id: ew.objectId || ew.itemId || ew._id,
            date: ew.createdAt,
            item: ew.type || ew.itemName || "E-Waste Device",
            category: ew.category || "Electronics",
            method: "AI Scanner Registration",
            aiDetection: ew.aiDetection || ew.type,
            aiConfidence: ew.aiConfidence || 95,
            ecoPoints: ew.aiConfidence ? Math.round(ew.aiConfidence * 0.5) : 50,
            status: ew.status || "Registered",
            pickupStatus: ew.pickupStatus || "Pending",
          });
        });
      }

      if (pickupRes && pickupRes.success && pickupRes.data) {
        pickupRes.data.forEach((p) => {
          realEntries.push({
            id: p.trackingId || p.id || p._id,
            date: p.pickupDate || p.createdAt,
            item: p.item || "E-Waste Item",
            category: p.category || "Smartphones & Laptops",
            method: "Doorstep Pickup",
            aiDetection: "Doorstep Scheduled",
            aiConfidence: 100,
            ecoPoints: p.pointsAwarded || 100,
            status: p.status || "Pending",
            pickupStatus: p.status || "Pending",
          });
        });
      }

      if (donationRes && donationRes.success && donationRes.data) {
        donationRes.data.forEach((d) => {
          realEntries.push({
            id: d.donationId || d.id || d._id,
            date: d.createdAt,
            item: d.item || d.itemName || "Donated Device",
            category: d.category || "Laptops",
            method: "Donation",
            aiDetection: "Student Donation",
            aiConfidence: 100,
            ecoPoints: d.ecoPointsAwarded || 150,
            status: d.status || "Received",
            pickupStatus: d.status || "Received",
          });
        });
      }

      // Sort newest first
      realEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistoryList(realEntries);
    } catch (err) {
      console.warn("[History] Error loading user history:", err.message);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealHistory();
  }, []);

  const filteredHistory = historyList.filter((item) => {
    const matchesSearch =
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod =
      filterMethod === "All" || item.method.toLowerCase().includes(filterMethod.toLowerCase());
    return matchesSearch && matchesMethod;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Disposal &amp; Donation History</h1>
          <p className="page-subtitle">
            Comprehensive audit ledger of all your e-waste handovers, certified pickups, and credited EcoPoints in MongoDB.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadRealHistory} title="Refresh MongoDB history">
          <RefreshCw size={16} />
          <span>Refresh</span>
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
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1, minWidth: "260px" }}>
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
              placeholder="Search by Object ID, device type, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="AI Scanner">AI Scanner Registration</option>
            <option value="Doorstep Pickup">Doorstep Pickup</option>
            <option value="Donation">Donation</option>
          </select>
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          Showing {filteredHistory.length} MongoDB Records
        </div>
      </div>

      {/* History Data Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Object ID / Tracking ID</th>
              <th>Date</th>
              <th>Item Disposed</th>
              <th>AI Detection</th>
              <th>Method</th>
              <th>Status</th>
              <th>Pickup Status</th>
              <th>EcoPoints</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
                  {loading ? (
                    <div>Loading disposal history from MongoDB...</div>
                  ) : (
                    <div>
                      <PackageCheck size={36} style={{ margin: "0 auto 8px", display: "block", color: "var(--green-primary)" }} />
                      <p style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-primary)" }}>No disposal history records found</p>
                      <p style={{ fontSize: "0.85rem", maxWidth: "340px", margin: "4px auto 14px" }}>
                        Register an e-waste item via the AI Scanner or schedule a doorstep pickup to build your green footprint.
                      </p>
                      <Link to="/scanner" className="btn btn-primary btn-sm">
                        <Scan size={14} />
                        <span>Scan Device Now</span>
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredHistory.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "800", color: "var(--primary-dark)" }}>
                    {row.id}
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {formatDate(row.date)}
                  </td>
                  <td style={{ fontWeight: "700" }}>
                    {row.item}
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontSize: "0.78rem" }}>
                      <Sparkles size={11} />
                      <span>{row.aiDetection} ({row.aiConfidence}%)</span>
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                      {row.method}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${row.status === "Recycled" || row.status === "Completed" ? "badge-green" : row.status === "Picked Up" ? "badge-blue" : "badge-amber"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${row.pickupStatus === "Picked Up" || row.pickupStatus === "Completed" ? "badge-green" : "badge-amber"}`}>
                      {row.pickupStatus}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      <Coins size={12} color="#f59e0b" />
                      <span>+{row.ecoPoints} Pts</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

