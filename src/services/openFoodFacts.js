const SUPPORTED_GTIN_LENGTHS = new Set([8, 12, 13, 14]);

export const BARCODE_MESSAGES = {
  loading: "Looking up barcode…",
  ok: "Product found. Check the information below.",
  invalid_length: "Enter a valid 8, 12, 13 or 14 digit UPC/EAN barcode.",
  invalid_checksum: "The barcode check digit is incorrect. Check the recognized number and edit it if needed.",
  not_found: "This product is not in Open Food Facts yet. Enter it manually; save it in Ingredients with this barcode to find it next time.",
  rate_limited: "Open Food Facts is receiving too many requests. Wait a minute and try again.",
  network_error: "Could not reach the product database. Check your connection and try again.",
  service_error: "The product database is temporarily unavailable. Please try again later.",
  incomplete_data: "The product exists, but its nutrition information is incomplete. Enter the values from the label manually.",
};

export function normalizeBarcode(value) {
  return String(value || "").replace(/\D/g, "");
}

export function canonicalBarcode(value) {
  const code = normalizeBarcode(value);
  return SUPPORTED_GTIN_LENGTHS.has(code.length) ? code.padStart(14, "0") : code;
}

export function barcodesMatch(first, second) {
  if (!first || !second) return false;
  return canonicalBarcode(first) === canonicalBarcode(second);
}

export function validateBarcode(value) {
  const code = normalizeBarcode(value);
  if (!SUPPORTED_GTIN_LENGTHS.has(code.length)) {
    return { ok: false, reason: "invalid_length", code, message: BARCODE_MESSAGES.invalid_length };
  }

  const digits = code.split("").map(Number);
  const suppliedCheckDigit = digits.pop();
  const sum = digits.reverse().reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  if (suppliedCheckDigit !== expectedCheckDigit) {
    return { ok: false, reason: "invalid_checksum", code, message: BARCODE_MESSAGES.invalid_checksum };
  }

  return { ok: true, code };
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function failed(reason, code) {
  return { ok: false, reason, code, message: BARCODE_MESSAGES[reason] || BARCODE_MESSAGES.service_error };
}

function parseProduct(json, requestedCode) {
  const product = json?.product;
  if (!product) return failed("not_found", requestedCode);

  const nutrients = product.nutriments || {};
  const macroKeys = ["proteins_100g", "carbohydrates_100g", "fat_100g"];
  if (!macroKeys.some(key => Object.prototype.hasOwnProperty.call(nutrients, key))) {
    return failed("incomplete_data", requestedCode);
  }

  const protein = round1(nutrients.proteins_100g);
  const carbs = round1(nutrients.carbohydrates_100g);
  const fat = round1(nutrients.fat_100g);
  const reportedCalories = Number(nutrients["energy-kcal_100g"]);
  const calories = Number.isFinite(reportedCalories)
    ? Math.round(reportedCalories)
    : Math.round(protein * 4 + carbs * 4 + fat * 9);

  let servingSize = Number(product.serving_quantity);
  if (!Number.isFinite(servingSize) || servingSize <= 0) {
    const match = String(product.serving_size || "").match(/(\d+(?:\.\d+)?)/);
    servingSize = match ? Number(match[1]) : 100;
  }
  servingSize = Math.round(servingSize) || 100;

  const name = product.product_name || product.product_name_en || product.brands || "Scanned product";
  return {
    ok: true,
    reason: "ok",
    message: BARCODE_MESSAGES.ok,
    code: normalizeBarcode(product.code || requestedCode),
    name,
    p100: { cal: calories, protein, carbs, fat },
    servingSize,
  };
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    return await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function lookupOFF(rawCode) {
  const validation = validateBarcode(rawCode);
  if (!validation.ok) return validation;
  const { code } = validation;
  const isLocal = typeof window !== "undefined" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const fields = "code,product_name,product_name_en,brands,nutriments,serving_quantity,serving_size";
  const url = isLocal
    ? `https://world.openfoodfacts.org/api/v3/product/${code}.json?fields=${fields}`
    : `/api/open-food-facts?code=${encodeURIComponent(code)}`;

  try {
    const response = await fetchWithTimeout(url);
    let json = null;
    try {
      json = await response.json();
    } catch {
      return failed("service_error", code);
    }

    if (response.status === 404 || json?.result?.id === "product_not_found") return failed("not_found", code);
    if (response.status === 429) return failed("rate_limited", code);
    if (!response.ok) return failed(response.status >= 500 ? "service_error" : "network_error", code);
    if (json?.status === "failure") return failed("not_found", code);
    return parseProduct(json, code);
  } catch (error) {
    console.error("Open Food Facts lookup failed:", error);
    return failed(error?.name === "AbortError" ? "service_error" : "network_error", code);
  }
}
