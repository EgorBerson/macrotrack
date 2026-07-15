export default function IngredientsScreen({ ingredients, onEdit, onDelete }) {
  return (
    <>
      <div className="sec-hdr"><span className="sec-title">Ingredient Library</span></div>
      {ingredients.length === 0 && <div className="empty"><div className="empty-text">No ingredients yet.</div></div>}
      {ingredients.map(ingredient => (
        <div key={ingredient.id} className="log-entry editable-entry" onClick={() => onEdit(ingredient)}>
          <div>
            <div className="entry-name">{ingredient.name}</div>
            <div className="entry-macros">per 100g · P {ingredient.p100.protein}g · C {ingredient.p100.carbs}g · F {ingredient.p100.fat}g</div>
            {ingredient.barcode && <div className="entry-macros">barcode · {ingredient.barcode}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="entry-cal">{ingredient.p100.cal}</span>
            <button className="del-btn" aria-label={`Delete ${ingredient.name}`} onClick={event => { event.stopPropagation(); onDelete(ingredient.id); }}>✕</button>
          </div>
        </div>
      ))}
    </>
  );
}
