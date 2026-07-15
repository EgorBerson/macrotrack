import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { DEFAULT_INGS, DEFAULT_MEALS } from "../data/defaults";

const DEFAULT_TARGETS = { cal: 1673, protein: 150, carbs: 155, fat: 50 };

export default function useMacroData(session, showToast) {
  const [ingredients, setIngredients] = useState([]);
  const [meals, setMeals] = useState([]);
  const [log, setLog] = useState({});
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [ingredientResult, mealResult, logResult, targetResult] = await Promise.all([
          supabase.from("ingredients").select("*").eq("user_id", userId),
          supabase.from("meals").select("*").eq("user_id", userId),
          supabase.from("food_log").select("*").eq("user_id", userId),
          supabase.from("targets").select("*").eq("user_id", userId).maybeSingle(),
        ]);
        const fetchError = ingredientResult.error || mealResult.error || logResult.error || targetResult.error;
        if (fetchError) throw fetchError;

        const nextIngredients = ingredientResult.data?.length ? ingredientResult.data.map(row => row.data) : DEFAULT_INGS;
        const nextMeals = mealResult.data?.length ? mealResult.data.map(row => row.data) : DEFAULT_MEALS;
        const nextLog = {};
        (logResult.data || []).forEach(row => { nextLog[row.id] = row.data || []; });

        if (!active) return;
        setIngredients(nextIngredients);
        setMeals(nextMeals);
        setLog(nextLog);
        if (targetResult.data) setTargets(targetResult.data.data);
      } catch (error) {
        console.error("Failed to load user data:", error);
        if (active) setLoadError(error?.message || "Could not load your data.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  // Token refreshes replace the session object. Reloading all data for each
  // refresh made the application appear to stop after being idle.
  }, [userId]);

  const mutationFailed = (context, error) => {
    console.error(`${context}:`, error);
    showToast(false);
    return false;
  };

  const saveIngredient = async (ingredient, nextIngredients) => {
    const { error } = await supabase.from("ingredients").upsert({ id: ingredient.id, user_id: userId, data: ingredient }, { onConflict: "user_id,id" });
    if (error) return mutationFailed("Failed to save ingredient", error);
    setIngredients(nextIngredients);
    showToast(true);
    return true;
  };

  const saveMeal = async (meal, nextMeals) => {
    const { error } = await supabase.from("meals").upsert({ id: meal.id, user_id: userId, data: meal }, { onConflict: "user_id,id" });
    if (error) return mutationFailed("Failed to save meal", error);
    setMeals(nextMeals);
    showToast(true);
    return true;
  };

  const saveLogDay = async (day, entries) => {
    const { error } = entries.length
      ? await supabase.from("food_log").upsert({ id: day, user_id: userId, data: entries }, { onConflict: "user_id,id" })
      : await supabase.from("food_log").delete().eq("id", day).eq("user_id", userId);
    if (error) return mutationFailed("Failed to save food log", error);
    setLog(previous => {
      const next = { ...previous };
      if (entries.length) next[day] = entries;
      else delete next[day];
      return next;
    });
    showToast(true);
    return true;
  };

  const saveTargets = async values => {
    const normalized = {
      cal: +values.cal || 0,
      protein: +values.protein || 0,
      carbs: +values.carbs || 0,
      fat: +values.fat || 0,
    };
    const { error } = await supabase.from("targets").upsert({ user_id: userId, data: normalized }, { onConflict: "user_id" });
    if (error) return mutationFailed("Failed to save targets", error);
    setTargets(normalized);
    showToast(true);
    return true;
  };

  return {
    ingredients,
    setIngredients,
    meals,
    setMeals,
    log,
    targets,
    loading,
    loadError,
    userId,
    mutationFailed,
    saveIngredient,
    saveMeal,
    saveLogDay,
    saveTargets,
  };
}
