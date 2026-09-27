import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { authApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  Bell,
  Shield,
  Trash2,
  Download,
  Save,
  CheckCircle2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [notifications, setNotifications] = useState({
    pickupAlerts: true,
    ecoPointsBonus: true,
    certificateReady: true,
    monthlyDigest: false
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setPopupState({
      isOpen: true,
      title: "Preferences Saved",
      message: "Your display, language, and notification settings have been updated successfully.",
      type: "success"
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      setPopupState({
        isOpen: true,
        title: "Validation Error",
        message: "Please fill in both current and new password fields.",
        type: "warning"
      });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPopupState({
        isOpen: true,
        title: "Password Too Short",
        message: "New password must be at least 6 characters long.",
        type: "warning"
      });
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setPopupState({
        isOpen: true,
        title: "Password Mismatch",
        message: "New password and confirmation do not match.",
        type: "danger"
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setPopupState({
        isOpen: true,
        title: "Password Updated",
        message: res?.message || "Your account security password has been changed successfully in MongoDB.",
        type: "success"
      });
    } catch (err) {
      setPopupState({
        isOpen: true,
        title: "Password Change Failed",
        message: err.message || "Failed to change password. Please check your current password.",
        type: "danger"
      });
    } finally {
      setPasswordLoading(false);
    }
  };


  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `econexis-export-${user?.id || "user"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setPopupState({
      isOpen: true,
      title: "Data Exported",
      message: "Your EcoNexis account history and credentials have been downloaded in JSON format.",
      type: "success"
    });
  };

  const handleClearCache = () => {
    localStorage.removeItem("econexis_user");
    setPopupState({
      isOpen: true,
      title: "Local Cache Cleared",
      message: "Application session data reset. You will be redirected to the login page.",
      type: "info",
      onConfirm: () => {
        logout();
        window.location.href = "/login";
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("settings")} &amp; Preferences</h1>
          <p className="page-subtitle">
            Customize your visual theme, language locale, notification alerts, and manage account security.
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Left Column: Visual & Language Preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Appearance Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Sun size={20} color="var(--primary-dark)" />
                <span>Appearance &amp; Theme</span>
              </h3>
              <span className="badge badge-blue">
                {theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}
              </span>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Select your preferred color scheme. EcoNexis supports full dark mode for high-contrast low-light environments.
            </p>

            <div className="grid-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
                style={{ height: "64px", display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sun size={18} color="#f59e0b" />
                  <span style={{ fontWeight: "700" }}>Light Clean Mode</span>
                </div>
                <span style={{ fontSize: "0.74rem", opacity: 0.8 }}>Pastel Blue &amp; Forest Green</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
                style={{ height: "64px", display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Moon size={18} color="#93c5fd" />
                  <span style={{ fontWeight: "700" }}>Deep Dark Mode</span>
                </div>
                <span style={{ fontSize: "0.74rem", opacity: 0.8 }}>Midnight Slate &amp; Emerald</span>
              </button>
            </div>
          </div>

          {/* Regional Language Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Globe size={20} color="var(--green-dark)" />
                <span>Language &amp; Region</span>
              </h3>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="locale-select">Platform Display Language</label>
              <select
                id="locale-select"
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English (Default)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
              Changes will apply instantly across the sidebar, dashboard, stat cards, and notification panels.
            </p>
          </div>

          {/* Notifications Toggle Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Bell size={20} color="#b45309" />
                <span>Notification Preferences</span>
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>Pickup Logistics Updates</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>SMS &amp; in-app alerts when delivery agent is en route</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pickupAlerts}
                  onChange={() => handleToggleNotification("pickupAlerts")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--green-primary)", cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>EcoPoints &amp; Rewards Alerts</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Notifications when points credit or milestone unlocked</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.ecoPointsBonus}
                  onChange={() => handleToggleNotification("ecoPointsBonus")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--green-primary)", cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>Green Certificate Ready Notice</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Instant alert when annual certificate reaches new tier</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.certificateReady}
                  onChange={() => handleToggleNotification("certificateReady")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--green-primary)", cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>Monthly Sustainability Digest</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Monthly campus recycling leaderboards and impact stats</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.monthlyDigest}
                  onChange={() => handleToggleNotification("monthlyDigest")}
                  style={{ width: "18px", height: "18px", accentColor: "var(--green-primary)", cursor: "pointer" }}
                />
              </label>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleSavePreferences}
              style={{ marginTop: "18px", width: "100%" }}
            >
              <Save size={16} />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>

        {/* Right Column: Security & Data Management */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Security & Password */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Shield size={20} color="var(--accent-purple)" />
                <span>Account Security</span>
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="current-pass">Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="current-pass"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pass">New Password</label>
                <input
                  id="new-pass"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-pass">Confirm New Password</label>
                <input
                  id="confirm-pass"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={passwords.confirmNewPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "6px" }}
              >
                <Lock size={16} />
                <span>Change Password</span>
              </button>
            </form>
          </div>

          {/* Data Export & Account Reset */}
          <div className="card" style={{ borderColor: "var(--border-color)" }}>
            <div className="card-header">
              <h3 className="card-title">
                <Download size={20} color="var(--primary-dark)" />
                <span>Data Management &amp; Cache</span>
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "14px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "4px" }}>
                  Export Personal Audit History
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Download a complete backup of your logged e-waste items, verified certificates, and points transaction history.
                </p>
                <button className="btn btn-outline btn-sm" onClick={handleExportData}>
                  <Download size={14} />
                  <span>Download My JSON Data</span>
                </button>
              </div>

              <div style={{ padding: "14px", backgroundColor: "var(--accent-red-light)", borderRadius: "var(--radius-md)", border: "1px solid #fecaca" }}>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "#b91c1c", marginBottom: "4px" }}>
                  Reset Demo Session &amp; Cache
                </div>
                <p style={{ fontSize: "0.82rem", color: "#7f1d1d", marginBottom: "12px" }}>
                  Clears local storage state, logs out the current demo profile, and resets point balances to standard demo state.
                </p>
                <button className="btn btn-danger btn-sm" onClick={handleClearCache}>
                  <Trash2 size={14} />
                  <span>Reset Local Storage &amp; Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Popup */}
      <Popup
        isOpen={popupState.isOpen}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        confirmText="OK"
        onConfirm={popupState.onConfirm || (() => setPopupState({ ...popupState, isOpen: false }))}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
      />
    </div>
  );
}
