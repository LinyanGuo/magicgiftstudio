export default function Price({ cents, currency = "CAD" }: { cents: number | null; currency?: string }) {
  if (cents == null) return <span>—</span>;
  const value = cents / 100;
  const formatted = new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(value);
  return <span aria-label="price">{formatted}</span>;
}
