import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import jsQR from "jsqr";
import { useAuth } from "../../context/AuthContext";
import ScannerBox from "../../components/ScannerBox";
import Popup from "../../components/Popup";
import {
  QrCode,
  CheckCircle2,
  Coins,
  MapPin,
  RefreshCw,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Code
} from "lucide-react";

export default function QRScanner() {
  const { addEcoPoints, user } = useAuth();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [scannedData, setScannedData] = useState(null);
  const [showClaimPopup, setShowClaimPopup] = useState(false);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping track:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  }, []);

  // Ensure camera stops on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle successful QR detection
  const handleQrDetected = useCallback(
    (decodedString, locationCoords) => {
      stopCamera();
      setIsScanning(false);
      setIsVerified(true);

      let parsed = null;
      try {
        parsed = JSON.parse(decodedString);
      } catch (e) {
        parsed = null;
      }

      const pointsEarned = parsed?.points ? Number(parsed.points) : 100;
      addEcoPoints(pointsEarned);

      setScannedData({
        rawString: decodedString,
        isJson: !!parsed,
        kioskId: parsed?.kioskId || parsed?.id || (decodedString.length < 30 ? decodedString : "ECO-KIOSK-VERIFIED"),
        location: parsed?.location || "EcoNexis Smart Recycling Station",
        points: pointsEarned,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        details: parsed?.details || parsed?.message || "Automated drop-off verified by kiosk QR code.",
      });

      setShowClaimPopup(true);
    },
    [addEcoPoints, stopCamera]
  );

  // Continuous frame scanning loop using jsQR
  const tickScan = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      scanLoopRef.current = requestAnimationFrame(tickScan);
      return;
    }

    const video = videoRef.current;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data && code.data.trim()) {
        handleQrDetected(code.data.trim(), code.location);
        return;
      }
    }

    scanLoopRef.current = requestAnimationFrame(tickScan);
  }, [handleQrDetected]);

  // Start real webcam stream
  const startCamera = async () => {
    setCameraError(null);
    setPreviewImage(null);
    setIsVerified(false);
    setScannedData(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera access is not supported by your browser or requires HTTPS / localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play().catch((err) => console.warn("Video play error:", err));
      }

      scanLoopRef.current = requestAnimationFrame(tickScan);
    } catch (err) {
      console.error("[QR Scanner Error]:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera permissions in your browser address bar.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No webcam or video capture device was detected on this device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is currently in use by another tab or application.");
      } else {
        setCameraError(`Camera initialization failed: ${err.message || "Unknown error"}`);
      }
      setIsCameraActive(false);
      setIsScanning(false);
    }
  };

  // Upload image containing QR code
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setPreviewImage(dataUrl);
        stopCamera();

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });

          if (code && code.data && code.data.trim()) {
            handleQrDetected(code.data.trim(), code.location);
          } else {
            alert("No valid QR code could be decoded from this uploaded image. Please ensure the QR is in focus and well lit.");
          }
        };
        img.src = dataUrl;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    stopCamera();
    setIsVerified(false);
    setScannedData(null);
    setPreviewImage(null);
    setCameraError(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Disposal Kiosk QR Scanner</h1>
          <p className="page-subtitle">
            Point your camera at the QR code displayed on automated campus smart bins &amp; collection kiosks to verify your disposal and earn EcoPoints.
          </p>
        </div>
        <div className="badge badge-green">
          <CheckCircle2 size={14} />
          <span>Real-Time QR Vision</span>
        </div>
      </div>

      <div className="scanner-container">
        <ScannerBox
          isScanning={isScanning}
          isCameraActive={isCameraActive}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onUpload={handleImageUpload}
          onReset={handleReset}
          previewImage={previewImage}
          cameraError={cameraError}
          type="qr"
          title="Disposal Kiosk Live QR Scanner"
          subtitle="Click Start QR Scanner, allow camera access, and point at any EcoNexis QR code."
          isVerified={isVerified}
        />

        {/* Verification Result Card */}
        {isVerified && scannedData && (
          <div className="detection-result-card">
            <div className="detection-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--green-light)",
                    color: "var(--green-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--green-dark)" }}>
                    QR Code Verified!
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Disposal event authenticated in real-time
                  </p>
                </div>
              </div>
              <div className="eco-points-reward-pill">
                <Coins size={24} color="#f59e0b" />
                <span>+{scannedData.points} EcoPoints</span>
              </div>
            </div>

            <div className="detection-grid">
              <div className="detection-item-stat">
                <div className="detection-label">Kiosk / Terminal ID</div>
                <div className="detection-val" style={{ fontSize: "1.05rem", fontFamily: "monospace", color: "var(--primary-dark)" }}>
                  {scannedData.kioskId}
                </div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Location Point</div>
                <div className="detection-val" style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={16} color="var(--primary-dark)" />
                  {scannedData.location}
                </div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Scan Timestamp</div>
                <div className="detection-val" style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={16} color="var(--text-muted)" />
                  {scannedData.timestamp}
                </div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Drop-off Status</div>
                <div className="detection-val">
                  <span className="badge badge-green">Verified &amp; Recorded</span>
                </div>
              </div>
            </div>

            {/* Raw QR Payload Box */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-secondary)",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Code size={14} />
                DECODED QR DATA PAYLOAD
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.88rem", color: "var(--text-primary)", wordBreak: "break-all" }}>
                {scannedData.rawString}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                <RefreshCw size={16} />
                <span>Scan Another QR Code</span>
              </button>
              <Link to="/rewards" className="btn btn-primary">
                <Award size={16} />
                <span>Redeem EcoRewards</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <Popup
        isOpen={showClaimPopup}
        title="Points Added! 🎉"
        message={`+${scannedData?.points || 100} EcoPoints have been credited to your account for verified smart bin disposal at ${scannedData?.kioskId || "Kiosk"}.`}
        type="success"
        confirmText="Awesome!"
        onClose={() => setShowClaimPopup(false)}
      />
    </div>
  );
}
