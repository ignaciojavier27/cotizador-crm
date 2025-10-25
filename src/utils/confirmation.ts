export const confirmAction = (message: string): boolean => {
  return window.confirm(message);
};

export const confirmDelete = (itemName?: string): boolean => {
  const message = itemName
    ? `¿Estás seguro de que deseas eliminar "${itemName}"?`
    : '¿Estás seguro de que deseas eliminar este elemento?';
  return window.confirm(message);
};

export const confirmDeactivate = (itemName?: string): boolean => {
  const message = itemName
    ? `¿Estás seguro de que deseas desactivar "${itemName}"?`
    : '¿Estás seguro de que deseas desactivar este elemento?';
  return window.confirm(message);
};