const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-500',
    SELLER: 'bg-blue-500',
  };
  return colors[role] || 'bg-gray-500';
};

const getStatusBadgeColor = (isActive: boolean): string => {
  return isActive ? 'bg-green-500' : 'bg-gray-500';
};

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    seller: 'Vendedor',
  };
  return labels[role] || role;
};

const getStatusLabel = (isActive: boolean): string => {
  return isActive ? 'Activo' : 'Inactivo';
};

const formatUserDate = (date: string, locale: string = 'es-CL'): string => {
  return new Date(date).toLocaleDateString(locale);
};

export {
  getRoleBadgeColor,
  getStatusBadgeColor,
  getRoleLabel,
  getStatusLabel,
  formatUserDate,
};