export default function ConfirmDeleteModal({ name, onCancel, onConfirm }) {
  return (
    <div className="overlay confirm-overlay" style={{ zIndex: 700 }} onClick={onCancel}>
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title" onClick={event => event.stopPropagation()}>
        <div id="delete-confirm-title" className="modal-title confirm-title">Delete item?</div>
        <div className="confirm-copy">
          Are you sure you want to delete <span className="confirm-name">“{name}”</span>? This action cannot be undone.
        </div>
        <div className="modal-actions">
          <button className="btn confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn confirm-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
