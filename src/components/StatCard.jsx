import React from "react";

export default function StatCard({
  title,
  value,
  icon,
  description,
  variant = "blue",
  trend
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${variant}`}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {(description || trend) && (
          <div className="stat-desc">
            {trend && <span style={{ color: "var(--green-dark)", fontWeight: "700" }}>{trend}</span>}
            {description && <span>{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
