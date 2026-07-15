import { useCallback, useState } from "react";
import { supabase } from "./supabase";
import { calcLoggedMacros, findDuplicateMeal, getHistoryDays, normalizeIngredientName, sumMacros, todayStr, validateNewHistoryDay } from "./utils";
import { DEFAULT_INGS } from "./data/defaults";
import STYLES from "./styles";
import useAuthSession from "./hooks/useAuthSession";
import useDeleteConfirmation from "./hooks/useDeleteConfirmation";
import useMacroData from "./hooks/useMacroData";
import AuthScreen from "./components/AuthScreen";
import DashboardHeader from "./components/DashboardHeader";
import AddHistoryDayModal from "./components/modals/AddHistoryDayModal";
import ConfirmDeleteModal from "./components/modals/ConfirmDeleteModal";
import EditCustomEntryModal from "./components/modals/EditCustomEntryModal";
import EditQuickEntryModal from "./components/modals/EditQuickEntryModal";
import EditServingModal from "./components/modals/EditServingModal";
import IngredientModal from "./components/modals/IngredientModal";
import LogModal from "./components/modals/LogModal";
import MealModal from "./components/modals/MealModal";
import TargetsModal from "./components/modals/TargetsModal";
import HistoryScreen from "./components/screens/HistoryScreen";
import IngredientsScreen from "./components/screens/IngredientsScreen";
import MealsScreen from "./components/screens/MealsScreen";
import TodayScreen from "./components/screens/TodayScreen";

export default function App() {
  const { session, setSession, authLoading } = useAuthSession();
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null);
  const [editMeal, setEditMeal] = useState(null);
  const [editIng, setEditIng] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingHistoryDay, setEditingHistoryDay] = useState(null);
  const [historyLogDate, setHistoryLogDate] = useState(null);
  const [editCustomEntry, setEditCustomEntry] = useState(null);
  const [editServingEntry, setEditServingEntry] = useState(null);
  const [editHistoryEntry, setEditHistoryEntry] = useState(null);
  const showToast = useCallback(ok => {
    setToast(ok ? "saved" : "error");
    setTimeout(() => setToast(null), 2000);
  }, []);
  const {
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
  } = useMacroData(session, showToast);
  const { deleteConfirmation, confirmDelete, finishDeleteConfirmation } = useDeleteConfirmation();

  const today = todayStr();
  const todayLog = log[today] || [];
  const macroIngredients = [...ingredients, ...DEFAULT_INGS.filter(fallback => !ingredients.some(item => item.id === fallback.id))];
  const entryMacros = entry => calcLoggedMacros(entry, meals, macroIngredients);
  const totals = sumMacros(todayLog, entryMacros);
  const deficit = targets.cal - totals.cal;
  const historyDayData = getHistoryDays(log, today).map(day => ({
    day,
    entries: log[day] || [],
    totals: sumMacros(log[day] || [], entryMacros),
  }));

  const handleLogEntry = async entry => {
    if (await saveLogDay(today, [...(log[today] || []), entry])) setModal(null);
  };
  const handleHistoryLogEntry = async entry => {
    const day = historyLogDate;
    if (await saveLogDay(day, [...(log[day] || []), entry])) {
      setModal(null);
      setHistoryLogDate(null);
      setEditingHistoryDay(day);
    }
  };
  const deleteLogEntry = async id => {
    const entry = (log[today] || []).find(item => item.id === id);
    if (!await confirmDelete(entry?.name || "this food entry")) return false;
    return saveLogDay(today, (log[today] || []).filter(item => item.id !== id));
  };
  const handleEditCustomEntry = async updated => {
    const entries = (log[today] || []).map(entry => entry.id === updated.id ? updated : entry);
    if (await saveLogDay(today, entries)) setEditCustomEntry(null);
  };
  const handleEditServingEntry = async updated => {
    const entries = (log[today] || []).map(entry => entry.id === updated.id ? updated : entry);
    if (await saveLogDay(today, entries)) setEditServingEntry(null);
  };
  const editTodayEntry = entry => {
    if (entry.mealId) setEditServingEntry(entry);
    else if (entry.ingredients) setEditCustomEntry(entry);
  };
  const handleEditHistoryEntry = async updated => {
    const day = editHistoryEntry.day;
    const entries = (log[day] || []).map(entry => entry.id === updated.id ? updated : entry);
    if (await saveLogDay(day, entries)) setEditHistoryEntry(null);
  };
  const handleCreateHistoryDay = async day => {
    const validationError = validateNewHistoryDay(day, today, Object.keys(log));
    if (validationError) return { ok: false, message: validationError };
    setHistoryLogDate(day);
    setModal("log");
    return { ok: true };
  };
  const handleSaveMeal = async meal => {
    const duplicateInState = findDuplicateMeal(meal, meals, ingredients);
    if (duplicateInState) {
      return { ok: false, message: `This composition is already saved as “${duplicateInState.name}”.` };
    }

    const { data: databaseMeals, error: duplicateCheckError } = await supabase
      .from("meals")
      .select("id,data")
      .eq("user_id", userId);
    if (duplicateCheckError) {
      console.error("Failed to check meal duplicates:", duplicateCheckError);
      return { ok: false, message: "Could not check saved meals. Please try again." };
    }
    const duplicateInDatabase = findDuplicateMeal(meal, (databaseMeals || []).map(row => row.data), ingredients);
    if (duplicateInDatabase) {
      return { ok: false, message: `This composition is already saved as “${duplicateInDatabase.name}”.` };
    }

    const nextMeals = editMeal ? meals.map(item => item.id === meal.id ? meal : item) : [...meals, meal];
    if (await saveMeal(meal, nextMeals)) {
      setModal(null);
      setEditMeal(null);
      return { ok: true };
    }
    return { ok: false, message: "Could not save the meal. Please try again." };
  };
  const handleSaveIng = async ingredient => {
    const normalizedName = normalizeIngredientName(ingredient.name);
    const normalizedBarcode = ingredient.barcode || null;
    const duplicateInState = ingredients.find(item => item.id !== ingredient.id && normalizeIngredientName(item.name) === normalizedName);
    if (duplicateInState) {
      return { ok: false, message: `“${duplicateInState.name}” is already in your ingredient library.` };
    }
    const barcodeInState = normalizedBarcode && ingredients.find(item => item.id !== ingredient.id && item.barcode === normalizedBarcode);
    if (barcodeInState) {
      return { ok: false, message: `Barcode ${normalizedBarcode} is already assigned to “${barcodeInState.name}”.` };
    }

    const { data: databaseIngredients, error: duplicateCheckError } = await supabase
      .from("ingredients")
      .select("id,data")
      .eq("user_id", userId);
    if (duplicateCheckError) {
      console.error("Failed to check ingredient duplicates:", duplicateCheckError);
      return { ok: false, message: "Could not check the ingredient library. Please try again." };
    }
    const duplicateInDatabase = databaseIngredients?.find(row => row.id !== ingredient.id && normalizeIngredientName(row.data?.name) === normalizedName);
    if (duplicateInDatabase) {
      return { ok: false, message: `“${duplicateInDatabase.data.name}” already exists in the database.` };
    }
    const barcodeInDatabase = normalizedBarcode && databaseIngredients?.find(row => row.id !== ingredient.id && row.data?.barcode === normalizedBarcode);
    if (barcodeInDatabase) {
      return { ok: false, message: `Barcode ${normalizedBarcode} is already assigned to “${barcodeInDatabase.data.name}”.` };
    }

    const nextIngredients = editIng ? ingredients.map(item => item.id === ingredient.id ? ingredient : item) : [...ingredients, ingredient];
    if (await saveIngredient(ingredient, nextIngredients)) {
      setModal(null);
      setEditIng(null);
      return { ok: true };
    }
    return { ok: false, message: "Could not save the ingredient. Please try again." };
  };
  const deleteMeal = async id => {
    const meal = meals.find(item => item.id === id);
    if (!await confirmDelete(meal?.name || "this meal")) return false;
    const { error } = await supabase.from("meals").delete().eq("id", id).eq("user_id", userId);
    if (error) return mutationFailed("Failed to delete meal", error);
    setMeals(previous => previous.filter(meal => meal.id !== id));
    showToast(true);
  };
  const deleteIng = async id => {
    const ingredient = ingredients.find(item => item.id === id);
    if (!await confirmDelete(ingredient?.name || "this ingredient")) return false;
    const { error } = await supabase.from("ingredients").delete().eq("id", id).eq("user_id", userId);
    if (error) return mutationFailed("Failed to delete ingredient", error);
    setIngredients(previous => previous.filter(ingredient => ingredient.id !== id));
    showToast(true);
  };
  const handleSaveTargets = async nextTargets => {
    if (await saveTargets(nextTargets)) setModal(null);
  };

  if (authLoading) return <div style={{ background: "#080c0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5e4b", fontFamily: "sans-serif" }}>Loading…</div>;
  if (!session) return <AuthScreen onAuth={setSession} />;
  if (loading) return <div style={{ background: "#080c0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5e4b", fontFamily: "sans-serif" }}>Loading your data…</div>;
  if (loadError) return <div style={{ background: "#080c0a", minHeight: "100vh", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", justifyContent: "center", color: "#ff6b6b", fontFamily: "sans-serif", padding: 24, textAlign: "center" }}><div>Could not load your data.</div><div style={{ color: "#4a5e4b", fontSize: 12 }}>{loadError}</div><button className="btn btn-ghost" onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <>
      <style>{STYLES}</style>
      {toast && <div className={`toast ${toast === "saved" ? "toast-ok" : "toast-err"}`}>{toast === "saved" ? "💾 Saved" : "⚠️ Save failed"}</div>}
      <div className="app">
        <DashboardHeader
          today={today}
          totals={totals}
          targets={targets}
          deficit={deficit}
          tab={tab}
          historyDayData={historyDayData}
          onSelectHistoryDay={setEditingHistoryDay}
          onTabChange={setTab}
          onOpenTargets={() => setModal("targets")}
          onSignOut={() => supabase.auth.signOut()}
        />

        <div className="content" onClick={() => setEditingHistoryDay(null)}>
          {tab === "today" && <TodayScreen entries={todayLog} getMacros={entryMacros} onAdd={() => setModal("log")} onEdit={editTodayEntry} onDelete={deleteLogEntry} />}
          {tab === "meals" && <MealsScreen meals={meals} macroIngredients={macroIngredients} onEdit={meal => { setEditMeal(meal); setModal("meal"); }} onDelete={deleteMeal} />}
          {tab === "ingredients" && <IngredientsScreen ingredients={ingredients} onEdit={ingredient => { setEditIng(ingredient); setModal("ingredient"); }} onDelete={deleteIng} />}
          {tab === "history" && <HistoryScreen dayData={historyDayData} today={today} targets={targets} getMacros={entryMacros} editingDay={editingHistoryDay} onEditingDayChange={setEditingHistoryDay} confirmDelete={confirmDelete} saveLogDay={saveLogDay} onAddFood={day => { setHistoryLogDate(day); setModal("log"); }} onEditEntry={(day, entry) => setEditHistoryEntry({ day, entry })} />}
        </div>

        {tab === "today"       && <button className="fab" onClick={() => setModal("log")}>+</button>}
        {tab === "meals"       && <button className="fab" onClick={() => { setEditMeal(null); setModal("meal"); }}>+</button>}
        {tab === "ingredients" && <button className="fab" onClick={() => { setEditIng(null); setModal("ingredient"); }}>+</button>}
        {tab === "history"     && <button className="fab" aria-label="Add history day" onClick={() => setModal("history-day")}>+</button>}

        {editCustomEntry && <EditCustomEntryModal entry={editCustomEntry} ingredients={ingredients} confirmDelete={confirmDelete} onSave={handleEditCustomEntry} onClose={() => setEditCustomEntry(null)} />}
        {editServingEntry && <EditServingModal entry={editServingEntry} meal={meals.find(item => item.id === editServingEntry.mealId)} ingredients={macroIngredients} onSave={handleEditServingEntry} onClose={() => setEditServingEntry(null)} />}
        {editHistoryEntry?.entry?.mealId && <EditServingModal entry={editHistoryEntry.entry} meal={meals.find(item => item.id === editHistoryEntry.entry.mealId)} ingredients={macroIngredients} onSave={handleEditHistoryEntry} onClose={() => setEditHistoryEntry(null)} />}
        {editHistoryEntry?.entry?.ingredients && <EditCustomEntryModal entry={editHistoryEntry.entry} ingredients={ingredients} confirmDelete={confirmDelete} onSave={handleEditHistoryEntry} onClose={() => setEditHistoryEntry(null)} />}
        {editHistoryEntry?.entry && !editHistoryEntry.entry.mealId && !editHistoryEntry.entry.ingredients && <EditQuickEntryModal entry={editHistoryEntry.entry} onSave={handleEditHistoryEntry} onClose={() => setEditHistoryEntry(null)} />}
        {modal === "log"        && <LogModal meals={meals} ingredients={ingredients} confirmDelete={confirmDelete} onSave={historyLogDate ? handleHistoryLogEntry : handleLogEntry} onClose={() => { setModal(null); setHistoryLogDate(null); }} />}
        {modal === "meal"       && <MealModal allIngredients={ingredients} existing={editMeal} confirmDelete={confirmDelete} onSave={handleSaveMeal} onClose={() => { setModal(null); setEditMeal(null); }} />}
        {modal === "ingredient" && <IngredientModal existing={editIng} onSave={handleSaveIng} onClose={() => { setModal(null); setEditIng(null); }} />}
        {modal === "targets"    && <TargetsModal targets={targets} onSave={handleSaveTargets} onClose={() => setModal(null)} />}
        {modal === "history-day" && <AddHistoryDayModal today={today} existingDays={historyDayData.map(item => item.day)} onSave={handleCreateHistoryDay} onClose={() => setModal(null)} />}
        {deleteConfirmation && <ConfirmDeleteModal name={deleteConfirmation.name} onCancel={() => finishDeleteConfirmation(false)} onConfirm={() => finishDeleteConfirmation(true)} />}
      </div>
    </>
  );
}
