import React, { useState } from "react";
import { awarenessArticles } from "../../data/mockData";
import Popup from "../../components/Popup";
import {
  BookOpen,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Leaf,
  BatteryCharging,
  Recycle
} from "lucide-react";

export default function Awareness() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const getTopicIcon = (category) => {
    switch (category) {
      case "Basics":
        return <BookOpen size={20} color="var(--primary-dark)" />;
      case "Health & Safety":
        return <ShieldAlert size={20} color="var(--accent-red)" />;
      case "Guide":
        return <Recycle size={20} color="var(--green-dark)" />;
      case "Circular Economy":
        return <Leaf size={20} color="var(--green-dark)" />;
      case "Reuse":
        return <Sparkles size={20} color="var(--accent-purple)" />;
      case "Battery Safety":
        return <BatteryCharging size={20} color="var(--accent-amber)" />;
      default:
        return <BookOpen size={20} />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">E-Waste Awareness &amp; Education Hub</h1>
          <p className="page-subtitle">
            Learn why responsible disposal matters, how to protect yourself from toxic heavy metals, and how urban mining works.
          </p>
        </div>
        <div className="badge badge-green">
          <Leaf size={14} />
          <span>Sustainability Knowledge Base</span>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid-3">
        {awarenessArticles.map((art) => (
          <div key={art.id} className="article-card">
            <div className="flex-between">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {getTopicIcon(art.category)}
                <span className="article-category">{art.category}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                <Clock size={13} />
                <span>{art.readTime}</span>
              </div>
            </div>

            <h3 className="article-title">{art.title}</h3>
            <p className="article-desc">{art.desc}</p>

            <div style={{ marginTop: "auto", paddingTop: "12px" }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedArticle(art)}
                style={{ width: "100%" }}
              >
                <span>Read Full Guide</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Read More Article Popup */}
      {selectedArticle && (
        <Popup
          isOpen={true}
          title={selectedArticle.title}
          type="info"
          confirmText="Done Reading"
          onClose={() => setSelectedArticle(null)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span className="badge badge-green">{selectedArticle.category}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedArticle.readTime}</span>
          </div>
          <div style={{ whiteSpace: "pre-line", lineHeight: 1.7, color: "var(--text-primary)", fontSize: "0.95rem" }}>
            {selectedArticle.content}
          </div>
        </Popup>
      )}
    </div>
  );
}
