// HandPhone: a stylised hand holding a phone (PhoneScreen inside), plus an
// index finger from the other hand that reaches in and taps the Withdraw
// button at each frame in `phone.taps`. Gently sways so it's never static.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { PHONE, PhoneScreen, PhoneScreenProps } from "./PhoneScreen";
import { shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type HandPhoneProps = ThemableProps & {
  /** Overall width in px; height is ~1.75× width. */
  width?: number;
  skinTone?: string;
  sleeveColor?: string;
  /** Props forwarded to the PhoneScreen (taps, crackAt, balance…). */
  phone?: Omit<PhoneScreenProps, "width">;
  /** Show the tapping finger. */
  showFinger?: boolean;
  /** Sway amount (degrees). */
  sway?: number;
  style?: React.CSSProperties;
};

/** 0→1→0 progress of the finger for the nearest tap. */
const fingerReach = (frame: number, taps: number[]) => {
  let best = 0;
  for (const t of taps) {
    const v = interpolate(frame, [t - 14, t, t + 5, t + 20], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    best = Math.max(best, v);
  }
  return best;
};

export const HandPhone: React.FC<HandPhoneProps> = ({
  width = 600,
  skinTone,
  sleeveColor,
  phone = {},
  showFinger = true,
  sway = 1.2,
  style,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme(themable);
  const { skinTones } = theme;
  const skin = skinTone ?? skinTones[1];
  const skinDark = shade(skin, 0.2);
  const sleeve = sleeveColor ?? "#3E6FB0";

  const W = width;
  const H = width * 1.75;
  const pw = W * 0.6;
  const s = pw / PHONE.w;
  const ph = PHONE.h * s;
  const x0 = (W - pw) / 2;
  const y0 = H * 0.03;
  const x1 = x0 + pw;
  const y1 = y0 + ph;

  const rot = Math.sin(frame / 40) * sway;
  const bob = Math.sin(frame / 32) * 6;

  // Tapping finger: fingertip travels from off-screen to the button.
  const taps = phone.taps ?? [];
  const reach = fingerReach(frame, taps);
  const bx = x0 + PHONE.button.x * s;
  const by = y0 + PHONE.button.y * s;
  const fx = interpolate(reach, [0, 1], [W + pw * 0.5, bx + pw * 0.04]);
  const fy = interpolate(reach, [0, 1], [H + ph * 0.25, by + ph * 0.02]);

  const fingerW = pw * 0.105;
  const fingerH = ph * 0.07;

  return (
    <div style={{ position: "relative", width: W, height: H, transform: `translateY(${bob}px) rotate(${rot}deg)`, transformOrigin: "50% 90%", ...style }}>
      {/* Behind the phone: sleeve, forearm, palm */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* Forearm + sleeve run far past the bottom so they always exit the frame. */}
        <path d={`M${W * 0.56},${H + 1400} L${W * 0.5},${y1 - ph * 0.14}`} stroke={skin} strokeWidth={pw * 0.52} strokeLinecap="round" />
        <path d={`M${W * 0.58},${H + 1400} L${W * 0.535},${H - ph * 0.06}`} stroke={sleeve} strokeWidth={pw * 0.66} strokeLinecap="round" />
        <path d={`M${W * 0.535 - pw * 0.33},${H - ph * 0.06} L${W * 0.535 + pw * 0.33},${H - ph * 0.06}`} stroke={shade(sleeve, 0.25)} strokeWidth={10} strokeLinecap="round" />
        <ellipse cx={W * 0.51} cy={y1 - ph * 0.15} rx={pw * 0.62} ry={ph * 0.27} fill={skin} />
      </svg>

      <div style={{ position: "absolute", left: x0, top: y0 }}>
        <PhoneScreen width={pw} {...phone} {...themable} />
      </div>

      {/* In front of the phone: thumb + wrapped fingers */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* Thumb over the left edge */}
        <path
          d={`M${x0 - pw * 0.08},${y1 - ph * 0.06} Q${x0 - pw * 0.06},${y1 - ph * 0.26} ${x0 + pw * 0.07},${y1 - ph * 0.34}`}
          stroke={skin}
          strokeWidth={pw * 0.15}
          strokeLinecap="round"
          fill="none"
        />
        <path d={`M${x0 + pw * 0.035},${y1 - ph * 0.33} l${pw * 0.04},${-ph * 0.035}`} stroke={skinDark} strokeWidth={pw * 0.04} strokeLinecap="round" opacity={0.6} />
        {/* Four fingers wrapping the right edge */}
        {[0.44, 0.35, 0.26, 0.17].map((f, i) => (
          <g key={i}>
            <rect x={x1 - pw * 0.075} y={y1 - ph * f + 4} width={pw * 0.19 - i * 6} height={fingerH} rx={fingerH / 2} fill="#000" opacity={0.18} />
            <rect x={x1 - pw * 0.085} y={y1 - ph * f} width={pw * 0.19 - i * 6} height={fingerH} rx={fingerH / 2} fill={i % 2 ? skin : shade(skin, 0.06)} />
          </g>
        ))}
      </svg>

      {/* Tapping index finger from the other hand */}
      {showFinger && reach > 0.001 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g transform={`translate(${fx} ${fy}) rotate(-28)`}>
            {/* sleeve, fist, curled knuckles, extended index finger, nail */}
            <path d={`M${pw * 0.05},${ph * 0.36} L${pw * 0.2},${ph * 2.2}`} stroke={sleeve} strokeWidth={pw * 0.42} strokeLinecap="round" />
            <rect x={-pw * 0.1} y={ph * 0.13} width={pw * 0.34} height={ph * 0.22} rx={pw * 0.1} fill={skin} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-pw * 0.13 - k * 2} y={ph * (0.17 + k * 0.055)} width={pw * 0.12} height={ph * 0.05} rx={ph * 0.025} fill={k % 2 ? skin : shade(skin, 0.08)} />
            ))}
            <path d={`M0,${ph * 0.2} L0,0`} stroke={skin} strokeWidth={fingerW * 1.15} strokeLinecap="round" />
            <ellipse cx={0} cy={fingerW * 0.12} rx={fingerW * 0.32} ry={fingerW * 0.26} fill={tint(skin, 0.25)} opacity={0.7} />          </g>
        </svg>
      ) : null}
    </div>
  );
};
