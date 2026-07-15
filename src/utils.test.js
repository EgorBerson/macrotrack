import { calcIngredientMacros, calcLoggedMacros, calcLogEntryMacros, calcMealMacros, dateKey, findDuplicateMeal, getHistoryDays, mealCompositionSignature, normalizeIngredientName, round1, scaleMacros, sumMacros, validateNewHistoryDay } from "./utils";

describe("nutrition utilities", () => {
  test("creates a date key from local calendar fields", () => {
    const date = new Date(2026, 6, 14, 23, 30);
    expect(dateKey(date)).toBe("2026-07-14");
  });

  test("keeps today in history even when today has no entries", () => {
    expect(getHistoryDays({ "2026-07-13": [{}], "2026-07-14": [{}] }, "2026-07-15"))
      .toEqual(["2026-07-15", "2026-07-14", "2026-07-13"]);
  });

  test("allows only a missing past date for a new history day", () => {
    const existing = ["2026-07-13", "2026-07-14"];
    expect(validateNewHistoryDay("2026-07-12", "2026-07-15", existing)).toBeNull();
    expect(validateNewHistoryDay("2026-07-14", "2026-07-15", existing)).toBe("This day is already in your history.");
    expect(validateNewHistoryDay("2026-07-15", "2026-07-15", existing)).toBe("Only dates before today can be added.");
    expect(validateNewHistoryDay("2026-07-16", "2026-07-15", existing)).toBe("Only dates before today can be added.");
  });

  test("rounds macro values to one decimal place", () => {
    expect(round1(12.345)).toBe(12.3);
    expect(round1(12.36)).toBe(12.4);
  });

  test("normalizes ingredient names for duplicate detection", () => {
    expect(normalizeIngredientName("  Cream   CHEESE Spread ")).toBe("cream cheese spread");
  });

  test("identifies the same meal composition regardless of name or ingredient order", () => {
    const first = { id: "first", name: "Lunch", ingredients: [{ id: "rice", name: "Rice", amount: 150 }, { id: "chicken", name: "Chicken", amount: 200 }] };
    const renamed = { id: "second", name: "Dinner", ingredients: [{ id: "chicken", name: "Chicken", amount: "200" }, { id: "rice", name: "Rice", amount: 150 }] };
    expect(mealCompositionSignature(first)).toBe(mealCompositionSignature(renamed));
    expect(findDuplicateMeal(renamed, [first])).toBe(first);
  });

  test("allows a meal that contains another meal plus additional ingredients", () => {
    const base = { id: "base", ingredients: [{ name: "Rice", amount: 150 }, { name: "Chicken", amount: 200 }] };
    const extended = { id: "extended", ingredients: [...base.ingredients, { name: "Avocado", amount: 50 }] };
    expect(findDuplicateMeal(extended, [base])).toBeNull();
  });

  test("treats different ingredient quantities as different meals", () => {
    const base = { id: "base", ingredients: [{ name: "Rice", amount: 150 }, { name: "Chicken", amount: 200 }] };
    const differentAmount = { id: "different", ingredients: [{ name: "Rice", amount: 151 }, { name: "Chicken", amount: 200 }] };
    expect(findDuplicateMeal(differentAmount, [base])).toBeNull();
  });

  test("calculates a meal from per-100g ingredient values", () => {
    const ingredients = [
      { id: "rice", p100: { cal: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
      { id: "chicken", p100: { cal: 165, protein: 31, carbs: 0, fat: 3.6 } },
    ];
    const meal = { ingredients: [
      { id: "rice", amount: 150 },
      { id: "chicken", amount: 200 },
    ] };

    expect(calcMealMacros(meal, ingredients)).toEqual({
      cal: 525,
      protein: 66.1,
      carbs: 42,
      fat: 7.7,
    });
  });

  test("uses manual meal macros unchanged", () => {
    const manual = { cal: 500, protein: 40, carbs: 50, fat: 15 };
    expect(calcMealMacros({ manual }, [])).toEqual(manual);
  });

  test("scales every nutrition value for half and double portions", () => {
    const macros = { cal: 500, protein: 40, carbs: 50, fat: 15 };
    expect(scaleMacros(macros, 0.5)).toEqual({ cal: 250, protein: 20, carbs: 25, fat: 7.5 });
    expect(scaleMacros(macros, 2)).toEqual({ cal: 1000, protein: 80, carbs: 100, fat: 30 });
  });

  test("calculates a logged ingredient from its amount and per-100g values", () => {
    const entry = { amount: 50, p100: { cal: 229, protein: 6.5, carbs: 0, fat: 22.6 } };
    expect(calcIngredientMacros(entry)).toEqual({ cal: 114.5, protein: 3.3, carbs: 0, fat: 11.3 });
    expect(calcLogEntryMacros(entry)).toEqual({ cal: 114.5, protein: 3.3, carbs: 0, fat: 11.3 });
  });

  test("sums numeric and string log values without concatenating them", () => {
    expect(sumMacros([
      { cal: "100", protein: "10", carbs: "5", fat: "2" },
      { cal: 50, protein: 5, carbs: 2.5, fat: 1 },
    ])).toEqual({ cal: 150, protein: 15, carbs: 7.5, fat: 3 });
  });

  test("recovers a legacy zero log entry from its saved meal and serving multiplier", () => {
    const meals = [{ id: "sandwich", name: "Sandwich", ingredients: [{ id: "bread", amount: 100 }] }];
    const ingredients = [{ id: "bread", p100: { cal: 250, protein: 10, carbs: 40, fat: 5 } }];
    const entry = { id: "old-log", name: "Sandwich x2", cal: 0, protein: 0, carbs: 0, fat: 0 };
    expect(calcLoggedMacros(entry, meals, ingredients)).toEqual({ cal: 500, protein: 20, carbs: 80, fat: 10 });
  });
});
