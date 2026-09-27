import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Recycle, Lock, Mail, UserCheck, Shield, Truck, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("user@econexis.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    if (newRole === "user") {
      setEmail("user@econexis.com");
      setPassword("Password123");
    } else if (newRole === "admin") {
      setEmail("admin@econexis.com");
      setPassword("Password123");
    } else if (newRole === "delivery") {
      setEmail("delivery@econexis.com");
      setPassword("Password123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      const targetRole = (loggedInUser?.role || "USER").toUpperCase();

      if (targetRole === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (targetRole === "DELIVERY") {
        navigate("/delivery", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">
          <Recycle size={32} />
        </div>
        <h2 className="auth-title">Welcome to EcoNexis</h2>
        <p className="auth-subtitle">Sign in to access your green dashboard</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="role-tabs">
        <button
          type="button"
          className={`role-tab ${role === "user" ? "active" : ""}`}
          onClick={() => handleRoleChange("user")}
        >
          <UserCheck size={16} />
          <span>User</span>
        </button>
        <button
          type="button"
          className={`role-tab ${role === "admin" ? "active" : ""}`}
          onClick={() => handleRoleChange("admin")}
        >
          <Shield size={16} />
          <span>Admin</span>
        </button>
        <button
          type="button"
          className={`role-tab ${role === "delivery" ? "active" : ""}`}
          onClick={() => handleRoleChange("delivery")}
        >
          <Truck size={16} />
          <span>Delivery</span>
        </button>
      </div>

      {/* Demo Credentials Quick Pill */}
      <div className="demo-accounts">
        <div className="demo-accounts-title">Quick Demo Login</div>
        <div className="demo-pills">
          <button
            type="button"
            className="demo-pill"
            onClick={() => handleRoleChange("user")}
          >
            👤 User Demo
          </button>
          <button
            type="button"
            className="demo-pill"
            onClick={() => handleRoleChange("admin")}
          >
            🛡️ Admin Demo
          </button>
          <button
            type="button"
            className="demo-pill"
            onClick={() => handleRoleChange("delivery")}
          >
            🚚 Delivery Demo
          </button>
        </div>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div style={{ position: "relative" }}>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label className="form-label" htmlFor="password">Password</label>
            <Link
              to="/forgot-password"
              style={{ fontSize: "0.8rem", color: "var(--primary-dark)", fontWeight: "600" }}
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: "100%", marginTop: "10px" }}
          disabled={loading}
        >
          <span>{loading ? "Signing in..." : `Sign In as ${role.toUpperCase()}`}</span>
          <ArrowRight size={18} />
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Create Account</Link>
      </div>
    </div>
  );
}
