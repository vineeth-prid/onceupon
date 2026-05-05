/**
 * INR currency formatting helpers. Pricing values throughout the app are
 * stored as whole-rupee integers (matching pricing.json on the backend),
 * so these helpers operate on those rupee integers — no paise conversion.
 */

const INR = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Render a rupee value with the ₹ symbol — e.g. `499` → `"₹499"`. */
export function formatINR(rupees: number): string {
  if (!Number.isFinite(rupees)) return '₹—0';
  return `₹${INR.format(Math.round(rupees))}`;
}
