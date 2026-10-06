// Tiny colour helpers so shading is derived from base colours, never hard-coded.
const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");

/** Mix two colours; t = 0 → a, 1 → b. */
export const mix = (a: string, b: string, t: number) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};
/** Darken by amount 0–1. */
export const shade = (c: string, amount: number) => mix(c, "#000000", amount);
/** Lighten by amount 0–1. */
export const tint = (c: string, amount: number) => mix(c, "#ffffff", amount);
/** Hex + alpha (0–1) → rgba() string. */
export const alpha = (c: string, a: number) => {
  const [r, g, b] = toRgb(c);
  return `rgba(${r},${g},${b},${a})`;
};
