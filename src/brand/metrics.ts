// Anton glyph metrics (advance widths in em, from the font file), so brand
// layouts can size the wordmark without measuring text in a browser. This
// keeps BrandLogo a pure SVG that renders identically in video and in the
// exported logo files. Unknown characters fall back to an average width.
const ANTON_ADVANCE: Record<string, number> = {
  "0": 0.4941, "1": 0.3306, "2": 0.4941, "3": 0.4941, "4": 0.4941, "5": 0.4941, "6": 0.4941, "7": 0.4941, "8": 0.4941, "9": 0.4941,
  A: 0.4854, B: 0.4785, C: 0.4741, D: 0.4932, E: 0.4116, F: 0.3989, G: 0.4849, H: 0.499, I: 0.2266, J: 0.4663, K: 0.4722, L: 0.3975, M: 0.7461,
  N: 0.498, O: 0.4863, P: 0.4722, Q: 0.4937, R: 0.4766, S: 0.4614, T: 0.3955, U: 0.4736, V: 0.4692, W: 0.7119, X: 0.4839, Y: 0.4463, Z: 0.4102,
  " ": 0.2344, "’": 0.2319, ".": 0.2285, ",": 0.2363, "!": 0.229, "?": 0.4922, "&": 0.52, "-": 0.311, "#": 0.5464, "@": 0.8643, ":": 0.2417,
};

/** Anton cap height in em. */
export const ANTON_CAP = 0.8594;

/** Rendered width (px) of `text` in Anton at `size`, with `tracking` px between letters. */
export const antonWidth = (text: string, size: number, tracking = 0) => {
  const chars = Array.from(text.toUpperCase());
  const adv = chars.reduce((sum, c) => sum + (ANTON_ADVANCE[c] ?? 0.47), 0);
  return adv * size + tracking * Math.max(0, chars.length - 1);
};
