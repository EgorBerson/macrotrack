export default async function lookupOFF(rawCode) {
  const code = rawCode.replace(/\D/g, "");
  if (!/^\d{8,14}$/.test(code)) return null;
  const variants = [...new Set([code, "0" + code, code.replace(/^0+/, "")])];
  for (const c of variants) {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${c}.json`);
      const json = await res.json();
      if (json.status === 1) {
        const n = json.product.nutriments;
        const protein = round1(n["proteins_100g"] || 0);
        const carbs = round1(n["carbohydrates_100g"] || 0);
        const fat = round1(n["fat_100g"] || 0);
        let servingSize = 100;
        if (json.product.serving_quantity) {
          servingSize = Math.round(+json.product.serving_quantity) || 100;
        } else if (json.product.serving_size) {
          const m = String(json.product.serving_size).match(/(\d+(\.\d+)?)/);
          if (m) servingSize = Math.round(+m[1]) || 100;
        }
        return { name: json.product.product_name || json.product.product_name_en || "", p100: { cal: Math.round(protein * 4 + carbs * 4 + fat * 9), protein, carbs, fat }, servingSize };
      }
    } catch {}
  }
  return null;
}
