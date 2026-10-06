export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export function orderStatusClass(status: string): string {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-orange-100 text-orange-800';
  }
}
