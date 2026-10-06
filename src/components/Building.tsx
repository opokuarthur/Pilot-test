// Building: simple geometric office building in two variants.
//   "upscale" — tall glass-and-gold office (think gold dealer HQ)
//   "rural"   — small single-storey office with corrugated roof
// Metal roller shutters slide down over the doors/windows at `shutterAt`
// with a heavy bounce. `fail` (0–1) desaturates it.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type BuildingProps = ThemableProps & {
  variant?: "upscale" | "rural";
  /** Rendered width in px (height = width × 7/6). */
  width?: number;
  /** Frame shutters start dropping (undefined = open). */
  shutterAt?: number;
  /** Stagger between individual shutters. */
  shutterStagger?: number;
  /** Text on the sign (keep it generic; empty = abstract icon only). */
  signText?: string;
  wallColor?: string;
  /** Show a red CLOSED sign once shutters are down. */
  closedSign?: boolean;
  fail?: number;
};

type Opening = { x: number; y: number; w: number; h: number; kind: "glass" | "door" | "window" };

const Shutter: React.FC<{ o: Opening; p: number; color: string }> = ({ o, p, color }) => {
  const h = o.h * Math.max(0, p);
  const ridges = Math.floor(h / 14);
  return (
    <g>
      <rect x={o.x - 6} y={o.y - 16} width={o.w + 12} height={18} rx={4} fill={shade(color, 0.35)} />
      {h > 0 ? (
        <g>
          <rect x={o.x} y={o.y} width={o.w} height={h} fill={color} />
          {Array.from({ length: ridges }, (_, i) => (
            <line key={i} x1={o.x} x2={o.x + o.w} y1={o.y + 14 * (i + 1)} y2={o.y + 14 * (i + 1)} stroke={shade(color, 0.25)} strokeWidth={3} />
          ))}
          <rect x={o.x} y={o.y + h - 8} width={o.w} height={8} fill={shade(color, 0.4)} />
        </g>
      ) : null}
    </g>
  );
};

export const Building: React.FC<BuildingProps> = ({
  variant = "upscale",
  width = 600,
  shutterAt,
  shutterStagger = 4,
  signText = "",
  wallColor,
  closedSign = false,
  fail = 0,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const metal = colors.grey;
  const shutterP = (i: number) =>
    shutterAt === undefined ? 0 : spring({ frame: frame - shutterAt - i * shutterStagger, fps, config: { damping: 11, mass: 0.7, stiffness: 140 } });
  const closedIn = shutterAt === undefined ? 0 : interpolate(frame, [shutterAt + 18, shutterAt + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Glass glint sweeps across every ~4s.
  const glint = ((frame % 120) / 120) * 900 - 200;

  let body: React.ReactNode;
  let openings: Opening[] = [];

  if (variant === "upscale") {
    const wall = wallColor ?? "#23365F";
    openings = [
      { x: 230, y: 520, w: 140, h: 160, kind: "door" },
      { x: 92, y: 530, w: 110, h: 120, kind: "glass" },
      { x: 398, y: 530, w: 110, h: 120, kind: "glass" },
    ];
    const windows: React.ReactNode[] = [];
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        windows.push(<rect key={`${r}${c}`} x={92 + c * 108} y={170 + r * 82} width={92} height={62} rx={4} fill={tint(wall, 0.18)} />);
    body = (
      <g>
        <rect x={60} y={120} width={480} height={570} fill={wall} />
        <rect x={60} y={120} width={480} height={570} fill={`url(#shade${uid})`} />
        <rect x={44} y={96} width={512} height={30} rx={6} fill={colors.gold} />
        <rect x={80} y={70} width={440} height={30} rx={6} fill={shade(colors.gold, 0.15)} />
        <g clipPath={`url(#glass${uid})`}>
          {windows}
          <rect x={glint} y={100} width={60} height={420} fill="#fff" opacity={0.12} transform={`skewX(-20)`} />
        </g>
        {/* Gold columns */}
        {[60, 210, 376, 516].map((x) => (
          <rect key={x} x={x} y={480} width={24} height={210} fill={colors.gold} />
        ))}
        <rect x={44} y={470} width={512} height={20} fill={colors.gold} />
        {/* Sign: abstract stacked gold bars */}
        <g transform="translate(300 438)">
          <rect x={-120} y={-28} width={240} height={50} rx={10} fill={colors.ink} stroke={colors.gold} strokeWidth={4} />
          {signText ? (
            <text textAnchor="middle" y={12} fontFamily={fonts.headline} fontSize={34} fill={colors.gold} letterSpacing={3}>
              {signText}
            </text>
          ) : (
            <g fill={colors.gold}>
              <path d="M-40,12 l8,-16 h28 l8,16 z" />
              <path d="M2,12 l8,-16 h28 l8,16 z" />
              <path d="M-19,-6 l8,-14 h28 l8,14 z" />
            </g>
          )}
        </g>
        {/* Openings (glass) */}
        {openings.map((o, i) => (
          <rect key={i} x={o.x} y={o.y} width={o.w} height={o.h} fill={o.kind === "door" ? tint(wall, 0.3) : tint(wall, 0.22)} stroke={colors.gold} strokeWidth={5} />
        ))}
        <line x1={300} x2={300} y1={520} y2={680} stroke={colors.gold} strokeWidth={4} />
        {/* Steps */}
        <rect x={190} y={680} width={220} height={12} fill={tint(wall, 0.35)} />
        <rect x={170} y={690} width={260} height={10} fill={tint(wall, 0.25)} />
      </g>
    );
  } else {
    const wall = wallColor ?? "#D9B98A";
    openings = [
      { x: 255, y: 520, w: 90, h: 165, kind: "door" },
      { x: 130, y: 530, w: 80, h: 70, kind: "window" },
      { x: 390, y: 530, w: 80, h: 70, kind: "window" },
    ];
    body = (
      <g>
        <rect x={90} y={440} width={420} height={250} fill={wall} />
        <rect x={90} y={630} width={420} height={60} fill={shade(colors.red, 0.35)} />
        {/* Corrugated roof */}
        <path d="M60,450 L120,370 H480 L540,450 Z" fill={tint(metal, 0.1)} />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={80 + i * 28} y1={448} x2={124 + i * 23.4} y2={372} stroke={shade(metal, 0.2)} strokeWidth={3} />
        ))}
        <rect x={56} y={446} width={488} height={10} fill={shade(metal, 0.3)} />
        {/* Sign board */}
        <g transform="translate(300 480)">
          <rect x={-110} y={-24} width={220} height={44} rx={4} fill={colors.cream} stroke={shade(wall, 0.5)} strokeWidth={4} />
          {signText ? (
            <text textAnchor="middle" y={11} fontFamily={fonts.headline} fontSize={30} fill={colors.navy} letterSpacing={2}>
              {signText}
            </text>
          ) : (
            <g fill={colors.navy}>
              <rect x={-60} y={-8} width={120} height={8} rx={4} />
            </g>
          )}
        </g>
        {openings.map((o, i) => (
          <g key={i}>
            <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={o.kind === "door" ? "#6B3E1F" : "#2A3550"} stroke={shade(wall, 0.45)} strokeWidth={5} />
            {o.kind === "window" ? <line x1={o.x + o.w / 2} x2={o.x + o.w / 2} y1={o.y} y2={o.y + o.h} stroke={shade(wall, 0.45)} strokeWidth={4} /> : null}
          </g>
        ))}
        {/* Bench */}
        <rect x={420} y={650} width={80} height={10} rx={3} fill="#6B3E1F" />
        <rect x={428} y={660} width={6} height={28} fill="#4A2A14" />
        <rect x={486} y={660} width={6} height={28} fill="#4A2A14" />
      </g>
    );
  }

  return (
    <svg width={width} height={(width * 7) / 6} viewBox="0 0 600 700" style={{ overflow: "visible", filter: fail > 0 ? `grayscale(${fail}) brightness(${1 - 0.15 * fail})` : undefined }}>
      <defs>
        <linearGradient id={`shade${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.06} />
          <stop offset="0.6" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.22} />
        </linearGradient>
        <clipPath id={`glass${uid}`}>
          <rect x={60} y={150} width={480} height={330} />
        </clipPath>
      </defs>
      <ellipse cx={300} cy={700} rx={300} ry={18} fill="#000" opacity={0.2} />
      {body}
      {openings.map((o, i) => (
        <Shutter key={i} o={o} p={shutterP(i)} color={metal} />
      ))}
      {closedSign && closedIn > 0 ? (
        <g transform={`translate(${openings[0].x + openings[0].w / 2} ${openings[0].y + 70}) rotate(-8) scale(${0.6 + 0.4 * closedIn})`} opacity={closedIn}>
          <rect x={-70} y={-24} width={140} height={48} rx={6} fill={colors.red} />
          <text textAnchor="middle" y={13} fontFamily={fonts.headline} fontSize={34} fill={colors.cream} letterSpacing={2}>
            CLOSED
          </text>
        </g>
      ) : null}
    </svg>
  );
};
