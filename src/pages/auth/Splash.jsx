import React from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, ArrowRight, ShieldCheck, Sparkles, Award } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="splash-container">
      {/* Animated Eco Icon */}
      <div className="splash-icon-wrapper">
        <div className="splash-icon-ring"></div>
        <Recycle size={56} strokeWidth={2.2} />
      </div>

      {/* Brand Title & Tagline */}
      <h1 className="splash-brand">EcoNexis</h1>
      <h2 className="splash-tagline">
        Smart E-Waste Collection &amp; Disposal Platform
      </h2>
      <p className="splash-desc">
        Empowering college campuses and communities to responsibly dispose, donate, and recycle electronics while earning valuable green rewards.
      </p>

      {/* Feature Highlights */}
      <div className="splash-features">
        <div className="splash-pill">
          <Sparkles size={16} color="var(--green-dark)" />
          <span>AI E-Waste Scanner</span>
        </div>
        <div className="splash-pill">
          <ShieldCheck size={16} color="#1d4ed8" />
          <span>Doorstep Pickup</span>
        </div>
        <div className="splash-pill">
          <Award size={16} color="#b45309" />
          <span>EcoPoints &amp; Rewards</span>
        </div>
      </div>

      {/* User Click Button */}
      <button
        className="btn btn-primary btn-lg"
        onClick={handleGetStarted}
        style={{
          boxShadow: "0 8px 24px rgba(174, 213, 246, 0.6)",
          paddingLeft: "32px",
          paddingRight: "32px"
        }}
      >
        <span>Get Started</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
