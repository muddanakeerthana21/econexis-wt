import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Recycle, ArrowLeft, Send } from "lucide-react";
import Popup from "../../components/Popup";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setShowPopup(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">
          <Recycle size={32} />
        </div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          Enter your registered email and we'll send you recovery instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-email">Email Address</label>
          <input
            id="reset-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: "100%", marginTop: "10px" }}
        >
          <Send size={18} />
          <span>Send Reset Link</span>
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </Link>
      </div>

      {/* Confirmation Popup */}
      <Popup
        isOpen={showPopup}
        type="success"
        title="Reset Link Sent"
        message="Password reset link sent successfully. Please check your inbox and spam folder."
        confirmText="Back to Login"
        onClose={() => setShowPopup(false)}
        onConfirm={() => {
          setShowPopup(false);
          window.location.href = "/login";
        }}
      />
    </div>
  );
}
