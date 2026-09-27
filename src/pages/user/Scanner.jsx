import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "../../context/AuthContext";
import ScannerBox from "../../components/ScannerBox";
import Popup from "../../components/Popup";
import { aiDemoItems } from "../../data/mockData";
import { loadAiModel, detectEwasteObject, drawDetectionsOnCanvas, EWASTE_TAXONOMY, isModelReady } from "../../services/aiDetection";
import { ewasteApi } from "../../services/api";
import {
  Sparkles,
  RefreshCw,
  Coins,
  CheckCircle,
  Truck,
  HeartHandshake,
  ShieldAlert,
  Info,
  Camera,
  AlertTriangle,
  Layers,
  Cpu,
  HelpCircle,
  Activity,
  CheckCircle2,
  QrCode,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  PackageCheck
} from "lucide-react";

export default function Scanner() {
  const { addEcoPoints, user } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const liveInferenceLoopRef = useRef(null);
  const lastInferenceTimeRef = useRef(0);

  // States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [modelState, setModelState] = useState("loading"); // "loading" | "ready" | "error"
  const [cameraError, setCameraError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [unsupportedMessage, setUnsupportedMessage] = useState(null);
  const [liveDetectionInfo, setLiveDetectionInfo] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredObject, setRegisteredObject] = useState(null);
  const [popupState, setPopupState] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const isModelLoading = modelState === "loading";

  // Cleanup camera stream and inference loop
  const stopCamera = useCallback(() => {
    if (liveInferenceLoopRef.current) {
      cancelAnimationFrame(liveInferenceLoopRef.current);
      liveInferenceLoopRef.current = null;
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
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsCameraActive(false);
    setIsScanning(false);
    setLiveDetectionInfo(null);
  }, []);

  // Pre-load TensorFlow.js COCO-SSD on component mount
  useEffect(() => {
    let isMounted = true;
    loadAiModel()
      .then(() => {
        if (isMounted) setModelState("ready");
      })
      .catch((err) => {
        console.error("COCO-SSD model loading error:", err);
        if (isMounted) setModelState("error");
      });

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [stopCamera]);

  // Real-time live inference loop on video frames (throttled to ~300ms for CPU efficiency)
  const runLiveInference = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2 || !isCameraActive) {
      liveInferenceLoopRef.current = requestAnimationFrame(runLiveInference);
      return;
    }

    const now = performance.now();
    if (now - lastInferenceTimeRef.current >= 300) {
      lastInferenceTimeRef.current = now;
      const video = videoRef.current;

      try {
        const result = await detectEwasteObject(video);
        if (result && result.rawPredictions && canvasRef.current) {
          drawDetectionsOnCanvas(
            canvasRef.current,
            result.rawPredictions,
            video.videoWidth || 640,
            video.videoHeight || 480
          );

          if (result.rawPredictions.length > 0) {
            const top = result.rawPredictions[0];
            const pct = Math.round(top.score * 100);
            setLiveDetectionInfo(`${top.class.toUpperCase()} • ${pct}%`);
          } else {
            setLiveDetectionInfo(null);
          }
        }
      } catch (err) {
        console.warn("Live inference frame error:", err.message);
      }
    }

    liveInferenceLoopRef.current = requestAnimationFrame(runLiveInference);
  }, [isCameraActive]);

  // Start live webcam stream
  const startCamera = async () => {
    setCameraError(null);
    setPreviewImage(null);
    setDetectionResult(null);
    setUnsupportedMessage(null);
    setLiveDetectionInfo(null);
    setRegisteredObject(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Webcam access is not supported by your browser environment or requires HTTPS/localhost.");
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

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play().catch((err) => console.warn("Video play error:", err));
      }

      liveInferenceLoopRef.current = requestAnimationFrame(runLiveInference);
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera permissions in your browser URL bar.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No video camera hardware was found on this system.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is currently in use by another tab or software.");
      } else {
        setCameraError(`Unable to start camera: ${err.message || "Unknown error"}`);
      }
      setIsCameraActive(false);
    }
  };

  // Capture frame from active video and run high-resolution AI inference
  const handleCaptureAndDetect = async () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      alert("Camera stream is still initializing. Please wait a moment.");
      return;
    }

    // Capture high-res frame to canvas
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const snapshotDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreviewImage(snapshotDataUrl);

    stopCamera();

    setIsScanning(true);
    setUnsupportedMessage(null);
    setDetectionResult(null);
    setRegisteredObject(null);

    try {
      const result = await detectEwasteObject(canvas);

      if (canvasRef.current && result.rawPredictions) {
        drawDetectionsOnCanvas(canvasRef.current, result.rawPredictions, canvas.width, canvas.height);
      }

      if (result.success && result.isEwaste && result.primaryDetection) {
        setDetectionResult(result.primaryDetection);
      } else if (result.success && !result.isEwaste && result.message) {
        setUnsupportedMessage({
          message: result.message,
          recommendation: result.recommendation,
          rawClass: result.primaryDetection?.rawClass || "Unknown",
          confidence: result.primaryDetection?.confidence || 0,
        });
      } else if (!result.success) {
        setUnsupportedMessage({
          message: result.error || "Failed to process image.",
          recommendation: "Please try scanning again with clearer lighting or hold the object steady.",
        });
      } else {
        setUnsupportedMessage({
          message: "No distinct object was recognized in the captured frame.",
          recommendation: "Hold the electronic gadget steady in the center of the frame with adequate lighting.",
        });
      }
    } catch (err) {
      console.error("Inference error:", err);
      setUnsupportedMessage({
        message: "Error executing TensorFlow.js AI vision model.",
        recommendation: err.message,
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Upload image file and run AI inference
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setPreviewImage(dataUrl);
        stopCamera();
        setRegisteredObject(null);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
          setIsScanning(true);
          setUnsupportedMessage(null);
          setDetectionResult(null);

          try {
            const result = await detectEwasteObject(img);

            if (canvasRef.current && result.rawPredictions) {
              drawDetectionsOnCanvas(canvasRef.current, result.rawPredictions, img.width, img.height);
            }

            if (result.success && result.isEwaste && result.primaryDetection) {
              setDetectionResult(result.primaryDetection);
            } else if (result.success && !result.isEwaste && result.message) {
              setUnsupportedMessage({
                message: result.message,
                recommendation: result.recommendation,
                rawClass: result.primaryDetection?.rawClass || "Unknown",
                confidence: result.primaryDetection?.confidence || 0,
              });
            } else if (!result.success) {
              setUnsupportedMessage({
                message: result.error || "Failed to process image.",
                recommendation: "Please try uploading another clear photo of an electronic device.",
              });
            } else {
              setUnsupportedMessage({
                message: "No distinct object recognized in the uploaded photo.",
                recommendation: "Please upload an image featuring an electronic device clearly.",
              });
            }
          } catch (err) {
            console.error("Upload inference error:", err);
            setUnsupportedMessage({
              message: "Error analyzing uploaded image.",
              recommendation: err.message,
            });
          } finally {
            setIsScanning(false);
          }
        };
        img.src = dataUrl;
      };

      reader.readAsDataURL(file);
    }
  };

  // Reset scanner state to scan again
  const handleReset = () => {
    stopCamera();
    setPreviewImage(null);
    setDetectionResult(null);
    setUnsupportedMessage(null);
    setCameraError(null);
    setLiveDetectionInfo(null);
    setRegisteredObject(null);
  };

  // Preset test item selection
  const handleSelectPreset = (item) => {
    stopCamera();
    setPreviewImage(null);
    setUnsupportedMessage(null);
    setRegisteredObject(null);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setDetectionResult({
        ...item,
        confidence: 96,
        rawClass: item.name.toLowerCase(),
      });
    }, 400);
  };

  // Real Register E-Waste & Generate QR Code (POST /api/ewaste -> MongoDB -> QR with Object ID ONLY)
  const handleRegisterAndGenerateQR = async () => {
    if (!detectionResult || isRegistering) return;

    setIsRegistering(true);

    try {
      const payload = {
        type: detectionResult.name,
        category: detectionResult.category,
        aiDetection: detectionResult.rawClass || detectionResult.name,
        aiConfidence: detectionResult.confidence || 95,
        condition: detectionResult.condition || "Scrap",
      };

      const res = await ewasteApi.create(payload);

      if (res && res.success && (res.object || res.data)) {
        const created = res.object || res.data;
        const objectId = created.objectId || created.id;

        // Generate QR code containing ONLY the unique objectId string (e.g. OBJ-000001)
        const qrDataUrl = await QRCode.toDataURL(objectId, {
          width: 320,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        });

        const registeredData = {
          objectId,
          type: created.type || detectionResult.name,
          aiDetection: created.aiDetection || detectionResult.rawClass,
          aiConfidence: created.aiConfidence || detectionResult.confidence,
          status: created.status || "Registered",
          pickupStatus: created.pickupStatus || "Pending",
          owner: created.owner || user?.name || "Eco Contributor",
          createdAt: created.createdAt || new Date().toISOString(),
          qrDataUrl,
          ecoPoints: detectionResult.ecoPoints || 50,
        };

        setRegisteredObject(registeredData);
        addEcoPoints(detectionResult.ecoPoints || 50);

        setPopupState({
          isOpen: true,
          title: "E-Waste Registered in MongoDB! 🌱",
          message: `Permanent Object ID ${objectId} created successfully. QR code contains identity ${objectId}. Attach it to your physical device for pickup verification. +${detectionResult.ecoPoints || 50} EcoPoints credited!`,
          type: "success",
        });
      } else {
        throw new Error(res?.message || "Failed to create e-waste object in database.");
      }
    } catch (err) {
      console.error("[Register E-Waste Error]:", err);
      setPopupState({
        isOpen: true,
        title: "Registration Failed",
        message: err.message || "Failed to connect to backend API.",
        type: "error",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Download QR image
  const handleDownloadQR = () => {
    if (!registeredObject?.qrDataUrl) return;
    const link = document.createElement("a");
    link.href = registeredObject.qrDataUrl;
    link.download = `${registeredObject.objectId}-QR.png`;
    link.click();
  };

  // Print QR tag helper
  const handlePrintQR = () => {
    if (!registeredObject?.qrDataUrl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EcoNexis E-Waste Tag - ${registeredObject.objectId}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; text-align: center; padding: 40px; margin: 0; background: #f8fafc; color: #0f172a; }
            .tag-card { border: 2.5px dashed #059669; padding: 28px; display: inline-block; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08); max-width: 380px; }
            .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #a7f3d0; }
            h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; }
            p { margin: 4px 0; color: #475569; font-size: 13px; }
            .qr-img { margin: 18px 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; }
            .id-box { font-size: 24px; font-weight: 900; font-family: monospace; letter-spacing: 2px; color: #0f172a; background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 10px 0; }
            .footer-text { font-size: 11px; color: #94a3b8; margin-top: 14px; }
          </style>
        </head>
        <body>
          <div class="tag-card">
            <div class="badge">EcoNexis Verified E-Waste Tag</div>
            <h2>${registeredObject.type}</h2>
            <p>AI Classified: ${registeredObject.aiDetection} (${registeredObject.aiConfidence}%)</p>
            <img class="qr-img" src="${registeredObject.qrDataUrl}" width="220" height="220" alt="EcoNexis QR Code" />
            <div class="id-box">${registeredObject.objectId}</div>
            <p><strong>Owner:</strong> ${registeredObject.owner}</p>
            <div class="footer-text">Attach this physical tag to your device before doorstep collection or kiosk drop-off.</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Redirect to donation page with prefilled item
  const handleDonate = () => {
    if (!detectionResult) return;
    navigate("/donation", {
      state: {
        prefilledItem: detectionResult.name,
        category: detectionResult.category,
      },
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI E-Waste Visual Scanner</h1>
          <p className="page-subtitle">
            Point your webcam or upload a photo to identify electronic components, evaluate recoverable precious materials, and calculate EcoPoints.
          </p>
        </div>
        <div className="badge badge-green">
          <Sparkles size={14} />
          <span>TensorFlow.js Object Vision</span>
        </div>
      </div>

      {/* Supported Classes Banner & Presets */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Cpu size={16} color="var(--primary-dark)" />
              Supported Detection Categories:
            </span>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Smartphones, Laptops, Keyboards, Mice, Monitors / TVs, Microwaves, Toasters, Cables &amp; Electronics
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)" }}>
              Preset Samples:
            </span>
            {aiDemoItems.slice(0, 4).map((item) => (
              <button
                key={item.name}
                className={`btn btn-sm ${detectionResult?.name === item.name ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleSelectPreset(item)}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanner Box with Camera & Canvas Integration */}
      <div className="scanner-container">
        <ScannerBox
          isScanning={isScanning}
          isCameraActive={isCameraActive}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onCapture={handleCaptureAndDetect}
          onUpload={handleImageUpload}
          onReset={handleReset}
          previewImage={previewImage}
          cameraError={cameraError}
          isModelLoading={isModelLoading}
          liveDetectionInfo={liveDetectionInfo}
          type="ai"
          title="Live AI Camera Scanner"
          subtitle="Click Start Camera to open webcam, then point at any electronic device."
          isVerified={!!detectionResult && !isScanning}
        />

        {/* Unsupported / Non-E-Waste Detected State */}
        {unsupportedMessage && !isScanning && (
          <div className="detection-result-card" style={{ borderColor: "#f59e0b" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  Classification Notice
                </h3>
                <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {unsupportedMessage.message}
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px" }}>
                  💡 {unsupportedMessage.recommendation}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                <RefreshCw size={15} />
                <span>Scan Another Item</span>
              </button>
              <button className="btn btn-primary" onClick={startCamera}>
                <Camera size={15} />
                <span>Re-Open Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Registered Object QR Card View */}
        {registeredObject && (
          <div className="detection-result-card" style={{ border: "2px solid var(--green-primary)", background: "linear-gradient(to bottom, var(--bg-surface), rgba(16, 185, 129, 0.04))" }}>
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
                  <div className="badge badge-green" style={{ marginBottom: "4px" }}>
                    <ShieldCheck size={13} />
                    <span>MongoDB Stored Object</span>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: "800" }}>E-Waste Registered Successfully!</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Unique Permanent Identity: <strong style={{ fontFamily: "monospace", color: "var(--primary-dark)", fontSize: "1rem" }}>{registeredObject.objectId}</strong>
                  </p>
                </div>
              </div>

              <div className="eco-points-reward-pill">
                <Coins size={24} color="#f59e0b" />
                <span>+{registeredObject.ecoPoints} EcoPoints</span>
              </div>
            </div>

            {/* QR Code Presentation Box */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", backgroundColor: "#ffffff", borderRadius: "var(--radius-lg)", border: "1.5px dashed var(--green-border)", margin: "20px 0" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                Scan Tag (Object ID Identity Only)
              </div>
              
              <img
                src={registeredObject.qrDataUrl}
                alt={`QR Code for ${registeredObject.objectId}`}
                style={{ width: "220px", height: "220px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />

              <div style={{ marginTop: "12px", fontFamily: "monospace", fontSize: "1.35rem", fontWeight: "900", letterSpacing: "2px", color: "#0f172a", backgroundColor: "#f1f5f9", padding: "6px 18px", borderRadius: "8px" }}>
                {registeredObject.objectId}
              </div>

              <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "8px", textAlign: "center", maxWidth: "340px" }}>
                Print or display this QR. Delivery partner scans this code on doorstep pickup to verify object identity.
              </p>
            </div>

            {/* Object Details Summary */}
            <div className="detection-grid" style={{ marginBottom: "20px" }}>
              <div className="detection-item-stat">
                <div className="detection-label">Object ID</div>
                <div className="detection-val" style={{ fontFamily: "monospace", color: "var(--primary-dark)" }}>{registeredObject.objectId}</div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Identified Type</div>
                <div className="detection-val">{registeredObject.type}</div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">AI Model Confidence</div>
                <div className="detection-val">{registeredObject.aiConfidence}% Match</div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Pickup Status</div>
                <div className="detection-val">
                  <span className="badge badge-amber">{registeredObject.pickupStatus}</span>
                </div>
              </div>
            </div>

            {/* QR Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                <RefreshCw size={16} />
                <span>Scan Another Device</span>
              </button>
              <button className="btn btn-outline" onClick={handlePrintQR}>
                <Printer size={16} />
                <span>Print Physical Tag</span>
              </button>
              <button className="btn btn-primary" onClick={handleDownloadQR}>
                <Download size={16} />
                <span>Download QR Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Valid E-Waste Detection Result Card (Before Registration) */}
        {detectionResult && !registeredObject && !isScanning && (
          <div className="detection-result-card">
            <div className="detection-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className="badge badge-green">
                    <Sparkles size={13} />
                    <span>AI Detection Successful • Confidence: {detectionResult.confidence || 95}%</span>
                  </span>
                  {detectionResult.rawClass && (
                    <span className="badge badge-blue">
                      <span>Detected: {detectionResult.rawClass}</span>
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: "800" }}>{detectionResult.name}</h3>
              </div>
              <div className="eco-points-reward-pill">
                <Coins size={24} color="#f59e0b" />
                <span>+{detectionResult.ecoPoints || 50} EcoPoints</span>
              </div>
            </div>

            <div className="detection-grid">
              <div className="detection-item-stat">
                <div className="detection-label">Detected Object / Category</div>
                <div className="detection-val">{detectionResult.category}</div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Evaluated Condition</div>
                <div className="detection-val">{detectionResult.condition || "Reusable / Recyclable"}</div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">CO₂ Offset Potential</div>
                <div className="detection-val" style={{ color: "var(--green-dark)" }}>
                  {detectionResult.co2Saved || "4.2 kg"}
                </div>
              </div>
              <div className="detection-item-stat">
                <div className="detection-label">Hazard Assessment</div>
                <div className="detection-val" style={{ fontSize: "0.92rem" }}>
                  {detectionResult.hazardLevel || "Low / Standard E-Waste"}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-surface-secondary)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "800",
                  letterSpacing: "0.04em",
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                RECOVERABLE PRECIOUS MATERIALS &amp; METALS
              </div>
              <p style={{ fontSize: "0.92rem", color: "var(--text-primary)", fontWeight: "500" }}>
                {detectionResult.rareMaterials || "Copper wiring, ABS plastics, precious metal circuit traces"}
              </p>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "8px" }}>
                💡 <em>{detectionResult.recommendation}</em>
              </div>
            </div>

            {/* Action Buttons with Register E-Waste & Generate QR */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={handleReset} disabled={isRegistering}>
                <RefreshCw size={16} />
                <span>Scan Another Item</span>
              </button>
              <button className="btn btn-success" onClick={handleDonate} disabled={isRegistering}>
                <HeartHandshake size={16} />
                <span>Donate for Reuse</span>
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleRegisterAndGenerateQR}
                disabled={!detectionResult || isScanning || isRegistering}
                style={{
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.35)",
                  fontWeight: "800",
                }}
              >
                <QrCode size={18} />
                <span>{isRegistering ? "Generating Object ID in MongoDB..." : "Register E-Waste & Generate QR"}</span>
              </button>
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
        confirmText="OK"
        onConfirm={() => setPopupState({ ...popupState, isOpen: false })}
        onClose={() => setPopupState({ ...popupState, isOpen: false })}
      />
    </div>
  );
}
