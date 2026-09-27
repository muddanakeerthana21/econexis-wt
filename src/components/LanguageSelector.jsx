import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: "10px",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          color: "var(--text-secondary)"
        }}
      >
        <Globe size={15} />
      </div>
      <select
        value={language}
        onChange={handleLanguageChange}
        className="form-select"
        style={{
          paddingLeft: "32px",
          paddingRight: "26px",
          paddingTop: "7px",
          paddingBottom: "7px",
          fontSize: "0.82rem",
          fontWeight: "600",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--bg-surface-secondary)",
          border: "1px solid var(--border-color)",
          cursor: "pointer",
          width: "auto"
        }}
        aria-label="Select Language"
      >
        <option value="en">English</option>
        <option value="te">తెలుగు (Telugu)</option>
        <option value="hi">हिन्दी (Hindi)</option>
      </select>
    </div>
  );
}
