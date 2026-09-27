import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ewasteApi } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import StatCard from "../../components/StatCard";
import {
  Coins,
  Scale,
  Leaf,
  Award,
  Scan,
  QrCode,
  Truck,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Laptop,
  CheckCircle,
  Sparkles,
  Target,
  RefreshCw,
  PackageCheck,
  Cpu
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    pendingCount: 0,
    pickedUpCount: 0,
    recycledCount: 0,
    totalWeightKg: 0,
    recycledWeightKg: 0,
    co2SavedKg: 0,
    ecoPoints: user?.ecoPoints || 100,
    greenLevel: user?.greenLevel || "Eco Novice",
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await ewasteApi.getUserStats();
      if (res && res.success) {
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.recentActivity) {
          setRecentActivity(res.recentActivity);
        }
      }
    } catch (err) {
      console.warn("[Dashboard] Failed to fetch live stats from MongoDB:", err.message);
      // Fallback to user auth properties
      if (user) {
        setStats((prev) => ({
          ...prev,
          ecoPoints: user.ecoPoints || 100,
          recycledWeightKg: user.recycledKg || 0,
          co2SavedKg: user.co2SavedKg || 0,
          greenLevel: user.greenLevel || "Eco Novice",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const userName = user?.name || "Eco Contributor";
  const ecoPoints = stats.ecoPoints !== undefined ? stats.ecoPoints : (user?.ecoPoints || 100);
  const recycledCount = stats.recycledCount || 0;
  const pickedUpCount = stats.pickedUpCount || 0;
  const totalRegistered = stats.totalRegistered || 0;
  const recycledKg = stats.recycledWeightKg || stats.totalWeightKg || 0;
  const co2SavedKg = stats.co2SavedKg || Number((recycledKg * 0.75).toFixed(1));
  const greenLevel = stats.greenLevel || "Eco Novice";

  // Goal calculation (Target: 10 recycled items or 20 kg)
  const monthlyGoalKg = 20.0;
  const progressPercentage = Math.min(100, Math.round(((recycledKg || recycledCount * 2) / monthlyGoalKg) * 100));

  return (
    <div className="dashboard-content">
      {/* Top Welcome Hero Banner */}
      <div className="hero-banner">
        <div>
          <div className="badge badge-green" style={{ marginBottom: "10px" }}>
            <Sparkles size={14} />
            <span>Campus Sustainability Program</span>
          </div>
          <h1 className="hero-banner-title">
            {t("welcome")}, {userName}! 👋
          </h1>
          <p className="hero-banner-subtitle">
            Together, we make e-waste disposal smarter and greener. Real-time MongoDB sustainability ledger active.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={fetchDashboardData} title="Refresh MongoDB statistics">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link to="/scanner" className="btn btn-primary">
            <Scan size={18} />
            <span>{t("scanEwasteBtn")}</span>
          </Link>
          <Link to="/pickup" className="btn btn-success">
            <Truck size={18} />
            <span>{t("schedulePickupBtn")}</span>
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards - Live from MongoDB */}
      <div className="grid-4" style={{ marginBottom: "28px" }}>
        <StatCard
          title={t("ecoPoints")}
          value={`${ecoPoints}`}
          icon={<Coins size={26} />}
          variant="blue"
          trend="MongoDB Verified"
        />
        <StatCard
          title="E-Waste Recycled"
          value={`${recycledCount} Items`}
          icon={<Scale size={26} />}
          variant="green"
          description={`${recycledKg} kg diverted`}
        />
        <StatCard
          title="Registered E-Waste"
          value={`${totalRegistered} Items`}
          icon={<Cpu size={26} />}
          variant="amber"
          description={`${pickedUpCount} Picked Up • ${stats.pendingCount} Pending`}
        />
        <StatCard
          title={t("greenLevel")}
          value={greenLevel}
          icon={<Award size={26} />}
          variant="purple"
          description={`${co2SavedKg} kg CO₂ offset`}
        />
      </div>

      {/* Middle Grid: Quick Actions & Monthly Goal */}
      <div className="grid-2" style={{ marginBottom: "28px" }}>
        {/* Quick Actions Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={20} color="var(--primary-dark)" />
              <span>{t("quickActions")}</span>
            </h3>
          </div>
          <div className="grid-2">
            <Link to="/scanner" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--primary-light)", color: "#1d4ed8" }}>
                <Scan size={22} />
              </div>
              <div>
                <div className="quick-action-title">AI Scanner</div>
                <div className="quick-action-desc">Identify item &amp; register in MongoDB</div>
              </div>
            </Link>

            <Link to="/qr-scanner" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--green-light)", color: "var(--green-dark)" }}>
                <QrCode size={22} />
              </div>
              <div>
                <div className="quick-action-title">QR Scanner</div>
                <div className="quick-action-desc">Scan kiosk QR to verify drop-off</div>
              </div>
            </Link>

            <Link to="/pickup" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--accent-amber-light)", color: "#b45309" }}>
                <Truck size={22} />
              </div>
              <div>
                <div className="quick-action-title">Schedule Pickup</div>
                <div className="quick-action-desc">Free doorstep pickup from campus</div>
              </div>
            </Link>

            <Link to="/donation" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "var(--accent-purple-light)", color: "#6d28d9" }}>
                <HeartHandshake size={22} />
              </div>
              <div>
                <div className="quick-action-title">Donate Gadgets</div>
                <div className="quick-action-desc">Support underprivileged students</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recycling Goal & EcoPoints Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Target size={20} color="var(--green-dark)" />
              <span>Recycling Goal &amp; Level</span>
            </h3>
            <span className="badge badge-green">{progressPercentage}% Complete</span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div className="flex-between" style={{ marginBottom: "8px", fontSize: "0.9rem" }}>
              <span style={{ fontWeight: "600" }}>Campus Recycling Milestone</span>
              <span style={{ color: "var(--text-secondary)" }}>
                <strong>{recycledKg} kg</strong> / {monthlyGoalKg} kg Target
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div style={{ padding: "16px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "var(--radius-md)" }}>
            <div className="flex-between" style={{ marginBottom: "6px" }}>
              <span style={{ fontWeight: "700", fontSize: "0.92rem" }}>Current Status: {greenLevel}</span>
              <span className="badge badge-blue">{ecoPoints} Total Points</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
              {recycledCount > 0
                ? `You have successfully recycled ${recycledCount} electronic device(s) into verified circular recovery.`
                : "Register electronic items with the AI scanner to earn points and claim verified recycling certificates."}
            </p>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, (ecoPoints / 1500) * 100)}%`, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Recent Activity Section from MongoDB */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={20} color="var(--primary-dark)" />
            <span>{t("recentActivity")}</span>
          </h3>
          <Link to="/history" className="btn btn-outline btn-sm">
            <span>{t("viewAll")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((act, idx) => (
              <div key={act.id || idx} className="activity-item">
                <div className="activity-left">
                  <div className="activity-icon" style={{ color: act.type === "ewaste" ? "#059669" : "#3b82f6" }}>
                    {act.type === "ewaste" ? <Cpu size={20} /> : <Truck size={20} />}
                  </div>
                  <div>
                    <div className="activity-title">{act.title}</div>
                    <div className="activity-time">
                      {formatDate(act.date)} • Status: <strong>{act.status || act.pickupStatus || "Active"}</strong>
                    </div>
                  </div>
                </div>
                <span className={`badge ${act.status === "Recycled" || act.pickupStatus === "Picked Up" ? "badge-green" : "badge-blue"}`}>
                  {act.status || act.pickupStatus || "Recorded"}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
              <PackageCheck size={36} style={{ margin: "0 auto 8px", display: "block", color: "var(--green-primary)" }} />
              <p style={{ fontWeight: "600", fontSize: "0.95rem" }}>No E-Waste records yet</p>
              <p style={{ fontSize: "0.85rem", maxWidth: "360px", margin: "4px auto 14px" }}>
                Use the AI Scanner to identify your first electronic device and generate a pickup QR tag.
              </p>
              <Link to="/scanner" className="btn btn-primary btn-sm">
                <Scan size={14} />
                <span>Open AI Scanner</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

