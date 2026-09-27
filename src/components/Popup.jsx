import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function Popup({
  isOpen = true,
  title = "Notification",
  message,
  children,
  onClose,
  confirmText = "OK",
  onConfirm,
  cancelText,
  onCancel,
  type = "info"
}) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={22} color="var(--green-primary)" />;
      case "warning":
        return <AlertTriangle size={22} color="var(--accent-amber)" />;
      case "danger":
        return <AlertCircle size={22} color="var(--accent-red)" />;
      default:
        return <Info size={22} color="#3b82f6" />;
    }
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="popup-header">
          <div className="popup-title">
            {getIcon()}
            <span>{title}</span>
          </div>
          {onClose && (
            <button className="popup-close-btn" onClick={onClose} aria-label="Close dialog">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="popup-body">
          {message && <p>{message}</p>}
          {children}
        </div>

        <div className="popup-footer">
          {cancelText && (
            <button
              className="btn btn-secondary"
              onClick={onCancel || onClose}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`btn ${type === "danger" ? "btn-danger" : type === "success" ? "btn-success" : "btn-primary"}`}
            onClick={onConfirm || onClose}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
