// PhoneScreen: a believable (but generic, logo-free) investment-app UI drawn
// entirely in code. Features:
//   • balance that can count up (e.g. 500 → 2,000)
//   • Withdraw button with press + ripple at each frame in `taps`
//   • after the first tap: looping "Pending..." spinner on the button and a
//     status sheet; later taps shake the sheet
//   • optional screen crack (+ flash + shake) at `crackAt`
//   • optional desaturation (`failAt`) — the "scam failed" look
// Designed at a fixed 380×780 "device" size and scaled to `width`.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { failFilter } from "../lib/motion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

/** Device geometry (device units). Exported so wrappers can aim at the button. */
export const PHONE = {
  w: 380,
  h: 780,
  bezel: 14,
  radius: 56,
  /** Centre of the Withdraw button in device units. */
  button: { x: 190, y: 509 },
} as const;

export type PhoneScreenProps = ThemableProps & {
  /** Rendered width in px (height follows the device ratio). */
  width?: number;
  appName?: string;
  currency?: string;
  balanceFrom?: number;
  balanceTo?: number;
  /** Frame the balance starts counting, and for how long. */
  countAt?: number;
  countFrames?: number;
  invested?: number;
  /** Frames at which the Withdraw button is tapped. */
  taps?: number[];
  /** Frame the pending state begins (defaults to just after the first tap). */
  pendingAt?: number;
  /** Frame the screen cracks. */
  crackAt?: number;
  /** Frame the UI starts desaturating (defaults to crackAt). */
  failAt?: number;
  /** Background of the app UI. */
  screenColor?: string;
  style?: React.CSSProperties;
};

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Spinner: React.FC<{ size: number; color: string; frame: number }> = ({ size, color, frame }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: `rotate(${frame * 12}deg)` }}>
    <circle cx="20" cy="20" r="15" stroke={alpha(color, 0.25)} strokeWidth="5" fill="none" />
    <path d="M20 5 A15 15 0 0 1 35 20" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

/** Radiating crack lines drawn progressively from the impact point. */
const Crack: React.FC<{ progress: number; x: number; y: number; seed: string }> = ({ progress, x, y, seed }) => {
  const rays = 11;
  const paths: { d: string; len: number }[] = [];
  for (let i = 0; i < rays; i++) {
    const baseAng = (i / rays) * Math.PI * 2 + random(`${seed}a${i}`) * 0.4;
    let px = x;
    let py = y;
    let d = `M${px},${py}`;
    let len = 0;
    const segs = 4 + Math.floor(random(`${seed}s${i}`) * 3);
    for (let k = 0; k < segs; k++) {
      const ang = baseAng + (random(`${seed}j${i}${k}`) - 0.5) * 0.7;
      const step = 50 + random(`${seed}l${i}${k}`) * 90;
      px += Math.cos(ang) * step;
      py += Math.sin(ang) * step;
      len += step;
      d += ` L${px.toFixed(1)},${py.toFixed(1)}`;
    }
    paths.push({ d, len });
  }
  // Ring fragments around the impact.
  const rings = [38, 80].map((r, ri) => {
    let d = "";
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r + (random(`${seed}r${ri}${i}`) - 0.5) * 16;
      d += `${i === 0 ? "M" : "L"}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)} `;
    }
    return d;
  });
  return (
    <svg viewBox={`0 0 ${PHONE.w - PHONE.bezel * 2} ${PHONE.h - PHONE.bezel * 2}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {[...paths.map((p) => ({ ...p, w: 2.6 })), ...rings.map((d) => ({ d, len: 600, w: 1.8 }))].map((p, i) => (
        <g key={i}>
          <path d={p.d} stroke="rgba(0,0,0,0.55)" strokeWidth={p.w + 2.5} fill="none" strokeDasharray={p.len} strokeDashoffset={p.len * (1 - progress)} strokeLinejoin="round" />
          <path d={p.d} stroke="rgba(255,255,255,0.92)" strokeWidth={p.w} fill="none" strokeDasharray={p.len} strokeDashoffset={p.len * (1 - progress)} strokeLinejoin="round" />
        </g>
      ))}
      <circle cx={x} cy={y} r={14 * progress} fill="rgba(255,255,255,0.35)" />
    </svg>
  );
};

export const PhoneScreen: React.FC<PhoneScreenProps> = ({
  width = 380,
  appName = "GrowFast",
  currency = "GH₵",
  balanceFrom = 2000,
  balanceTo = 2000,
  countAt = 0,
  countFrames = 60,
  invested = 500,
  taps = [],
  pendingAt,
  crackAt,
  failAt,
  screenColor,
  style,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme(themable);
  const scale = width / PHONE.w;
  const bg = screenColor ?? "#0E1830";
  const card = tint(bg, 0.07);
  const pendingStart = pendingAt ?? (taps.length ? taps[0] + 6 : Infinity);
  const isPending = frame >= pendingStart;

  // Balance count-up.
  const balance = interpolate(frame, [countAt, countAt + countFrames], [balanceFrom, balanceTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const profitPct = Math.round(((balance - invested) / invested) * 100);

  // Most recent tap → press + ripple.
  const lastTap = [...taps].reverse().find((t) => t <= frame);
  const sinceTap = lastTap === undefined ? Infinity : frame - lastTap;
  const press = sinceTap < 10 ? 1 - Math.sin((sinceTap / 10) * Math.PI) * 0.06 : 1;
  const ripple = sinceTap < 18 ? sinceTap / 18 : null;
  const tapIndex = lastTap === undefined ? -1 : taps.indexOf(lastTap);

  // Sheet slides up when pending; later taps shake it.
  const sheetIn = interpolate(frame, [pendingStart, pendingStart + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });
  const shake = tapIndex > 0 && sinceTap < 16 ? Math.sin(sinceTap * 1.9) * 10 * (1 - sinceTap / 16) : 0;
  const dots = ".".repeat(1 + (Math.floor(frame / 9) % 3));

  // Crack + flash + device shake.
  const crackP = crackAt === undefined ? 0 : interpolate(frame, [crackAt, crackAt + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const flash = crackAt === undefined ? 0 : interpolate(frame, [crackAt, crackAt + 1, crackAt + 6], [0, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const devShake = crackAt !== undefined && frame >= crackAt && frame < crackAt + 12 ? Math.sin((frame - crackAt) * 2.4) * 9 * (1 - (frame - crackAt) / 12) : 0;
  const fStart = failAt ?? crackAt;
  const fail = fStart === undefined ? 0 : interpolate(frame, [fStart, fStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sparkline: rising line that keeps drawing slowly.
  const spark = Array.from({ length: 16 }, (_, i) => {
    const x = (i / 15) * 280;
    const y = 70 - i * 3.6 - Math.sin(i * 1.3) * 6 - (random(`sp${i}`) - 0.5) * 10;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const sparkDraw = interpolate(frame, [countAt, countAt + countFrames + 30], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const t = (size: number, weight = 700, color = colors.cream): React.CSSProperties => ({ fontFamily: fonts.body, fontSize: size, fontWeight: weight, color });

  return (
    <div style={{ width, height: PHONE.h * scale, position: "relative", ...style }}>
      <div
        style={{
          width: PHONE.w,
          height: PHONE.h,
          transform: `scale(${scale}) translateX(${devShake}px)`,
          transformOrigin: "0 0",
          position: "absolute",
          borderRadius: PHONE.radius,
          background: "linear-gradient(145deg, #2A2D36, #0A0B0E 40%, #0A0B0E 70%, #23262E)",
          boxShadow: `0 30px 60px ${alpha("#000000", 0.45)}`,
        }}
      >
        {/* Screen */}
        <div
          style={{
            position: "absolute",
            inset: PHONE.bezel,
            borderRadius: PHONE.radius - PHONE.bezel,
            background: bg,
            overflow: "hidden",
            filter: failFilter(fail),
          }}
        >
          {/* Status bar + notch */}
          <div style={{ position: "absolute", top: 10, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 34px", ...t(15, 700) }}>
            <span>9:41</span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {[6, 9, 12].map((h) => (
                <span key={h} style={{ width: 4, height: h, background: colors.cream, borderRadius: 1 }} />
              ))}
              <span style={{ width: 24, height: 12, border: `2px solid ${colors.cream}`, borderRadius: 3, marginLeft: 4, boxSizing: "border-box", padding: 1 }}>
                <span style={{ display: "block", width: "70%", height: "100%", background: colors.cream }} />
              </span>
            </span>
          </div>
          <div style={{ position: "absolute", top: 8, left: "50%", width: 96, height: 26, marginLeft: -48, background: "#000", borderRadius: 14 }} />

          {/* Header: generic logo shape + name */}
          <div style={{ position: "absolute", top: 58, left: 22, right: 22, display: "flex", alignItems: "center", gap: 12 }}>
            <svg width={38} height={38} viewBox="0 0 38 38">
              <circle cx="19" cy="19" r="19" fill={colors.gold} />
              <path d="M10 24 L19 13 L28 24" stroke={bg} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={t(22, 800)}>{appName}</span>
            <span style={{ marginLeft: "auto", width: 34, height: 34, borderRadius: 17, background: card, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: isPending ? colors.red : colors.up }} />
            </span>
          </div>

          {/* Balance card */}
          <div style={{ position: "absolute", top: 118, left: 18, right: 18, height: 236, borderRadius: 26, background: card, padding: "22px 22px", boxSizing: "border-box" }}>
            <div style={t(15, 500, alpha(colors.cream, 0.65))}>Total balance</div>
            <div style={{ ...t(40, 800, colors.gold), marginTop: 6, letterSpacing: -0.5, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              {currency} {fmt(balance)}
            </div>
            <div style={{ display: "inline-flex", marginTop: 8, padding: "4px 10px", borderRadius: 10, background: alpha(colors.up, 0.18), ...t(15, 800, colors.up) }}>
              ▲ +{Math.max(0, profitPct)}%
            </div>
            <svg width={280} height={86} viewBox="0 0 280 86" style={{ position: "absolute", left: 22, bottom: 14 }}>
              <path d={spark} stroke={colors.up} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sparkDraw} />
            </svg>
          </div>

          {/* Stats row */}
          <div style={{ position: "absolute", top: 370, left: 18, right: 18, display: "flex", gap: 12 }}>
            {[
              ["Invested", `${currency} ${fmt(invested)}`],
              ["Profit", `${currency} ${fmt(Math.max(0, balance - invested))}`],
            ].map(([k, v]) => (
              <div key={k} style={{ flex: 1, borderRadius: 18, background: card, padding: "10px 14px" }}>
                <div style={t(13, 500, alpha(colors.cream, 0.6))}>{k}</div>
                <div style={t(17, 800)}>{v}</div>
              </div>
            ))}
          </div>

          {/* Withdraw button */}
          <div
            style={{
              position: "absolute",
              top: 456,
              left: 26,
              right: 26,
              height: 78,
              borderRadius: 39,
              background: isPending ? shade(colors.grey, 0.35) : colors.gold,
              transform: `scale(${press})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              overflow: "hidden",
              ...t(26, 800, isPending ? colors.cream : bg),
            }}
          >
            {ripple !== null ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 380,
                  height: 380,
                  marginLeft: -190,
                  marginTop: -190,
                  borderRadius: "50%",
                  background: alpha("#ffffff", 0.45 * (1 - ripple)),
                  transform: `scale(${0.1 + ripple})`,
                }}
              />
            ) : null}
            {isPending ? <Spinner size={30} color={colors.cream} frame={frame} /> : null}
            <span style={{ position: "relative", minWidth: isPending ? 130 : undefined }}>{isPending ? `Pending${dots}` : "Withdraw"}</span>
          </div>

          {/* Activity list (before pending) */}
          <div style={{ position: "absolute", top: 560, left: 22, right: 22 }}>
            <div style={t(15, 700, alpha(colors.cream, 0.6))}>Recent activity</div>
            {["Daily profit", "Referral bonus", "Daily profit"].map((label, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: 14, ...t(17, 700) }}>
                <span>{label}</span>
                <span style={{ color: colors.up }}>+{currency} {fmt([45, 120, 45][i])}</span>
              </div>
            ))}
          </div>

          {/* Pending sheet */}
          {sheetIn > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 200,
                background: tint(bg, 0.1),
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                padding: "22px 26px",
                boxSizing: "border-box",
                transform: `translateY(${(1 - sheetIn) * 210}px) translateX(${shake}px)`,
                borderTop: `3px solid ${colors.red}`,
              }}
            >
              <div style={t(15, 600, alpha(colors.cream, 0.65))}>Withdrawal request</div>
              <div style={{ ...t(30, 800), marginTop: 4 }}>
                {currency} {fmt(balanceTo)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                <Spinner size={30} color={colors.red} frame={frame} />
                <span style={t(24, 800, colors.red)}>Pending{dots}</span>
                {tapIndex > 0 ? (
                  <span style={{ marginLeft: "auto", ...t(14, 700, alpha(colors.cream, 0.55)) }}>Request #{tapIndex + 1}</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Crack + flash */}
          {crackP > 0 ? <Crack progress={crackP} x={PHONE.button.x - PHONE.bezel + 40} y={PHONE.button.y - PHONE.bezel - 60} seed="crack" /> : null}
          <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
        </div>
        {/* Glass highlight */}
        <div style={{ position: "absolute", inset: PHONE.bezel, borderRadius: PHONE.radius - PHONE.bezel, background: "linear-gradient(130deg, rgba(255,255,255,0.10), transparent 35%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
};
