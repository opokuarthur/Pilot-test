// Person: the reusable character system. Every character in the video is built
// from the same parts (circle head, rounded torso, rounded-stroke arms solved
// with 2-bone IK) so they all belong to the same world.
//
//   <PersonFigure/>  an SVG <g> in local units (feet at x=100, y=400). Use it
//                    inside a larger <svg> (Crowd, PhonePass, scenes).
//   <Person/>        standalone, absolutely-positioned wrapper around it.
//
// Expression and pose accept a fixed value OR keyframes, and blend smoothly:
//   expression={[{ at: 0, value: "happy" }, { at: 90, value: "worried" }]}
//
// Faceless options (for real people who must never be shown with a face):
//   view="back"        seen from behind: no face, hair covers the back of the head
//   silhouette="#0B1326"  the whole figure becomes one solid colour (+ optional rimLight)
//   walk={24}          walk cycle with a stride every 24 frames (legs + arm swing + bob)
//   torsoOverlay={…}   SVG drawn over the torso but under the arms, NOT silhouetted
//                      (e.g. a shirt number or collar on a silhouette)
import React from "react";
import { useCurrentFrame } from "remotion";
import { Animatable, lerp, lerpObj, resolveKeyframes } from "../lib/keyframes";
import { mix, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type Expression = "neutral" | "happy" | "excited" | "worried" | "angry" | "shocked";
export type Pose =
  | "idle"
  | "phone" // both hands hold a phone at chest, looking down
  | "phoneOne" // right hand holds phone up, left arm relaxed
  | "cheer" // both arms up
  | "reach" // right arm stretched out to the side (passing something)
  | "fist" // right fist raised (protest)
  | "shrug"
  | "cheeks"; // hands on cheeks (shock)
export type Outfit = "tshirt" | "dress" | "shirtTie";
export type Pattern = "none" | "kente" | "stripes";
export type Accessory = "none" | "headwrap" | "backpack" | "glasses";
export type Hair = "short" | "fade" | "puffs" | "bun" | "none";

export type PersonFigureProps = ThemableProps & {
  skinTone?: string;
  outfit?: Outfit;
  outfitColor?: string;
  /** Second clothing colour: tie, headwrap folds, pattern accents, backpack. */
  accentColor?: string;
  /** Trousers / legs colour. */
  bottomColor?: string;
  pattern?: Pattern;
  accessory?: Accessory | Accessory[];
  hair?: Hair;
  hairColor?: string;
  expression?: Animatable<Expression>;
  pose?: Animatable<Pose>;
  /** Draw a phone in the hand(s). "auto" = only for phone/phoneOne/cheer poses. */
  holdingPhone?: boolean | "auto";
  phoneScreenColor?: string;
  /** 0 = full colour, 1 = grey ("scam failed"). */
  fail?: number;
  /** Phase offset so crowds don't move in sync. */
  seed?: number;
  /** 0–1: adds an excited hop. */
  energy?: number;
  /** Frames used to blend expression/pose changes. */
  blendFrames?: number;
  /** Mirror horizontally. */
  flip?: boolean;
  /** "back" = seen from behind (no face drawn). */
  view?: "front" | "back";
  /** Solid fill colour for the whole figure (a silhouette). */
  silhouette?: string;
  /** Glowing outline around a silhouette (backlight). */
  rimLight?: string;
  /** Stride period in frames for a walk cycle (0 = standing). */
  walk?: number;
  /** Drawn in body units over the torso (it breathes with it), under the arms; never silhouetted. */
  torsoOverlay?: React.ReactNode;
};

// ---- Expression + pose tables ------------------------------------------------

export type Face = { mouthW: number; smile: number; open: number; raise: number; tilt: number; eye: number; cheeks: number };
export const FACES: Record<Expression, Face> = {
  neutral: { mouthW: 11, smile: 0.2, open: 0, raise: 0, tilt: 0, eye: 1, cheeks: 0 },
  happy: { mouthW: 14, smile: 1, open: 0.12, raise: 1, tilt: -0.2, eye: 1, cheeks: 0.6 },
  excited: { mouthW: 16, smile: 1.1, open: 0.9, raise: 5, tilt: -0.4, eye: 1.1, cheeks: 0.8 },
  worried: { mouthW: 11, smile: -0.7, open: 0.06, raise: 3, tilt: -1, eye: 1, cheeks: 0 },
  angry: { mouthW: 13, smile: -0.8, open: 0.35, raise: -2, tilt: 1.3, eye: 0.85, cheeks: 0 },
  shocked: { mouthW: 10, smile: 0, open: 1, raise: 8, tilt: -0.3, eye: 1.3, cheeks: 0 },
};

type PoseDef = { lx: number; ly: number; rx: number; ry: number; gaze: number };
const POSES: Record<Pose, PoseDef> = {
  idle: { lx: 46, ly: 288, rx: 154, ry: 288, gaze: 0 },
  phone: { lx: 86, ly: 246, rx: 114, ry: 246, gaze: 1 },
  phoneOne: { lx: 46, ly: 288, rx: 118, ry: 236, gaze: 1 },
  cheer: { lx: 24, ly: 82, rx: 176, ry: 82, gaze: -0.5 },
  reach: { lx: 46, ly: 288, rx: 226, ry: 214, gaze: 0 },
  fist: { lx: 46, ly: 288, rx: 154, ry: 78, gaze: -0.3 },
  shrug: { lx: 28, ly: 226, rx: 172, ry: 226, gaze: 0 },
  cheeks: { lx: 76, ly: 128, rx: 124, ry: 128, gaze: 0 },
};
const PHONE_POSES: Pose[] = ["phone", "phoneOne", "cheer"];

// Body geometry (local units).
const SHOULDER_L = { x: 58, y: 182 };
const SHOULDER_R = { x: 142, y: 182 };
const UPPER = 56;
const LOWER = 54;
const HEAD = { x: 100, y: 100, r: 46 };

/** 2-bone IK: elbow position for a hand target, bending outward. */
const solveElbow = (s: { x: number; y: number }, tx: number, ty: number, outward: -1 | 1) => {
  const dx = tx - s.x;
  const dy = ty - s.y;
  const d = Math.min(Math.hypot(dx, dy), UPPER + LOWER - 0.5);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.min(1, Math.max(-1, (UPPER * UPPER + d * d - LOWER * LOWER) / (2 * UPPER * d))));
  const e1 = { x: s.x + UPPER * Math.cos(base + a), y: s.y + UPPER * Math.sin(base + a) };
  const e2 = { x: s.x + UPPER * Math.cos(base - a), y: s.y + UPPER * Math.sin(base - a) };
  const elbow = (e1.x - e2.x) * outward > 0 ? e1 : e2;
  // Re-derive the hand so the arm length stays constant when the target is out of reach.
  const ang = Math.atan2(ty - elbow.y, tx - elbow.x);
  return { elbow, hand: { x: elbow.x + LOWER * Math.cos(ang), y: elbow.y + LOWER * Math.sin(ang) } };
};

const TORSO =
  "M62,170 C72,163 128,163 138,170 Q157,176 158,198 L153,300 Q100,312 47,300 L42,198 Q43,176 62,170 Z";
const DRESS =
  "M62,170 C72,163 128,163 138,170 Q157,176 157,198 L150,262 L174,368 Q100,384 26,368 L50,262 L43,198 Q43,176 62,170 Z";

// ---- Face ----------------------------------------------------------------------
// Drawn in head-local units (head centre 100,100, radius 46). Shared by Person
// and the small busts in PyramidCollapse so faces match everywhere.
export const FaceFeatures: React.FC<{
  face: Face;
  blink?: number;
  skin: string;
  ink?: string;
  glasses?: boolean;
}> = ({ face, blink = 1, skin, ink = "#1B1410", glasses = false }) => {
  const my = 126;
  const c = face.smile * 9;
  const o = face.open;
  // Shared top/bottom curves: a line when closed, a filled shape when open.
  const mouth = `M${100 - face.mouthW},${my} Q100,${my + c - o * 13} ${100 + face.mouthW},${my} Q100,${my + c + o * 24} ${100 - face.mouthW},${my} Z`;
  const brow = (side: -1 | 1) => {
    const by = 84 - face.raise;
    return (
      <path
        d={`M${100 + side * 26},${by - face.tilt * 2} L${100 + side * 8},${by + face.tilt * 5}`}
        stroke={ink}
        strokeWidth={5}
        strokeLinecap="round"
      />
    );
  };
  return (
    <g>
      {face.cheeks > 0.02 ? (
        <g fill={mix(skin, "#E0533F", 0.45)} opacity={face.cheeks * 0.55}>
          <ellipse cx={74} cy={118} rx={8} ry={5} />
          <ellipse cx={126} cy={118} rx={8} ry={5} />
        </g>
      ) : null}
      <ellipse cx={84} cy={102} rx={5.5 * face.eye} ry={6.5 * face.eye * blink} fill={ink} />
      <ellipse cx={116} cy={102} rx={5.5 * face.eye} ry={6.5 * face.eye * blink} fill={ink} />
      {brow(-1)}
      {brow(1)}
      <path d={mouth} stroke={ink} strokeWidth={4.5} strokeLinejoin="round" fill="#4A1414" fillOpacity={Math.min(1, o * 6)} />
      {glasses ? (
        <g stroke={ink} strokeWidth={3.5} fill="none">
          <rect x={70} y={92} width={28} height={22} rx={8} />
          <rect x={102} y={92} width={28} height={22} rx={8} />
          <path d="M98,100 L102,100" />
        </g>
      ) : null}
    </g>
  );
};

// ---- Component ----------------------------------------------------------------

export const PersonFigure: React.FC<PersonFigureProps> = ({
  skinTone,
  outfit = "tshirt",
  outfitColor,
  accentColor,
  bottomColor = "#34425F",
  pattern = "none",
  accessory = "none",
  hair = "short",
  hairColor = "#1B1410",
  expression = "neutral",
  pose = "idle",
  holdingPhone = "auto",
  phoneScreenColor,
  fail = 0,
  seed = 0,
  energy = 0,
  blendFrames = 8,
  flip = false,
  view = "front",
  silhouette,
  rimLight,
  walk = 0,
  torsoOverlay,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors, skinTones } = useTheme(themable);
  const skin = skinTone ?? skinTones[0];
  const cloth = outfitColor ?? colors.gold;
  const accent = accentColor ?? colors.red;
  const ink = "#1B1410";
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const accessories = Array.isArray(accessory) ? accessory : [accessory];

  // Expression + pose blending.
  const ex = resolveKeyframes(expression, frame, blendFrames);
  const face = lerpObj(FACES[ex.from], FACES[ex.to], ex.t);
  const po = resolveKeyframes(pose, frame, blendFrames + 4);
  const p = lerpObj(POSES[po.from], POSES[po.to], po.t);
  const phoneWeight =
    holdingPhone === "auto"
      ? lerp(PHONE_POSES.includes(po.from) ? 1 : 0, PHONE_POSES.includes(po.to) ? 1 : 0, po.t)
      : holdingPhone
        ? 1
        : 0;

  // Idle motion: breathing, head bob, blink, optional hop.
  const t = frame + seed * 37;
  const breathe = Math.sin((t / 70) * Math.PI * 2);
  const headBob = Math.sin((t / 90) * Math.PI * 2 + 1) * 2.2;
  const headTilt = Math.sin((t / 130) * Math.PI * 2 + seed) * 2;
  const hop = energy * Math.abs(Math.sin((t / 20) * Math.PI)) * 16;
  const blinkPeriod = 95 + ((seed * 13) % 50);
  const bp = t % blinkPeriod;
  const blink = bp < 6 ? Math.abs(bp - 3) / 3 : 1;
  const sway = Math.sin((t / 60) * Math.PI * 2) * 4 * (1 + energy);

  // Walk cycle: legs swing from the hips, arms counter-swing, body bobs.
  const stride = walk > 0 ? Math.sin((t / walk) * Math.PI * 2) : 0;
  const legSwing = stride * 24;
  const armSwing = stride * 22;
  const walkBob = walk > 0 ? -Math.abs(Math.cos((t / walk) * Math.PI * 2)) * 7 : 0;

  const L = solveElbow(SHOULDER_L, p.lx - sway * 0.3 + armSwing, p.ly + breathe, -1);
  const R = solveElbow(SHOULDER_R, p.rx + sway * 0.3 - armSwing, p.ry + breathe, 1);
  const back = view === "back";

  const longSleeves = outfit === "shirtTie";
  const sleeveColor = cloth;
  const skinShade = shade(skin, 0.22);
  const patternFill = pattern === "none" ? null : `url(#pat${uid})`;

  const arm = (s: { x: number; y: number }, a: ReturnType<typeof solveElbow>) => (
    <g>
      <path
        d={`M${s.x},${s.y} L${a.elbow.x},${a.elbow.y} L${a.hand.x},${a.hand.y}`}
        stroke={longSleeves ? sleeveColor : skin}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Short sleeve over the top of the upper arm. */}
      {!longSleeves ? (
        <path
          d={`M${s.x},${s.y} L${lerp(s.x, a.elbow.x, 0.5)},${lerp(s.y, a.elbow.y, 0.5)}`}
          stroke={sleeveColor}
          strokeWidth={28}
          strokeLinecap="round"
        />
      ) : null}
      <circle cx={a.hand.x} cy={a.hand.y} r={13} fill={skin} />
    </g>
  );

  // Phone position: between hands for "phone", at right hand otherwise.
  const both = po.to === "phone" || (po.from === "phone" && po.t < 0.5);
  const phoneX = both ? (L.hand.x + R.hand.x) / 2 : R.hand.x;
  const phoneY = both ? (L.hand.y + R.hand.y) / 2 - 18 : R.hand.y - 22;
  const screen = phoneScreenColor ?? colors.gold;
  const bodyFilter = silhouette ? `url(#sil${uid})` : fail > 0 ? `url(#sat${uid})` : undefined;
  const breatheT = `translate(100 300) scale(1 ${1 + breathe * 0.012}) translate(-100 -300)`;

  const arms = (
    <>
      {arm(SHOULDER_L, L)}
      {phoneWeight > 0.01 ? (
        <g opacity={phoneWeight} transform={`translate(${phoneX} ${phoneY})`}>
          <circle r={34} fill={screen} opacity={0.18} />
          <rect x={-16} y={-28} width={32} height={56} rx={7} fill="#111" />
          <rect x={-12} y={-23} width={24} height={44} rx={4} fill={screen} />
        </g>
      ) : null}
      {arm(SHOULDER_R, R)}
    </>
  );

  return (
    <g transform={`translate(0 ${-hop + walkBob}) ${flip ? "translate(200 0) scale(-1 1)" : ""}`}>
      <defs>
        {silhouette ? (
          <filter id={`sil${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feFlood floodColor={silhouette} result="fill" />
            <feComposite in="fill" in2="SourceAlpha" operator="in" result="solid" />
            {rimLight ? (
              <>
                <feMorphology in="SourceAlpha" operator="dilate" radius={4} result="grow" />
                <feGaussianBlur in="grow" stdDeviation={3} result="soft" />
                <feFlood floodColor={rimLight} result="rimc" />
                <feComposite in="rimc" in2="soft" operator="in" result="rim" />
                <feMerge>
                  <feMergeNode in="rim" />
                  <feMergeNode in="solid" />
                </feMerge>
              </>
            ) : null}
          </filter>
        ) : null}
        <filter id={`sat${uid}`}>
          <feColorMatrix type="saturate" values={String(1 - fail)} />
          <feComponentTransfer>
            <feFuncR type="linear" slope={1 - 0.15 * fail} />
            <feFuncG type="linear" slope={1 - 0.15 * fail} />
            <feFuncB type="linear" slope={1 - 0.15 * fail} />
          </feComponentTransfer>
        </filter>
        {pattern === "kente" ? (
          // Kente-inspired: bold horizontal bands with a simple block motif.
          <pattern id={`pat${uid}`} width="60" height="56" patternUnits="userSpaceOnUse">
            <rect width="60" height="56" fill={cloth} />
            <rect y="0" width="60" height="14" fill={accent} />
            <rect y="14" width="60" height="4" fill={ink} />
            <rect x="8" y="26" width="14" height="14" fill="#2F7D5B" />
            <rect x="38" y="26" width="14" height="14" fill={accent} />
            <rect y="48" width="60" height="4" fill={ink} />
          </pattern>
        ) : pattern === "stripes" ? (
          <pattern id={`pat${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill={cloth} />
            <rect width="24" height="7" fill={accent} />
          </pattern>
        ) : null}
        <clipPath id={`torso${uid}`}>
          <path d={outfit === "dress" ? DRESS : TORSO} />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={100} cy={400 + hop - walkBob} rx={62 - hop} ry={9} fill="#000" opacity={0.18} />

      <g filter={bodyFilter}>
      {/* Legs + shoes (swing from the hips when walking) */}
      {[
        { x: 66, hip: 81, a: legSwing },
        { x: 104, hip: 119, a: -legSwing },
      ].map((leg) => (
        <g key={leg.x} transform={`rotate(${leg.a} ${leg.hip} 296)`}>
          <rect x={leg.x} y={286} width={30} height={108} rx={14} fill={outfit === "dress" ? skinShade : bottomColor} />
          <ellipse cx={leg.x + 12} cy={396} rx={20} ry={9} fill="#141414" />
        </g>
      ))}

      {/* Backpack (behind the torso) */}
      {accessories.includes("backpack") ? (
        <rect x={34} y={176} width={132} height={128} rx={30} fill={shade(accent, 0.15)} />
      ) : null}

      {/* Torso (breathes) */}
      <g transform={breatheT}>
        <path d={outfit === "dress" ? DRESS : TORSO} fill={patternFill ?? cloth} />
        {/* Soft side shading for volume */}
        <g clipPath={`url(#torso${uid})`}>
          <rect x={128} y={160} width={60} height={240} fill="#000" opacity={0.12} />
          {outfit === "dress" ? <rect x={30} y={250} width={150} height={12} fill={accent} /> : null}
        </g>
        {outfit === "shirtTie" && !back ? (
          <g>
            <path d="M84,168 L100,186 L116,168 L112,164 L100,176 L88,164 Z" fill={tint(cloth, 0.6)} />
            <path d="M100,180 L108,190 L104,252 L100,262 L96,252 L92,190 Z" fill={accent} />
            <path d="M95,180 L105,180 L108,190 L92,190 Z" fill={shade(accent, 0.2)} />
          </g>
        ) : null}
        {accessories.includes("backpack") ? (
          <g fill={shade(accent, 0.35)}>
            <rect x={66} y={168} width={12} height={110} rx={6} />
            <rect x={122} y={168} width={12} height={110} rx={6} />
          </g>
        ) : null}
      </g>

      {/* Neck */}
      <rect x={88} y={128} width={24} height={46} rx={10} fill={skinShade} />
      {outfit === "tshirt" && !back ? <path d="M84,168 Q100,184 116,168" stroke={shade(cloth, 0.25)} strokeWidth={5} fill="none" /> : null}

      {/* Head group (bobs + tilts) */}
      <g transform={`translate(0 ${headBob}) rotate(${headTilt} 100 140)`}>
        {/* Back hair / puffs drawn behind the head */}
        {hair === "puffs" && !accessories.includes("headwrap") ? (
          <g fill={hairColor}>
            <circle cx={56} cy={62} r={24} />
            <circle cx={144} cy={62} r={24} />
          </g>
        ) : null}
        {hair === "bun" && !accessories.includes("headwrap") ? <circle cx={100} cy={44} r={22} fill={hairColor} /> : null}
        <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={skin} />
        {/* Ears */}
        <circle cx={55} cy={106} r={9} fill={skin} />
        <circle cx={145} cy={106} r={9} fill={skin} />
        {/* Hair */}
        {back && !accessories.includes("headwrap") && hair !== "none" ? (
          // From behind the hair covers the whole back of the head.
          <path d="M54,104 C48,44 152,44 146,104 C144,124 130,138 100,140 C70,138 56,124 54,104 Z" fill={hairColor} />
        ) : !accessories.includes("headwrap") ? (
          hair === "short" || hair === "puffs" || hair === "bun" ? (
            <path d="M54,102 C50,44 150,44 146,102 C140,80 122,70 100,70 C78,70 60,80 54,102 Z" fill={hairColor} />
          ) : hair === "fade" ? (
            <path d="M56,96 C54,58 66,50 100,50 C134,50 146,58 144,96 C138,78 124,72 100,72 C76,72 62,78 56,96 Z" fill={hairColor} />
          ) : null
        ) : null}

        {/* Face (looks down a little when using a phone) */}
        {!back ? (
          <g transform={`translate(0 ${p.gaze * 5})`}>
            <FaceFeatures face={face} blink={blink} skin={skin} glasses={accessories.includes("glasses")} />
          </g>
        ) : null}

        {/* Headwrap (gele-inspired): band + tall fan with fold lines */}
        {accessories.includes("headwrap") ? (
          <g>
            <path d="M48,92 C40,30 74,8 100,22 C126,8 160,30 152,92 C140,70 120,62 100,62 C80,62 60,70 48,92 Z" fill={patternFill ?? cloth} />
            <path d="M34,40 C50,-6 92,-14 100,20 C108,-14 150,-6 166,40 C140,26 122,30 100,44 C78,30 60,26 34,40 Z" fill={accent} />
            <path d="M60,26 C76,14 90,16 100,36 M140,26 C124,14 110,16 100,36" stroke={shade(accent, 0.3)} strokeWidth={4} fill="none" />
            <path d="M50,88 C68,70 132,70 150,88" stroke={shade(cloth, 0.3)} strokeWidth={4} fill="none" />
          </g>
        ) : null}
      </g>

      {/* Arms, phone, hands (drawn separately when there's a torso overlay) */}
      {torsoOverlay ? null : arms}
      </g>
      {torsoOverlay ? (
        <>
          <g transform={breatheT}>{torsoOverlay}</g>
          <g filter={bodyFilter}>{arms}</g>
        </>
      ) : null}
    </g>
  );
};

export type PersonProps = PersonFigureProps & {
  /** Left edge of the figure box (px). */
  x?: number;
  /** Bottom (feet) position (px). */
  y?: number;
  /** Figure height (px). */
  height?: number;
  style?: React.CSSProperties;
};

/** Absolutely-positioned standalone Person. */
export const Person: React.FC<PersonProps> = ({ x = 0, y = 400, height = 400, style, ...figure }) => {
  const w = (height * 320) / 430;
  return (
    <svg
      viewBox="-60 -20 320 430"
      width={w}
      height={height}
      style={{ position: "absolute", left: x, top: y - height, overflow: "visible", ...style }}
    >
      <PersonFigure {...figure} />
    </svg>
  );
};

/** Bounding box used by the standalone wrapper (handy for layout maths). */
export const PERSON_VIEWBOX = { x: -60, y: -20, w: 320, h: 430 };
