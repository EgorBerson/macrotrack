import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";

export default function useCameraScanner(onScan) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraState, setCameraState] = useState("idle");
  const [capturedCode, setCapturedCode] = useState("");
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const onScanRef = useRef(onScan);
  useEffect(() => { onScanRef.current = onScan; });

  const closeCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOpen(false);
    setCameraState("idle");
    setCapturedCode("");
  };

  const openCamera = () => {
    setCameraError(null);
    setCameraState("aiming");
    setCapturedCode("");
    setCameraOpen(true);
  };

  useEffect(() => {
    if (!cameraOpen || !videoRef.current) return;
    const video = videoRef.current;
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.ALSO_INVERTED, true);
    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 80, delayBetweenScanSuccess: 150 });
    let active = true;
    let scanned = false;
    let candidate = null;
    let candidateHits = 0;
    const rejectedCodes = new Set();

    reader.decodeFromConstraints(
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
      video,
      (result, error, controls) => {
        if (!active || scanned) return;
        if (result) {
          const value = result.getText().trim();
          if (!/^\d{8,14}$/.test(value)) return;
          if (rejectedCodes.has(value)) return;
          if (candidate === value) candidateHits += 1;
          else {
            candidate = value;
            candidateHits = 1;
            setCameraError(null);
            setCapturedCode(value);
            setCameraState("detected");
          }
          if (candidateHits < 2) return;
          scanned = true;
          setCapturedCode(value);
          setCameraState("captured");
          Promise.resolve(onScanRef.current(value)).then(accepted => {
            if (!active) return;
            if (accepted === false) {
              rejectedCodes.add(value);
              candidate = null;
              candidateHits = 0;
              scanned = false;
              setCapturedCode("");
              setCameraState("aiming");
              setCameraError("This barcode was not found. Keep scanning or close the camera to enter it manually.");
              return;
            }
            setCameraState("success");
            setTimeout(() => {
              if (!active) return;
              controls.stop();
              controlsRef.current = null;
              setCameraOpen(false);
              setCameraState("idle");
            }, 550);
          }).catch(scanError => {
            if (!active) return;
            console.error("Barcode lookup error:", scanError);
            rejectedCodes.add(value);
            scanned = false;
            setCapturedCode("");
            setCameraState("aiming");
            setCameraError("Could not look up this barcode. Check your connection and try again.");
          });
          return;
        }
        if (error && !["NotFoundException", "ChecksumException", "FormatException"].includes(error.name)) {
          console.error("Barcode scanner error:", error);
        }
      }
    ).then(controls => {
      if (!active) controls.stop();
      else controlsRef.current = controls;
    }).catch(error => {
      if (!active) return;
      const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
      const unavailable = error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError";
      setCameraError(denied
        ? "Camera permission was denied. Allow camera access in your browser or system settings."
        : unavailable
          ? "No camera was found on this device."
          : `Could not start the camera${error?.message ? `: ${error.message}` : "."}`
      );
    });

    return () => {
      active = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [cameraOpen]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  return { cameraOpen, cameraError, cameraState, capturedCode, openCamera, closeCamera, videoRef };
}
