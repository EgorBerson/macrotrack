import { calcMealMacros } from "../../utils";

export default function MealsScreen({ meals, macroIngredients, onEdit, onDelete }) {
  return (
    <>
      <div className="sec-hdr"><span className="sec-title">Saved Meals</span></div>
      {meals.length === 0 && <div className="empty"><div className="empty-text">No meals yet.</div></div>}
      {meals.map(meal => {
        const macros = calcMealMacros(meal, macroIngredients);
        return (
          <div key={meal.id} className="meal-card" onClick={() => onEdit(meal)}>
            <div style={{ flex: 1 }}>
              <div className="meal-card-name">{meal.name}</div>
              <div className="meal-card-macros">P {macros.protein}g · C {macros.carbs}g · F {macros.fat}g</div>
              {meal.ingredients?.length > 0 && <div style={{ marginTop: 6 }}>{meal.ingredients.map(ingredient => <span key={ingredient.id} className="tag">{ingredient.name} {ingredient.amount}g</span>)}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <span className="meal-card-cal">{macros.cal}</span>
              <button className="del-btn" onClick={event => { event.stopPropagation(); onDelete(meal.id); }}>✕</button>
            </div>
          </div>
        );
      })}
    </>
  );
}
