export function formatRupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

export function calculateDiscount(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}
