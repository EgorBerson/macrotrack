export const DEFAULT_INGS = [
  { id: "chkdsh", name: "Honey Chilli Chicken",   p100: { cal: 135.6, protein: 17.7, carbs: 9.2,  fat: 2.6  } },
  { id: "wrice",  name: "White Rice (cooked)",     p100: { cal: 100,   protein: 1.67, carbs: 22.1, fat: 0.21 } },
  { id: "bread",  name: "Bread Slice",             p100: { cal: 133.3, protein: 6.7,  carbs: 26.7, fat: 1.7  } },
  { id: "cheese", name: "Cheese Slice",            p100: { cal: 300,   protein: 26.7, carbs: 0,    fat: 23.3 } },
  { id: "ham",    name: "Ham Slices",              p100: { cal: 150,   protein: 22.5, carbs: 2.5,  fat: 5    } },
  { id: "beefmx", name: "Beef Mix (seasoned)",     p100: { cal: 123.3, protein: 18.1, carbs: 4.3,  fat: 4.3  } },
  { id: "lcpita", name: "Low Carb Pita",           p100: { cal: 111.1, protein: 4.4,  carbs: 22.2, fat: 1.1  } },
  { id: "hclsau", name: "Honey Chilli Lime Sauce", p100: { cal: 126.7, protein: 3.3,  carbs: 11.7, fat: 7.5  } },
  { id: "pchips", name: "Protein Chips",           p100: { cal: 437.5, protein: 59.4, carbs: 15.6, fat: 15.6 } },
  { id: "pbar",   name: "Protein Bar",             p100: { cal: 241.9, protein: 45.2, carbs: 19.4, fat: 3.2  } },
];

export const DEFAULT_MEALS = [
  { id: "meal1", name: "🍗 Honey Chilli Chicken + Rice", manual: null, ingredients: [{ id: "chkdsh", name: "Honey Chilli Chicken", amount: 390 }, { id: "wrice", name: "White Rice (cooked)", amount: 240 }] },
  { id: "meal2", name: "🥪 Sandwich",                    manual: null, ingredients: [{ id: "bread", name: "Bread Slice", amount: 60 }, { id: "cheese", name: "Cheese Slice", amount: 15 }, { id: "ham", name: "Ham Slices", amount: 80 }] },
  { id: "meal3", name: "🌮 Taco Beef Pita",              manual: null, ingredients: [{ id: "beefmx", name: "Beef Mix (seasoned)", amount: 116 }, { id: "cheese", name: "Cheese Slice", amount: 15 }, { id: "lcpita", name: "Low Carb Pita", amount: 45 }, { id: "hclsau", name: "Honey Chilli Lime Sauce", amount: 60 }] },
  { id: "meal4", name: "🍿 Protein Chips (1 bag)",       manual: null, ingredients: [{ id: "pchips", name: "Protein Chips", amount: 32 }] },
  { id: "meal5", name: "🍫 Protein Bar",                 manual: null, ingredients: [{ id: "pbar", name: "Protein Bar", amount: 62 }] },
];
