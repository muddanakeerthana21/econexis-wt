import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  LayoutDashboard,
  Scan,
  QrCode,
  Truck,
  HeartHandshake,
  Gift,
  Award,
  BookOpen,
  MapPin,
  History,
  User,
  Settings,
  LogOut,
  Users,
  ClipboardList,
  Recycle,
  X
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isCurrent = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const currentRole = (role || user?.role || "USER").toUpperCase();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <Link to={currentRole === "ADMIN" ? "/admin" : currentRole === "DELIVERY" ? "/delivery" : "/dashboard"} className="sidebar-brand" onClick={handleLinkClick}>
            <div className="sidebar-logo-icon">
              <Recycle size={22} color="#047857" strokeWidth={2.5} />
            </div>
            <span>EcoNexis</span>
          </Link>
          {onClose && (
            <button className="icon-btn menu-toggle-btn" onClick={onClose} aria-label="Close Sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {/* User Links */}
          {currentRole === "USER" && (
            <>
              <div className="sidebar-section-title">Main Services</div>
              <Link to="/dashboard" className={`nav-link ${isCurrent("/dashboard") ? "active" : ""}`} onClick={handleLinkClick}>
                <LayoutDashboard size={18} />
                <span>{t("dashboard")}</span>
              </Link>
              <Link to="/scanner" className={`nav-link ${isCurrent("/scanner") ? "active" : ""}`} onClick={handleLinkClick}>
                <Scan size={18} />
                <span>{t("scanner")}</span>
              </Link>
              <Link to="/qr-scanner" className={`nav-link ${isCurrent("/qr-scanner") ? "active" : ""}`} onClick={handleLinkClick}>
                <QrCode size={18} />
                <span>{t("qrScanner")}</span>
              </Link>
              <Link to="/pickup" className={`nav-link ${isCurrent("/pickup") ? "active" : ""}`} onClick={handleLinkClick}>
                <Truck size={18} />
                <span>{t("pickup")}</span>
              </Link>
              <Link to="/donation" className={`nav-link ${isCurrent("/donation") ? "active" : ""}`} onClick={handleLinkClick}>
                <HeartHandshake size={18} />
                <span>{t("donation")}</span>
              </Link>
              <Link to="/rewards" className={`nav-link ${isCurrent("/rewards") ? "active" : ""}`} onClick={handleLinkClick}>
                <Gift size={18} />
                <span>{t("rewards")}</span>
              </Link>
              <Link to="/certificate" className={`nav-link ${isCurrent("/certificate") ? "active" : ""}`} onClick={handleLinkClick}>
                <Award size={18} />
                <span>{t("certificate")}</span>
              </Link>
              <Link to="/awareness" className={`nav-link ${isCurrent("/awareness") ? "active" : ""}`} onClick={handleLinkClick}>
                <BookOpen size={18} />
                <span>{t("awareness")}</span>
              </Link>
              <Link to="/centers" className={`nav-link ${isCurrent("/centers") ? "active" : ""}`} onClick={handleLinkClick}>
                <MapPin size={18} />
                <span>{t("centers")}</span>
              </Link>
              <Link to="/history" className={`nav-link ${isCurrent("/history") ? "active" : ""}`} onClick={handleLinkClick}>
                <History size={18} />
                <span>{t("history")}</span>
              </Link>
            </>
          )}

          {/* Admin Links */}
          {currentRole === "ADMIN" && (
            <>
              <div className="sidebar-section-title">Admin Portal</div>
              <Link to="/admin" className={`nav-link ${isCurrent("/admin") ? "active" : ""}`} onClick={handleLinkClick}>
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </Link>
              <Link to="/admin/users" className={`nav-link ${isCurrent("/admin/users") ? "active" : ""}`} onClick={handleLinkClick}>
                <Users size={18} />
                <span>Manage Users</span>
              </Link>
              <Link to="/admin/pickups" className={`nav-link ${isCurrent("/admin/pickups") ? "active" : ""}`} onClick={handleLinkClick}>
                <ClipboardList size={18} />
                <span>Manage Pickups</span>
              </Link>
              <Link to="/centers" className={`nav-link ${isCurrent("/centers") ? "active" : ""}`} onClick={handleLinkClick}>
                <MapPin size={18} />
                <span>Collection Centers</span>
              </Link>
            </>
          )}

          {/* Delivery Links */}
          {currentRole === "DELIVERY" && (
            <>
              <div className="sidebar-section-title">Delivery Operations</div>
              <Link to="/delivery" className={`nav-link ${isCurrent("/delivery") ? "active" : ""}`} onClick={handleLinkClick}>
                <Truck size={18} />
                <span>My Pickups</span>
              </Link>
              <Link to="/delivery/scan" className={`nav-link ${isCurrent("/delivery/scan") ? "active" : ""}`} onClick={handleLinkClick}>
                <QrCode size={18} />
                <span>Scan Delivery QR</span>
              </Link>
            </>
          )}

          {/* Common Account Section */}
          <div className="sidebar-section-title">Account</div>
          <Link to="/profile" className={`nav-link ${isCurrent("/profile") ? "active" : ""}`} onClick={handleLinkClick}>
            <User size={18} />
            <span>{t("profile")}</span>
          </Link>
          <Link to="/settings" className={`nav-link ${isCurrent("/settings") ? "active" : ""}`} onClick={handleLinkClick}>
            <Settings size={18} />
            <span>{t("settings")}</span>
          </Link>
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="sidebar-footer">
          {user && (
            <div className="user-mini-card">
              <div className="user-mini-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-mini-info">
                <div className="user-mini-name">{user.name}</div>
                <div className="user-mini-role">{user.role || role}</div>
              </div>
            </div>
          )}
          <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ width: "100%" }}>
            <LogOut size={16} />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
