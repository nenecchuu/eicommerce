export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: "Menunggu Pembayaran",
    paid: "Sudah Dibayar",
    shipped: "Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: "text-yellow-600 bg-yellow-50",
    paid: "text-blue-600 bg-blue-50",
    shipped: "text-purple-600 bg-purple-50",
    completed: "text-green-600 bg-green-50",
    cancelled: "text-red-600 bg-red-50",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
}
