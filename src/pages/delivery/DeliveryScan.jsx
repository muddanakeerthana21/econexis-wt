import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import jsQR from "jsqr";
import ScannerBox from "../../components/ScannerBox";
import Popup from "../../components/Popup";
import { ewasteApi } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import {
  QrCode,
  CheckCircle2,
  PackageCheck,
  Scale,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Coins,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  Cpu,
  Sparkles,
  Info
} from "lucide-react";

export default function DeliveryScan() {
  const location = useLocation();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);

  // States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [scannedRaw, setScannedRaw] = useState("");
  const [scanError, setScanError] = useState(null);

  // Fetched E-Waste Object from MongoDB
  const [scannedObject, setScannedObject] = useState(null);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);

  // Inspection checks
  const [measuredWeight, setMeasuredWeight] = useState("2.5");
  const [physicalItemMatches, setPhysicalItemMatches] = useState(true);
  const [safetyBatteryChecked, setSafetyBatteryChecked] = useState(true);

  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

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
          console.warn("Track stop warning:", e);
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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Lookup Object in MongoDB by Object ID
  const fetchObjectFromMongoDB = useCallback(async (objectIdStr) => {
    setIsLookingUp(true);
    setScanError(null);
    setScannedObject(null);
    setPickupConfirmed(false);

    try {
      const res = await ewasteApi.getByObjectId(objectIdStr);

      if (res && res.success && (res.object || res.data)) {
        const item = res.object || res.data;
        setScannedObject(item);
        if (item.pickupStatus === "Picked Up") {
          setPickupConfirmed(true);
        }
      } else {
        setScanError(`Object ID '${objectIdStr}' was not found in the EcoNexis MongoDB database.`);
      }
    } catch (err) {
      console.error("[DeliveryScan Lookup Error]:", err);
      setScanError(err.message || `Object ID '${objectIdStr}' not found in MongoDB.`);
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  // Handle successful QR detection
  const handleQrDetected = useCallback(
    (decodedString) => {
      stopCamera();
      setIsScanning(false);
      const cleanString = (decodedString || "").trim();
      setScannedRaw(cleanString);

      // Validate Format: Expected OBJ-XXXXXX format or valid Object ID
      const isValidFormat = /^OBJ-\d+$/i.test(cleanString) || cleanString.toUpperCase().startsWith("OBJ-");

      if (!isValidFormat && cleanString.length > 50) {
        // QR is JSON or generic text, not an EcoNexis object ID
        setScanError(`Invalid EcoNexis QR Code: QR contains unformatted text instead of a valid Object ID (e.g. OBJ-000001).`);
        setScannedObject(null);
        return;
      }

      if (!cleanString) {
        setScanError("Invalid EcoNexis QR Code: Empty QR code content.");
        setScannedObject(null);
        return;
      }

      // Valid format -> Fetch real object from MongoDB
      fetchObjectFromMongoDB(cleanString);
    },
    [fetchObjectFromMongoDB, stopCamera]
  );

  // Scan frame loop using jsQR
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
        handleQrDetected(code.data.trim());
        return;
      }
    }

    scanLoopRef.current = requestAnimationFrame(tickScan);
  }, [handleQrDetected]);

  // Start real camera stream
  const startCamera = async () => {
    setCameraError(null);
    setScanError(null);
    setPreviewImage(null);
    setScannedObject(null);
    setPickupConfirmed(false);
    setScannedRaw("");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera is not supported in this browser environment or requires HTTPS/localhost.");
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
      console.error("[Delivery QR Error]:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in browser permissions.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No video camera hardware detected.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is in use by another tab or application.");
      } else {
        setCameraError(`Camera error: ${err.message || "Unknown error"}`);
      }
      setIsCameraActive(false);
      setIsScanning(false);
    }
  };

  // Upload photo of customer QR code
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setPreviewImage(dataUrl);
        stopCamera();
        setScanError(null);
        setScannedObject(null);

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
            handleQrDetected(code.data.trim());
          } else {
            setScanError("No valid QR code could be decoded from this uploaded image. Please ensure the QR is clear and well lit.");
          }
        };
        img.src = dataUrl;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    stopCamera();
    setScannedObject(null);
    setPickupConfirmed(false);
    setPreviewImage(null);
    setCameraError(null);
    setScanError(null);
    setScannedRaw("");
  };

  // Confirm Pickup Action (Calls POST /api/ewaste/object/:objectId/pickup -> updates MongoDB)
  const handleConfirmPickup = async () => {
    if (!scannedObject || isConfirming) return;

    if (!physicalItemMatches) {
      alert("Please verify that the physical e-waste item matches the registered object before confirming pickup.");
      return;
    }

    setIsConfirming(true);

    try {
      const objectId = scannedObject.objectId || scannedObject.itemId;
      const res = await ewasteApi.confirmPickup(objectId, {
        measuredWeight: Number(measuredWeight) || scannedObject.weightKg || 1.0,
        notes: `Pickup verified & confirmed on site. Weight: ${measuredWeight}kg.`,
      });

      if (res && res.success) {
        const updated = res.object || res.data;
        setScannedObject(updated);
        setPickupConfirmed(true);

        setPopupState({
          isOpen: true,
          title: "Pickup Confirmed in MongoDB! 🎉",
          message: `E-Waste Object ${objectId} status updated to "Picked Up". Delivery record saved.`,
          type: "success",
        });
      } else {
        throw new Error(res?.message || "Failed to confirm pickup in database.");
      }
    } catch (err) {
      console.error("[Confirm Pickup Error]:", err);
      setPopupState({
        isOpen: true,
        title: "Pickup Update Failed",
        message: err.message || "Failed to update pickup status in database.",
        type: "error",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: "8px" }}>
            <Link to="/delivery" className="btn btn-outline btn-sm" style={{ display: "inline-flex", gap: "6px" }}>
              <ArrowLeft size={14} />
              <span>Back to Delivery Dashboard</span>
            </Link>
          </div>
          <h1 className="page-title">Delivery QR Verification Scanner</h1>
          <p className="page-subtitle">
            Scan physical E-Waste QR codes at doorstep handover to verify MongoDB registered objects and confirm pickup.
          </p>
        </div>
        <div className="badge badge-green">
          <Truck size={14} />
          <span>E-Waste Verification</span>
        </div>
      </div>

      {/* Scanned Raw Info Banner */}
      {scannedRaw && (
        <div className="card" style={{ marginBottom: "20px", padding: "12px 20px", backgroundColor: "var(--bg-surface-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <QrCode size={16} color="var(--primary-dark)" />
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Decoded QR Identity:</span>
              <code style={{ fontFamily: "monospace", fontWeight: "800", color: "var(--primary-dark)", fontSize: "0.95rem" }}>
                {scannedRaw}
              </code>
            </div>
            {isLookingUp && (
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="spinner" style={{ width: "12px", height: "12px", display: "inline-block", border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                Searching MongoDB for {scannedRaw}...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Scanner Box */}
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
          title="Scan Physical E-Waste QR Tag"
          subtitle="Point camera at the EcoNexis object tag attached to the physical device."
          isVerified={!!scannedObject && !isScanning}
        />

        {/* Scan / Format / Database Error Card */}
        {scanError && !isScanning && !isLookingUp && (
          <div className="detection-result-card" style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#ef4444" }}>
                  Invalid or Unrecognized QR Code
                </h3>
                <p style={{ fontSize: "0.92rem", color: "var(--text-primary)", marginTop: "4px" }}>
                  {scanError}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                  💡 Ensure you are scanning an official EcoNexis E-Waste item QR tag (format: <code>OBJ-000001</code>).
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                <RefreshCw size={15} />
                <span>Clear &amp; Try Again</span>
              </button>
              <button className="btn btn-primary" onClick={startCamera}>
                <QrCode size={15} />
                <span>Re-Open Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Real MongoDB E-Waste Object Details Card */}
        {scannedObject && !isScanning && (
          <div className="detection-result-card" style={{ border: `2px solid ${pickupConfirmed ? "var(--green-primary)" : "var(--primary-dark)"}` }}>
            <div className="detection-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: pickupConfirmed ? "var(--green-light)" : "var(--primary-light)",
                    color: pickupConfirmed ? "var(--green-dark)" : "var(--primary-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pickupConfirmed ? <CheckCircle2 size={28} /> : <PackageCheck size={28} />}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span className="badge badge-green">
                      <ShieldCheck size={13} />
                      <span>MongoDB Verified Object</span>
                    </span>
                    <span className={`badge ${pickupConfirmed || scannedObject.pickupStatus === "Picked Up" ? "badge-green" : "badge-amber"}`}>
                      {scannedObject.pickupStatus || "Pending"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "800" }}>
                    E-WASTE OBJECT: {scannedObject.objectId}
                  </h3>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                  Registration Status
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: pickupConfirmed ? "var(--green-dark)" : "var(--primary-dark)" }}>
                  {pickupConfirmed ? "Picked Up" : (scannedObject.status || "Registered")}
                </div>
              </div>
            </div>

            {/* Object Specification Grid */}
            <div className="detection-grid" style={{ marginBottom: "20px" }}>
              <div className="detection-item-stat">
                <div className="detection-label">Object ID</div>
                <div className="detection-val" style={{ fontFamily: "monospace", color: "var(--primary-dark)", fontWeight: "800" }}>
                  {scannedObject.objectId}
                </div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">Detected Type</div>
                <div className="detection-val">{scannedObject.type || scannedObject.itemName}</div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">AI Detected Category</div>
                <div className="detection-val" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Cpu size={15} color="var(--primary-dark)" />
                  <span>{scannedObject.aiDetection || scannedObject.category}</span>
                </div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">AI Model Confidence</div>
                <div className="detection-val" style={{ color: "var(--green-dark)", fontWeight: "700" }}>
                  {scannedObject.aiConfidence ? `${scannedObject.aiConfidence}%` : "95%"}
                </div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">Registered Owner</div>
                <div className="detection-val" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={15} color="var(--text-muted)" />
                  <span>{scannedObject.owner || scannedObject.userName || "Eco Contributor"}</span>
                </div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">Created Date</div>
                <div className="detection-val" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={15} color="var(--text-muted)" />
                  <span>{formatDate(scannedObject.createdAt)}</span>
                </div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">Pickup Status</div>
                <div className="detection-val">
                  <span className={`badge ${pickupConfirmed || scannedObject.pickupStatus === "Picked Up" ? "badge-green" : "badge-amber"}`}>
                    {pickupConfirmed ? "Picked Up" : (scannedObject.pickupStatus || "Pending")}
                  </span>
                </div>
              </div>

              <div className="detection-item-stat">
                <div className="detection-label">Assigned Delivery Partner</div>
                <div className="detection-val">
                  {scannedObject.deliveryPartnerName || (pickupConfirmed ? "Verified On-Site" : "—")}
                </div>
              </div>
            </div>

            {/* Field Verification & Safety Checklist */}
            {!pickupConfirmed ? (
              <div style={{ backgroundColor: "var(--bg-surface-secondary)", padding: "18px", borderRadius: "var(--radius-md)", marginBottom: "22px", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "0.92rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-primary)", marginBottom: "12px" }}>
                  Field Inspection &amp; Handover Verification
                </h4>

                <div className="grid-2" style={{ marginBottom: "14px" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="measured-wt">
                      <Scale size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                      Measured Weight (kg)
                    </label>
                    <input
                      id="measured-wt"
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={measuredWeight}
                      onChange={(e) => setMeasuredWeight(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Classification Match</label>
                    <div style={{ padding: "8px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "0.88rem", fontWeight: "600" }}>
                      {scannedObject.type}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", cursor: "pointer", fontWeight: "600" }}>
                    <input
                      type="checkbox"
                      checked={physicalItemMatches}
                      onChange={(e) => setPhysicalItemMatches(e.target.checked)}
                      style={{ accentColor: "var(--green-primary)", width: "18px", height: "18px" }}
                    />
                    <span>Verified: Physical item matches registered "{scannedObject.type}"</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={safetyBatteryChecked}
                      onChange={(e) => setSafetyBatteryChecked(e.target.checked)}
                      style={{ accentColor: "var(--green-primary)", width: "18px", height: "18px" }}
                    />
                    <span>Safety checked: Battery terminals taped &amp; item intact for transit</span>
                  </label>
                </div>
              </div>
            ) : (
              /* Confirmed Status Banner */
              <div style={{ backgroundColor: "var(--green-light)", border: "1.5px solid var(--green-border)", padding: "16px 20px", borderRadius: "var(--radius-md)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <CheckCircle2 size={32} color="var(--green-dark)" />
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--green-dark)", margin: "0 0 2px 0" }}>
                    Pickup Confirmed
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", margin: 0 }}>
                    Object ID: <strong>{scannedObject.objectId}</strong> • Status: <strong>Picked Up</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={handleReset} disabled={isConfirming}>
                <RefreshCw size={16} />
                <span>Scan Another Item</span>
              </button>

              {!pickupConfirmed ? (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleConfirmPickup}
                  disabled={isConfirming || !physicalItemMatches}
                  style={{ fontWeight: "800", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" }}
                >
                  <PackageCheck size={20} />
                  <span>{isConfirming ? "Updating MongoDB..." : "Confirm Pickup"}</span>
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/delivery")}
                >
                  <Truck size={16} />
                  <span>Return to Route</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Popup
        isOpen={popupState.isOpen}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        confirmText="Done"
        onConfirm={() => setPopupState({ ...popupState, isOpen: false })}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
      />
    </div>
  );
}
