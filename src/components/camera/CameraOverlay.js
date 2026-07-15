import { useEffect, useState } from "react";

export default function CameraOverlay({ videoRef, error, state, capturedCode, onClose, onRetry, onScanAgain }) {
  const [editedCode, setEditedCode] = useState(capturedCode || "");
  const captured = state === "captured" || state === "success";
  const rejected = state === "rejected";

  useEffect(() => {
    setEditedCode(capturedCode || "");
  }, [capturedCode]);

  return (
    <div className="camera-overlay" onClick={onClose}>
      <div className="camera-window" role="dialog" aria-modal="true" aria-label="Barcode scanner" onClick={event => event.stopPropagation()}>
        <button className="icon-btn camera-close" aria-label="Close camera" onClick={onClose}>✕</button>
        <div className="camera-stage">
          <video ref={videoRef} playsInline muted />
          <div className={`scan-frame ${state || "aiming"}`} aria-hidden="true">
            {!captured && !rejected && <div className="scan-line" />}
          </div>
        </div>
        <div className={`camera-message ${error ? "camera-error" : captured ? "captured" : state === "detected" ? "detected" : ""}`}>
          {error || (state === "success" ? "Barcode found" : state === "captured" ? "Barcode captured — looking up…" : state === "detected" ? "Barcode detected — hold steady" : "Place the barcode inside the frame. You can rotate the package.")}
          {capturedCode && !rejected && <div className="camera-code">Recognized: {capturedCode}</div>}
        </div>
        {rejected && capturedCode && (
          <div className="camera-correction">
            <label className="lbl" htmlFor="camera-barcode-edit">Recognized barcode — edit if needed</label>
            <div className="camera-correction-row">
              <input id="camera-barcode-edit" className="inp" inputMode="numeric" value={editedCode} onChange={event => setEditedCode(event.target.value.replace(/\D/g, ""))} onKeyDown={event => event.key === "Enter" && onRetry(editedCode)} />
              <button className="btn btn-primary btn-sm" onClick={() => onRetry(editedCode)}>Retry</button>
            </div>
            <button className="btn btn-ghost btn-sm camera-scan-again" onClick={onScanAgain}>Scan again</button>
          </div>
        )}
      </div>
    </div>
  );
}
