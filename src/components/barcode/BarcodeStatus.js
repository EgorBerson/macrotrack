import { BARCODE_MESSAGES } from "../../services/openFoodFacts";

const FIELD_LABELS = { name: "name", protein: "protein", carbs: "carbs", fat: "fat" };

export default function BarcodeStatus({ status, missingFields = [], reportedCalories = null, barcode = "" }) {
  if (!status) return null;
  const kind = status === "ok" ? "success" : status === "loading" ? "loading" : status === "incomplete_data" ? "warning" : "error";
  return (
    <div className={`barcode-status ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {BARCODE_MESSAGES[status] || BARCODE_MESSAGES.service_error}
      {status === "incomplete_data" && barcode && <div className="barcode-available">Barcode: {barcode}.</div>}
      {status === "incomplete_data" && missingFields.length > 0 && (
        <div className="barcode-missing">Missing: {missingFields.map(field => FIELD_LABELS[field] || field).join(", ")}.</div>
      )}
      {status === "incomplete_data" && reportedCalories !== null && (
        <div className="barcode-available">Available calories: {reportedCalories} kcal/100g.</div>
      )}
    </div>
  );
}
