export const uid = () => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 11);

export const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayStr = () => dateKey();

export const fmtDate = date => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
});

export const getHistoryDays = (log = {}, today = todayStr()) => [...new Set([
  today,
  ...Object.keys(log),
])].sort((left, right) => right.localeCompare(left));

export const validateNewHistoryDay = (day, today = todayStr(), existingDays = []) => {
  if (!day) return "Choose a date.";
  if (day >= today) return "Only dates before today can be added.";
  if (existingDays.includes(day)) return "This day is already in your history.";
  return null;
};

export const round1 = number => Math.round(number * 10) / 10;

const numberOrZero = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const scaleMacros = (macros = {}, multiplier = 1) => {
  const factor = numberOrZero(multiplier);
  return {
    cal: round1(numberOrZero(macros.cal ?? macros.calories) * factor),
    protein: round1(numberOrZero(macros.protein) * factor),
    carbs: round1(numberOrZero(macros.carbs) * factor),
    fat: round1(numberOrZero(macros.fat) * factor),
  };
};

export const sumMacros = (items = [], getMacros = item => item) => {
  const total = items.reduce((sum, item) => {
    const macros = scaleMacros(getMacros(item), 1);
    return {
      cal: sum.cal + macros.cal,
      protein: sum.protein + macros.protein,
      carbs: sum.carbs + macros.carbs,
      fat: sum.fat + macros.fat,
    };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
  return scaleMacros(total, 1);
};

export const calcIngredientMacros = ingredient => scaleMacros(
  ingredient?.p100,
  numberOrZero(ingredient?.amount) / 100,
);

export const calcLogEntryMacros = entry => {
  if (entry?.ingredients?.length) return sumMacros(entry.ingredients, calcIngredientMacros);
  if (entry?.p100) return calcIngredientMacros(entry);
  return scaleMacros(entry, 1);
};

export const calcLoggedMacros = (entry, meals = [], ingredients = []) => {
  const direct = calcLogEntryMacros(entry);
  if (Object.values(direct).some(value => value !== 0)) return direct;

  const nameMatch = String(entry?.name || "").match(/^(.*?)(?: x(\d+(?:\.\d+)?))?$/);
  const baseName = nameMatch?.[1];
  const meal = meals.find(item => item.id === entry?.mealId) || meals.find(item => item.name === baseName);
  if (!meal) return direct;

  const multiplier = entry?.servings ?? nameMatch?.[2] ?? 1;
  return scaleMacros(calcMealMacros(meal, ingredients), multiplier);
};

export const normalizeIngredientName = value => String(value || "")
  .trim()
  .toLocaleLowerCase()
  .replace(/\s+/g, " ");

const compositionNumber = value => Math.round(numberOrZero(value) * 10000) / 10000;

export const mealCompositionSignature = (meal, ingredientLibrary = []) => {
  if (!meal?.ingredients?.length) return null;

  const amountsByIngredient = new Map();
  meal.ingredients.forEach(mealIngredient => {
    const libraryIngredient = ingredientLibrary.find(ingredient => ingredient.id === mealIngredient.id);
    const ingredient = { ...libraryIngredient, ...mealIngredient };
    const macros = ingredient.p100 || {};
    const identity = ingredient.barcode
      ? `barcode:${ingredient.barcode}`
      : `ingredient:${normalizeIngredientName(ingredient.name)}:${[
          macros.cal,
          macros.protein,
          macros.carbs,
          macros.fat,
        ].map(compositionNumber).join(",")}`;
    amountsByIngredient.set(
      identity,
      compositionNumber((amountsByIngredient.get(identity) || 0) + numberOrZero(mealIngredient.amount)),
    );
  });

  return [...amountsByIngredient.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([identity, amount]) => `${identity}@${amount}`)
    .join("|");
};

export const findDuplicateMeal = (meal, meals = [], ingredientLibrary = []) => {
  const signature = mealCompositionSignature(meal, ingredientLibrary);
  if (!signature) return null;
  return meals.find(existing =>
    existing.id !== meal.id
    && mealCompositionSignature(existing, ingredientLibrary) === signature
  ) || null;
};

export function calcMealMacros(meal, ingredients) {
  if (meal.manual) return scaleMacros(meal.manual, 1);
  return sumMacros(meal.ingredients, mealIngredient => {
    const per100 = mealIngredient.p100 || ingredients.find(item => item.id === mealIngredient.id)?.p100;
    return per100 ? scaleMacros(per100, numberOrZero(mealIngredient.amount) / 100) : {};
  });
}
