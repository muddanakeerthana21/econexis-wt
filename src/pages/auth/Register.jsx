import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Recycle, AlertCircle, UserPlus } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "user",
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
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
        <h2 className="auth-title">Join EcoNexis</h2>
        <p className="auth-subtitle">Create an account to start earning EcoPoints</p>
      </div>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Aarav Sharma"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@university.edu"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-success btn-lg"
          style={{ width: "100%", marginTop: "10px" }}
          disabled={loading}
        >
          <UserPlus size={18} />
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
}
