import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-page)", color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: "600" }}>
        Loading EcoNexis...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

