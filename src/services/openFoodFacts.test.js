import lookupOFF, { barcodesMatch, canonicalBarcode, normalizeBarcode, productToEditableForm, validateBarcode } from "./openFoodFacts";

describe("barcode helpers", () => {
  test.each(["036632024268", "049000042566", "4006381333931", "96385074"])("accepts valid UPC/EAN %s", code => {
    expect(validateBarcode(code)).toEqual(expect.objectContaining({ ok: true, code }));
  });

  test("rejects an unsupported length", () => {
    expect(validateBarcode("123456789").reason).toBe("invalid_length");
  });

  test("rejects an incorrect check digit", () => {
    expect(validateBarcode("049000042565").reason).toBe("invalid_checksum");
  });

  test("normalizes formatted input", () => {
    expect(normalizeBarcode("0 49000-04256 6")).toBe("049000042566");
  });

  test("matches UPC-A and its zero-padded EAN representation", () => {
    expect(canonicalBarcode("049000042566")).toBe("00049000042566");
    expect(barcodesMatch("049000042566", "0049000042566")).toBe(true);
  });
});

describe("Open Food Facts lookup results", () => {
  afterEach(() => jest.restoreAllMocks());

  test("returns a parsed product from API v3", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: "success",
        product: {
          code: "0049000042566",
          product_name: "Coca-Cola Zero Sugar",
          serving_quantity: 355,
          nutriments: { proteins_100g: 0, carbohydrates_100g: 0, fat_100g: 0, "energy-kcal_100g": 0 },
        },
      }),
    });

    await expect(lookupOFF("049000042566")).resolves.toEqual(expect.objectContaining({
      ok: true,
      name: "Coca-Cola Zero Sugar",
      servingSize: 355,
    }));
  });

  test.each([
    [404, "not_found"],
    [429, "rate_limited"],
    [503, "service_error"],
  ])("maps HTTP %s to %s", async (status, reason) => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status,
      json: async () => status === 404 ? { result: { id: "product_not_found" } } : {},
    });
    await expect(lookupOFF("049000042566")).resolves.toEqual(expect.objectContaining({ ok: false, reason }));
  });

  test("preserves available values in an incomplete product", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: "success",
        product: {
          product_name: "Partial product",
          serving_quantity: 50,
          nutriments: { proteins_100g: 10, carbohydrates_100g: 20, "energy-kcal_100g": 150 },
        },
      }),
    });
    const result = await lookupOFF("049000042566");
    expect(result).toEqual(expect.objectContaining({
      ok: false,
      partial: true,
      reason: "incomplete_data",
      missingFields: ["fat"],
      p100: { cal: 150, protein: 10, carbs: 20, fat: null },
    }));
    expect(productToEditableForm(result)).toEqual({
      name: "Partial product",
      amount: "50",
      protein: "5",
      carbs: "10",
      fat: "",
    });
  });
});
