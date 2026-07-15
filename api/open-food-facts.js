const SUPPORTED_LENGTHS = new Set([8, 12, 13, 14]);

function normalize(value) {
  return String(value || "").replace(/\D/g, "");
}

function hasValidCheckDigit(code) {
  const digits = code.split("").map(Number);
  const checkDigit = digits.pop();
  const sum = digits.reverse().reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return checkDigit === (10 - (sum % 10)) % 10;
}

async function requestProduct(url) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const result = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "MacroTrack/1.0 (https://macrotrack-six.vercel.app)",
        },
      });
      if (result.status < 500 || attempt === 1) return result;
    } catch (error) {
      lastError = error;
      if (attempt === 1) throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError || new Error("Open Food Facts request failed");
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ reason: "method_not_allowed" });
  }

  const code = normalize(request.query.code);
  if (!SUPPORTED_LENGTHS.has(code.length) || !hasValidCheckDigit(code)) {
    return response.status(400).json({ reason: "invalid_barcode" });
  }

  const fields = "code,product_name,product_name_en,brands,nutriments,serving_quantity,serving_size";
  const upstreamUrl = `https://world.openfoodfacts.org/api/v3/product/${code}.json?fields=${fields}`;

  try {
    const upstream = await requestProduct(upstreamUrl);
    const data = await upstream.json();

    response.setHeader("Cache-Control", upstream.ok
      ? "public, s-maxage=86400, stale-while-revalidate=604800"
      : "public, s-maxage=60");

    if (upstream.status === 429) return response.status(429).json({ reason: "rate_limited" });
    if (upstream.status >= 500) return response.status(503).json({ reason: "upstream_unavailable" });
    if (data?.result?.id === "product_not_found" || data?.status === "failure") {
      return response.status(404).json({ reason: "product_not_found" });
    }
    return response.status(200).json(data);
  } catch (error) {
    console.error("Open Food Facts proxy failed:", error);
    return response.status(502).json({ reason: "upstream_request_failed" });
  }
};
