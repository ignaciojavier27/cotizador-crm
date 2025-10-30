export const getStatusBadgeColor = (isActive: boolean) =>
    isActive
      ? 'bg-green-100 text-green-800 hover:bg-green-100'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-100';
