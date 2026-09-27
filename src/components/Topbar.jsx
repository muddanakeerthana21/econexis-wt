import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function Topbar({ onToggleSidebar }) {
  const { user, role } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive title from route
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/dashboard") return t("dashboard");
    if (p === "/scanner") return t("scanner");
    if (p === "/qr-scanner") return t("qrScanner");
    if (p === "/pickup") return t("pickup");
    if (p === "/donation") return t("donation");
    if (p === "/rewards") return t("rewards");
    if (p === "/certificate") return t("certificate");
    if (p === "/awareness") return t("awareness");
    if (p === "/centers") return t("centers");
    if (p === "/history") return t("history");
    if (p === "/profile") return t("profile");
    if (p === "/settings") return t("settings");
    if (p === "/admin") return "Admin Operations Dashboard";
    if (p === "/admin/users") return "EcoNexis User Registry";
    if (p === "/admin/pickups") return "Doorstep Pickup Logistics";
    if (p === "/delivery") return "Field Pickups & Route Plan";
    if (p === "/delivery/scan") return "Delivery QR Verification";
    return "EcoNexis Platform";
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{getPageTitle()}</h2>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          aria-label="Search"
        />
      </div>

      <div className="topbar-right">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Theme Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="notification-dot"></span>
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="flex-between" style={{ marginBottom: "12px" }}>
                <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>Notifications</span>
                <span className="badge badge-green">3 New</span>
              </div>
              <div className="notification-item">
                <Sparkles size={18} color="#10b981" />
                <div>
                  <div className="notification-text">
                    Earned <strong>+50 EcoPoints</strong> for recycling your smartphone!
                  </div>
                  <div className="notification-time">10 mins ago</div>
                </div>
              </div>
              <div className="notification-item">
                <CheckCircle2 size={18} color="#3b82f6" />
                <div>
                  <div className="notification-text">
                    Pickup scheduled for tomorrow at 2:00 PM.
                  </div>
                  <div className="notification-time">2 hours ago</div>
                </div>
              </div>
              <div className="notification-item">
                <ShieldCheck size={18} color="#8b5cf6" />
                <div>
                  <div className="notification-text">
                    Green Certificate for 24.5 kg e-waste is ready.
                  </div>
                  <div className="notification-time">1 day ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Mini Badge */}
        {user && (
          <Link
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px 4px 6px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-surface-secondary)",
              border: "1px solid var(--border-color)",
              textDecoration: "none"
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.8rem",
                color: "#0f172a"
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--text-primary)",
                maxWidth: "110px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {user.name}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
