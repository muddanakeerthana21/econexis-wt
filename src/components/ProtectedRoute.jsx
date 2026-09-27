import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * Guards routes against unauthenticated access and enforces strict role separation.
 *
 * @param {Array<string>} allowedRoles - Roles permitted to view this route ('user', 'admin', 'delivery')
 * @param {React.ReactNode} children - Child components / Outlet
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-page)",
          color: "var(--text-secondary)",
          fontSize: "1.1rem",
          fontWeight: "600",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid var(--border-color)",
              borderTopColor: "var(--green-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = (user.role || "USER").toUpperCase();

  // If specific roles are required, verify user's role
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    if (!normalizedAllowed.includes(userRole)) {
      // Redirect unauthorized role to their designated portal
      if (userRole === "ADMIN") {
        return <Navigate to="/admin" replace />;
      } else if (userRole === "DELIVERY") {
        return <Navigate to="/delivery" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
}
