// BrandIcon: the LET’S UNFOLD mark, a sheet of cream paper folded into
// thirds (letter fold), drawn as pure SVG so it also exports as a file.
//   variant "closed" — fully folded: the top third lies over the rest
//           "half"   — partly open: top and bottom thirds tilt toward you
//           "open"   — a flat sheet with the two gold crease lines
// `fold` overrides the variant with exact panel angles in degrees
// (0 = flat, 180 = folded over the middle third), which is what LogoSting
// animates. The panels are projected in real 3D (slight perspective), with
// crisp gold creases, soft shadows inside the folds and a subtle grain.
// No Remotion hooks: safe to render statically (brand exports).
import React from "react";
import { BRAND } from "./config";
import { mix } from "../lib/color";

export type BrandIconVariant = "closed" | "half" | "open";

export type BrandIconProps = {
  /** Rendered width/height in px (the icon is drawn in a square box). */
  size?: number;
  variant?: BrandIconVariant;
  /** Exact panel angles in degrees; overrides `variant`. */
  fold?: { top: number; bottom: number };
  /** Gold initial on the front panel. */
  showU?: boolean;
  /** "front": on whichever face is in front; "outside": only on the outer face of the folded sheet. */
  uPlacement?: "front" | "outside";
  /** 0–1: glow on the gold crease lines. */
  creaseGlow?: number;
  /** Soft drop shadow under the paper. */
  shadow?: boolean;
  /** Paper grain strength 0–1 (0 = off). */
  grain?: number;
  style?: React.CSSProperties;
};

export const FOLDS: Record<BrandIconVariant, { top: number; bottom: number }> = {
  closed: { top: 180, bottom: 180 },
  half: { top: 64, bottom: 50 },
  open: { top: 0, bottom: 0 },
};

// Sheet geometry in a 200×200 box: three 48-unit panels, 120 wide.
const W = 120;
const P = 48;
const X0 = 100 - W / 2;
const X1 = 100 + W / 2;
const HINGE_TOP = 100 - P / 2;
const HINGE_BOTTOM = 100 + P / 2;
const FOCAL = 330;

type Pt = [number, number];
const project = (x: number, y: number, z: number): Pt => {
  const s = FOCAL / (FOCAL - z);
  return [100 + (x - 100) * s, 100 + (y - 100) * s];
};
const poly = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
const rad = (d: number) => (d * Math.PI) / 180;

/** Projected outline of the sheet's free edges for given panel angles. */
const sheetCorners = (top: number, bottom: number): Pt[] => {
  const bEdge = { y: HINGE_BOTTOM + P * Math.cos(rad(bottom)), z: P * Math.sin(rad(bottom)) + 0.6 * (bottom / 180) };
  const tEdge = { y: HINGE_TOP - P * Math.cos(rad(top)), z: P * Math.sin(rad(top)) + 1.2 * (top / 180) };
  return [
    project(X0, HINGE_TOP, 0), project(X1, HINGE_TOP, 0), project(X0, HINGE_BOTTOM, 0), project(X1, HINGE_BOTTOM, 0),
    project(X0, tEdge.y, tEdge.z), project(X1, tEdge.y, tEdge.z), project(X0, bEdge.y, bEdge.z), project(X1, bEdge.y, bEdge.z),
  ];
};

/** Visible paper bounds inside the icon's 200-unit box, for layout (crop the empty margins). */
export const iconExtent = (variant: BrandIconVariant = "half") => {
  const pts = sheetCorners(FOLDS[variant].top, FOLDS[variant].bottom);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};

export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 200,
  variant = "half",
  fold,
  showU = false,
  uPlacement = "front",
  creaseGlow = 0,
  shadow = true,
  grain = 1,
  style,
}) => {
  const { cream, gold, navy } = BRAND.colors;
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const f = fold ?? FOLDS[variant];
  // Slightly negative angles = a flap swinging just past flat (sting overshoot).
  const t = Math.min(180, Math.max(-15, f.top));
  const b = Math.min(180, Math.max(-15, f.bottom));

  // Free edges of the outer thirds (they swing toward the viewer, z > 0).
  // The top third sits a hair in front so it always lies over the bottom one.
  const bEdge = { y: HINGE_BOTTOM + P * Math.cos(rad(b)), z: P * Math.sin(rad(b)) + 0.6 * (b / 180) };
  const tEdge = { y: HINGE_TOP - P * Math.cos(rad(t)), z: P * Math.sin(rad(t)) + 1.2 * (t / 180) };

  const middle: Pt[] = [project(X0, HINGE_TOP, 0), project(X1, HINGE_TOP, 0), project(X1, HINGE_BOTTOM, 0), project(X0, HINGE_BOTTOM, 0)];
  const bottom: Pt[] = [project(X0, HINGE_BOTTOM, 0), project(X1, HINGE_BOTTOM, 0), project(X1, bEdge.y, bEdge.z), project(X0, bEdge.y, bEdge.z)];
  const top: Pt[] = [project(X0, HINGE_TOP, 0), project(X1, HINGE_TOP, 0), project(X1, tEdge.y, tEdge.z), project(X0, tEdge.y, tEdge.z)];

  // Face shading: inside faces darken as they tilt; outer faces (past 90°) are the paper's back.
  const paperBack = mix(cream, "#D9CDB8", 0.35);
  const topFill = t <= 90 ? mix(cream, "#BFB29C", 0.55 * Math.abs(Math.sin(rad(t)))) : mix(cream, paperBack, Math.max(0, Math.sin(rad(t))) * 0.6);
  const bottomFill = b <= 90 ? mix(cream, "#CFC3AE", 0.35 * Math.abs(Math.sin(rad(b)))) : mix(paperBack, "#C9BDA6", Math.sin(rad(b)) * 0.5);
  const topShadow = Math.abs(Math.sin(rad(Math.min(t, 179))));
  const bottomShadow = Math.abs(Math.sin(rad(Math.min(b, 179))));

  // Projected y of the outer thirds' free edges (for in-fold shadow gradients).
  const tEdgeY = project(100, tEdge.y, tEdge.z)[1];
  const bEdgeY = project(100, bEdge.y, bEdge.z)[1];

  const creaseW = 2.4;
  const showTopCrease = t < 179.5;
  const showBottomCrease = b < 179.5;

  // The "U": on the outer face of the top third when that lies in front,
  // otherwise on the middle third.
  const uOnTop = t > 90;
  const uScaleY = uOnTop ? Math.max(0, -Math.cos(rad(t))) : 1;
  const uCenterY = uOnTop ? (top[0][1] + top[3][1]) / 2 : 100;
  const uSize = 40;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", ...style }}>
      <defs>
        <filter id={`grain${uid}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={7} result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.16  0.7 0.7 0.7 0 -0.95" result="specks" />
          <feComposite in="specks" in2="SourceAlpha" operator="in" result="clipped" />
          <feComponentTransfer in="clipped" result="soft">
            <feFuncA type="linear" slope={0.22 * grain} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="soft" />
          </feMerge>
        </filter>
        <filter id={`shadow${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={5} />
          <feOffset dx={2} dy={6} result="blur" />
          <feFlood floodColor="#000" floodOpacity={0.35} />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`glow${uid}`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation={2.2 + 3 * creaseGlow} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Shadows inside the folds, strongest at the creases */}
        <linearGradient id={`midTop${uid}`} x1="0" y1={HINGE_TOP} x2="0" y2={HINGE_TOP + 18} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={navy} stopOpacity={0.32 * topShadow} />
          <stop offset="1" stopColor={navy} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`midBot${uid}`} x1="0" y1={HINGE_BOTTOM} x2="0" y2={HINGE_BOTTOM - 18} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={navy} stopOpacity={0.26 * bottomShadow} />
          <stop offset="1" stopColor={navy} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`topIn${uid}`} x1="0" y1={HINGE_TOP} x2="0" y2={tEdgeY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={navy} stopOpacity={0.3 * topShadow} />
          <stop offset="0.6" stopColor={navy} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`botIn${uid}`} x1="0" y1={HINGE_BOTTOM} x2="0" y2={bEdgeY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={navy} stopOpacity={0.22 * bottomShadow} />
          <stop offset="0.6" stopColor={navy} stopOpacity={0} />
        </linearGradient>
      </defs>

      <g filter={shadow ? `url(#shadow${uid})` : undefined}>
        <g filter={grain > 0 ? `url(#grain${uid})` : undefined}>
          {/* Middle third (+ fold shadows) */}
          <polygon points={poly(middle)} fill={cream} />
          {t > 0.5 && t < 179.5 ? <rect x={X0} y={HINGE_TOP} width={W} height={18} fill={`url(#midTop${uid})`} /> : null}
          {b > 0.5 && b < 179.5 ? <rect x={X0} y={HINGE_BOTTOM - 18} width={W} height={18} fill={`url(#midBot${uid})`} /> : null}
          {/* Bottom third */}
          <polygon points={poly(bottom)} fill={bottomFill} />
          {b > 0.5 && b < 90 ? <polygon points={poly(bottom)} fill={`url(#botIn${uid})`} /> : null}
          {/* Top third (lies over everything when folded) */}
          <polygon points={poly(top)} fill={topFill} />
          {t > 0.5 && t < 90 ? <polygon points={poly(top)} fill={`url(#topIn${uid})`} /> : null}
          {/* Edge lines where folded layers stack (closed look) */}
          {t > 150 ? <line x1={top[3][0]} y1={top[3][1] + 1.6} x2={top[2][0]} y2={top[2][1] + 1.6} stroke={mix(cream, "#B9AC95", 0.8)} strokeWidth={1.2} /> : null}
        </g>
        {/* Gold creases */}
        <g filter={creaseGlow > 0.01 ? `url(#glow${uid})` : undefined} strokeLinecap="round">
          {showTopCrease || t >= 179.5 ? (
            <line x1={middle[0][0]} y1={middle[0][1]} x2={middle[1][0]} y2={middle[1][1]} stroke={gold} strokeWidth={creaseW + creaseGlow * 1.2} />
          ) : null}
          {showBottomCrease || b >= 179.5 ? (
            <line x1={middle[3][0]} y1={middle[3][1]} x2={middle[2][0]} y2={middle[2][1]} stroke={gold} strokeWidth={creaseW + creaseGlow * 1.2} />
          ) : null}
        </g>
        {/* Gold initial */}
        {showU && uScaleY > 0.02 && (uOnTop || uPlacement === "front") ? (
          <g transform={`translate(100 ${uCenterY}) scale(1 ${uScaleY})`}>
            <text
              data-outline="1"
              x={0}
              y={uSize * 0.36}
              textAnchor="middle"
              fontFamily={BRAND.fonts.headline}
              fontSize={uSize}
              fill={gold}
            >
              {BRAND.initial}
            </text>
          </g>
        ) : null}
      </g>
    </svg>
  );
};
