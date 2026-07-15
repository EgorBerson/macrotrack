import { useState } from "react";

export default function useDeleteConfirmation() {
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const confirmDelete = name => new Promise(resolve => {
    setDeleteConfirmation({ name, resolve });
  });

  const finishDeleteConfirmation = confirmed => {
    const current = deleteConfirmation;
    setDeleteConfirmation(null);
    current?.resolve(confirmed);
  };

  return { deleteConfirmation, confirmDelete, finishDeleteConfirmation };
}
