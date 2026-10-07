// ShirtSplit: full-frame split screen with two generic football shirts seen
// from the back (number only: no badges, no names, no kit-maker marks),
// each hanging from a hook and swaying gently.
//   left:  sky-blue/white stripes #10 with a "FAREWELL" banner
//   right: red #7 with a phone in front whose screen lights up when a
//          NotificationCard ("New post") pops out of it
// Optional `rightBanner` (e.g. "NOT DONE YET"). Spotlights/dims are left to
// <Spotlight/> so the two can be combined freely.
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";
import { NotificationCard } from "./NotificationCard";

export type ShirtSplitProps = ThemableProps & {
  appearAt?: number;
  exitAt?: number;
  leftNumber?: string;
  rightNumber?: string;
  leftColors?: [string, string];
  rightColors?: [string, string];
  leftBanner?: string;
  leftBannerAt?: number;
  rightBanner?: string;
  rightBannerAt?: number;
  /** Shirt centre y (px). */
  shirtY?: number;
  phone?: boolean;
  notifyAt?: number;
  notifyTitle?: string;
};

const SHIRT = "M-70 -200 Q0 -170 70 -200 L190 -150 L250 -20 L170 20 L150 -20 L150 210 Q0 230 -150 210 L-150 -20 L-170 20 L-250 -20 L-190 -150 Z";

const Shirt: React.FC<{ number: string; base: string; stripe: string; stripes: boolean; font: string; ink: string; cream: string; sway: number; id: string }> = ({
  number,
  base,
  stripe,
  stripes,
  font,
  ink,
  cream,
  sway,
  id,
}) => (
  <g transform={`rotate(${sway} 0 -260)`}>
    {/* Hook + hanger */}
    <path d="M0 -300 q 0 -26 18 -26 q 18 0 18 18" stroke={tint("#8A8F98", 0.3)} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M0 -300 L-140 -196 M0 -300 L140 -196" stroke={tint("#8A8F98", 0.3)} strokeWidth={10} strokeLinecap="round" />
    <defs>
      <clipPath id={`shirt${id}`}>
        <path d={SHIRT} />
      </clipPath>
    </defs>
    <path d={SHIRT} fill={base} />
    <g clipPath={`url(#shirt${id})`}>
      {stripes ? [-150, -60, 30, 120, 210].map((x) => <rect key={x} x={x - 22} y={-260} width={44} height={520} fill={stripe} />) : null}
      {/* Fold shading */}
      <path d="M-150 -20 Q-110 100 -150 210 L-150 -20 Z M150 -20 Q110 100 150 210 Z" fill="#000" opacity={0.12} />
      <path d="M-40 -180 Q-60 40 -20 220" stroke="#000" strokeOpacity={0.08} strokeWidth={14} fill="none" />
    </g>
    {/* Collar + cuffs */}
    <path d="M-70 -200 Q0 -170 70 -200" stroke={shade(base, 0.35)} strokeWidth={12} fill="none" />
    <path d="M250 -20 L170 20 M-250 -20 L-170 20" stroke={shade(base, 0.35)} strokeWidth={12} />
    {/* Number (back of the shirt) */}
    <text x={0} y={120} textAnchor="middle" fontFamily={font} fontSize={250} fill={stripes ? ink : cream} stroke={stripes ? cream : ink} strokeWidth={8} paintOrder="stroke fill">
      {number}
    </text>
  </g>
);

export const ShirtSplit: React.FC<ShirtSplitProps> = ({
  appearAt = 0,
  exitAt,
  leftNumber = "10",
  rightNumber = "7",
  leftColors = ["#F4F4F0", "#7DB2E0"],
  rightColors,
  leftBanner = "FAREWELL",
  leftBannerAt,
  rightBanner,
  rightBannerAt,
  shirtY = 640,
  phone = true,
  notifyAt,
  notifyTitle = "New post",
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const t = frame - appearAt;
  const inP = spring({ frame: t, fps, config: { damping: 14, mass: 0.7 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const rc = rightColors ?? [colors.red, shade(colors.red, 0.2)];
  const scale = 0.62;
  const banner = (text: string, at: number | undefined, x: number, y: number, plate: string, ink: string, rot: number) => {
    if (at === undefined || frame < at) return null;
    const p = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.6, stiffness: 170 } });
    // Shrink long labels so they stay inside their half (~360px of text).
    const size = Math.min(78, 360 / (Array.from(text).length * 0.45));
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [2, 1])}) rotate(${rot}deg)`, opacity: Math.min(1, p * 3) }}>
        <div style={{ fontFamily: fonts.headline, fontSize: size, lineHeight: 1, color: ink, background: plate, padding: "8px 26px 2px", borderRadius: 8, boxShadow: `7px 7px 0 ${colors.ink}`, letterSpacing: 3, whiteSpace: "nowrap" }}>{text}</div>
      </div>
    );
  };

  // Phone screen lights up on the notification.
  const na = notifyAt ?? 1e9;
  const lit = interpolate(frame, [na - 2, na + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ph = { x: 700, y: 820, w: 250, h: 470 };

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M0 0 H${560 - (1 - inP) * 700} L${520 - (1 - inP) * 700} 1920 H0 Z`} fill={alpha(leftColors[1], 0.16)} />
        <path d={`M1080 0 H${560 + (1 - inP) * 700} L${520 + (1 - inP) * 700} 1920 H1080 Z`} fill={alpha(rc[0], 0.16)} />
        <line x1={558} y1={130} x2={540} y2={1300} stroke={colors.cream} strokeWidth={8} opacity={inP * 0.8} />
        <g transform={`translate(${270 - (1 - inP) * 600} ${shirtY}) scale(${scale})`}>
          <Shirt number={leftNumber} base={leftColors[0]} stripe={leftColors[1]} stripes font={fonts.headline} ink={colors.navy} cream={colors.cream} sway={Math.sin(frame / 40) * 2.5} id="L" />
        </g>
        <g transform={`translate(${810 + (1 - inP) * 600} ${shirtY}) scale(${scale})`}>
          <Shirt number={rightNumber} base={rc[0]} stripe={rc[1]} stripes={false} font={fonts.headline} ink={colors.ink} cream={colors.cream} sway={Math.sin(frame / 44 + 1) * 2.5} id="R" />
        </g>
      </svg>
      {/* Phone (generic, logo-free) */}
      {phone ? (
        <div
          style={{
            position: "absolute",
            left: ph.x + (1 - inP) * 600,
            top: ph.y,
            width: ph.w,
            height: ph.h,
            borderRadius: 38,
            background: "linear-gradient(145deg, #2A2D36, #0A0B0E 45%, #23262E)",
            boxShadow: `0 24px 50px ${alpha("#000000", 0.5)}, 0 0 ${80 * lit}px ${alpha(colors.gold, 0.55 * lit)}`,
            transform: `rotate(${4 + Math.sin(frame / 36) * 1.5}deg)`,
          }}
        >
          <div style={{ position: "absolute", inset: 10, borderRadius: 30, overflow: "hidden", background: `linear-gradient(${shade(colors.navy, 0.3)}, ${colors.navy})` }}>
            <div style={{ position: "absolute", left: "50%", top: 10, width: 70, height: 18, borderRadius: 9, background: "#000", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 56, textAlign: "center", fontFamily: fonts.body, fontWeight: 700, fontSize: 64, color: alpha(colors.cream, 0.85) }}>9:41</div>
            {/* Lit-up notification strip inside the screen */}
            <div style={{ position: "absolute", left: 12, right: 12, top: 170, height: 64, borderRadius: 16, background: alpha(colors.cream, 0.9 * lit), transform: `translateY(${(1 - lit) * -40}px)` }}>
              <div style={{ position: "absolute", left: 10, top: 10, width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${colors.gold}, ${colors.red})` }} />
              <div style={{ position: "absolute", left: 64, top: 16, width: 110, height: 10, borderRadius: 5, background: colors.grey }} />
              <div style={{ position: "absolute", left: 64, top: 36, width: 80, height: 10, borderRadius: 5, background: tint(colors.grey, 0.4) }} />
            </div>
            <div style={{ position: "absolute", inset: 0, background: alpha(colors.gold, 0.15 * lit) }} />
          </div>
        </div>
      ) : null}
      {/* The notification pops out of the phone, readable size */}
      {notifyAt !== undefined ? (
        <div style={{ position: "absolute", left: 572, top: 690 }}>
          <NotificationCard appearAt={notifyAt} width={404} from="right" title={notifyTitle} />
        </div>
      ) : null}
      {banner(leftBanner, leftBannerAt, 270, shirtY + 200, colors.cream, colors.navy, -4)}
      {rightBanner ? banner(rightBanner, rightBannerAt, 810, shirtY + 200, colors.red, colors.cream, 4) : null}
    </div>
  );
};
