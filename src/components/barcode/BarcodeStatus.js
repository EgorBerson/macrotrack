import { BARCODE_MESSAGES } from "../../services/openFoodFacts";

export default function BarcodeStatus({ status }) {
  if (!status) return null;
  const kind = status === "ok" ? "success" : status === "loading" ? "loading" : "error";
  return (
    <div className={`barcode-status ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {BARCODE_MESSAGES[status] || BARCODE_MESSAGES.service_error}
    </div>
  );
}
