import React from "react";
import { Camera, CameraOff, Upload, Sparkles, QrCode, CheckCircle2, AlertCircle, RefreshCw, Eye } from "lucide-react";

export default function ScannerBox({
  isScanning = false,
  isCameraActive = false,
  videoRef,
  canvasRef,
  onStartCamera,
  onStartScan,
  onStopCamera,
  onCapture,
  onUpload,
  onReset,
  type = "ai", // "ai" or "qr"
  title,
  subtitle,
  previewImage,
  isVerified = false,
  cameraError = null,
  isModelLoading = false,
  statusMessage = "",
  liveDetectionInfo = null,
}) {
  const handleStart = onStartCamera || onStartScan;

  return (
    <div className={`scanner-box ${isScanning ? "scanning" : ""}`}>
      {/* Laser scanning line */}
      {isScanning && <div className="scanner-laser-line"></div>}

      {/* Target crosshairs */}
      <div className="scanner-crosshairs"></div>

      {/* Active Live Video Feed */}
      {isCameraActive && !previewImage ? (
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Canvas overlay for drawing AI bounding boxes or QR indicators */}
          {canvasRef && (
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                objectFit: "cover",
                zIndex: 5,
              }}
            />
          )}

          {/* Live indicator badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: "rgba(15, 23, 42, 0.82)",
              color: "#10b981",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              zIndex: 10,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                animation: "pulse 1.2s infinite",
              }}
            ></span>
            <span>LIVE CAMERA {type === "qr" ? "• SCANNING QR" : "• REAL-TIME VISION"}</span>
          </div>

          {/* Live real-time detection tag if available */}
          {liveDetectionInfo && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                color: "#60a5fa",
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.78rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(96, 165, 250, 0.4)",
                zIndex: 10,
              }}
            >
              <Eye size={14} />
              <span>{liveDetectionInfo}</span>
            </div>
          )}

          {/* QR Viewfinder Target Overlay */}
          {type === "qr" && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "220px",
                height: "220px",
                border: "2px dashed rgba(16, 185, 129, 0.8)",
                borderRadius: "16px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 6,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Center QR Code Here
              </span>
            </div>
          )}

          {/* Action buttons overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "0",
              right: "0",
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              zIndex: 10,
            }}
          >
            {onCapture && type === "ai" && (
              <button
                className="btn btn-primary"
                onClick={onCapture}
                disabled={isScanning || isModelLoading}
                style={{
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  fontWeight: "700",
                }}
              >
                <Camera size={18} />
                <span>{isScanning ? "Analyzing Frame..." : "Capture & Evaluate"}</span>
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={onStopCamera}
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.88)",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.25)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
              }}
            >
              <CameraOff size={18} />
              <span>Stop Camera</span>
            </button>
          </div>
        </div>
      ) : previewImage ? (
        /* Captured Snapshot / Uploaded Image View */
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
          <img
            src={previewImage}
            alt="Scan target"
            style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#0f172a" }}
          />

          {canvasRef && (
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                objectFit: "contain",
                zIndex: 5,
              }}
            />
          )}

          {onReset && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={onReset}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "rgba(15, 23, 42, 0.88)",
                color: "#fff",
                zIndex: 10,
              }}
            >
              <RefreshCw size={14} />
              <span>Retake / Clear</span>
            </button>
          )}
        </div>
      ) : cameraError ? (
        /* Camera Error State */
        <div className="scanner-empty-state">
          <div
            className="scanner-icon-circle"
            style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
          >
            <AlertCircle size={38} />
          </div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#ef4444" }}>
            Camera Access Unavailable
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "420px", lineHeight: "1.5" }}>
            {cameraError}
          </p>
          <div className="scanner-actions" style={{ marginTop: "14px" }}>
            {handleStart && (
              <button className="btn btn-primary btn-sm" onClick={handleStart}>
                <RefreshCw size={16} />
                <span>Retry Camera</span>
              </button>
            )}
            <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
              <Upload size={16} />
              <span>Upload Image File</span>
              <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      ) : isScanning || isModelLoading ? (
        /* Loading / Inference State */
        <div className="scanner-empty-state">
          <div className="scanner-icon-circle" style={{ animation: "pulse 1.5s infinite" }}>
            {type === "ai" ? <Sparkles size={36} /> : <QrCode size={36} />}
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            {isModelLoading
              ? "Loading TensorFlow.js COCO-SSD Vision Model..."
              : type === "ai"
              ? "Executing Real AI Object Detection..."
              : "Decoding QR Code Frame..."}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {statusMessage ||
              (type === "ai"
                ? "Running browser neural network inference on image pixels..."
                : "Scanning frame for QR matrix code pattern...")}
          </p>
        </div>
      ) : isVerified ? (
        /* Verified State */
        <div className="scanner-empty-state">
          <div
            className="scanner-icon-circle"
            style={{ background: "var(--green-light)", color: "var(--green-dark)" }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--green-dark)" }}>
            Scan &amp; Verification Complete!
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {type === "qr" ? "QR code successfully decoded." : "Object identified by AI model."} Check details below.
          </p>
        </div>
      ) : (
        /* Idle State */
        <div className="scanner-empty-state">
          <div className="scanner-icon-circle">
            {type === "ai" ? <Camera size={36} /> : <QrCode size={36} />}
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
            {title || (type === "ai" ? "AI E-Waste Visual Scanner" : "Scan Disposal QR Code")}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px" }}>
            {subtitle ||
              (type === "ai"
                ? "Open your webcam or upload a photo of your electronic device to detect components with real AI."
                : "Scan the QR code at any EcoNexis campus kiosk, smart bin, or doorstep handover pass.")}
          </p>
          <div className="scanner-actions" style={{ marginTop: "14px" }}>
            {handleStart && (
              <button className="btn btn-primary" onClick={handleStart}>
                <Camera size={18} />
                <span>{type === "ai" ? "Start Camera" : "Open Camera Scanner"}</span>
              </button>
            )}
            <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
              <Upload size={18} />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
