export default function CameraOverlay({ videoRef, error, state, capturedCode, onClose }) {
  const captured = state === "captured" || state === "success";
  return (
    <div className="camera-overlay" onClick={onClose}>
      <div className="camera-window" role="dialog" aria-modal="true" aria-label="Barcode scanner" onClick={event => event.stopPropagation()}>
        <button className="icon-btn camera-close" aria-label="Close camera" onClick={onClose}>✕</button>
        <div className="camera-stage">
          <video ref={videoRef} playsInline muted />
          <div className={`scan-frame ${state || "aiming"}`} aria-hidden="true">
            {!captured && <div className="scan-line" />}
          </div>
        </div>
        {error
          ? <div className="camera-message camera-error">{error}</div>
          : <div className={`camera-message ${captured ? "captured" : state === "detected" ? "detected" : ""}`}>
              {state === "success" ? "Barcode found" : state === "captured" ? "Barcode captured — looking up…" : state === "detected" ? "Barcode detected — hold steady" : "Place the barcode inside the frame. You can rotate the package."}
              {capturedCode && <div className="camera-code">{capturedCode}</div>}
            </div>}
      </div>
    </div>
  );
}
