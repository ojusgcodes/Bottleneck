/** ₹12,00,000 → "₹12L", ₹1.5Cr etc. Indian-style short money. */
export function inrShort(n: number): string {
  if (!n) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${trim(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `₹${trim(abs / 1e5)}L`;
  return `₹${Math.round(abs).toLocaleString("en-IN")}`;
}

function trim(x: number): string {
  const s = x.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function pct(x: number, digits = 0): string {
  return `${(x * 100).toFixed(digits)}%`;
}

export function days(x: number, digits = 2): string {
  return `${x.toFixed(digits)}`;
}

export function signed(x: number, digits = 2): string {
  const s = x.toFixed(digits);
  return x > 0 ? `+${s}` : s;
}

/** Short label for a stage name that may be long ("Warehouse Pick and Pack"). */
export function shortStage(name: string, max = 12): string {
  if (name.length <= max) return name;
  const words = name.split(" ");
  if (words.length > 1) {
    const initials = words.map((w) => w[0]).join("");
    return initials.length <= 4 ? initials.toUpperCase() : name.slice(0, max - 1) + "…";
  }
  return name.slice(0, max - 1) + "…";
}
