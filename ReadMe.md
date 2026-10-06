# Withdrawal Pending: Ghana's Ponzi Problem

A ~160-second vertical (1080×1920, 30fps) animated short for TikTok / YouTube Shorts,
built with Remotion + React + TypeScript. Everything is drawn in code (SVG + CSS):
no image files and no audio. Narration is carried by on-screen captions.

## Commands

```bash
npm install                 # once
npm run studio              # open Remotion Studio (preview, scrub, tweak)
npm run render              # render out/withdrawal-pending.mp4
npm run typecheck           # TypeScript check
```

Render a single scene or a still:

```bash
npx remotion render Scene6-ponzi out/scene6.mp4
npx remotion still WithdrawalPending out/frame.png --frame=1900
```

## Folder structure

```
src/
  index.ts            entry point (registerRoot)
  Root.tsx            registers the full video, one composition per scene, and component previews
  Video.tsx           main composition: scenes + whip-pans + captions + final cut to black
  config/
    theme.ts          palette, skin tones, outfit colours, fonts, spring presets
    video.ts          size, fps, whip-pan length
    layout.ts         safe areas (stage, caption zone, TikTok UI margins)
    timeline.ts       scene order + lengths; builds global caption timings
    script.ts         narration split into caption chunks (*word* = gold highlight)
    cast.ts           the four recurring characters as Person presets
  lib/
    theme-context.tsx ThemeProvider + useTheme(overrides)
    motion.ts         slam/pop springs, failFilter (desaturate on failure)
    keyframes.ts      "value or keyframes" props + blending helpers
    color.ts          mix / shade / tint / alpha helpers
  components/         reusable building blocks (below)
  scenes/             Scene1ColdOpen … Scene7RedFlags, plus index.ts registry
  previews/           component preview compositions
```

## Components

| Component | What it does |
|---|---|
| `Person` / `PersonFigure` | Character system: circle head, rounded torso, arms solved with 2-bone IK. Props: `skinTone`, `outfit` (tshirt/dress/shirtTie), `outfitColor`, `accentColor`, `pattern` (kente/stripes), `accessory` (headwrap/backpack/glasses), `hair`, `expression`, `pose`, `holdingPhone`, `fail`, `energy`. `expression` and `pose` accept keyframes (`[{at, value}]`) and blend smoothly. Idle breathing, head bob and blinking are built in. |
| `PhoneScreen` | Generic investment-app UI: count-up balance, Withdraw button with press + ripple, looping "Pending..." spinner, pending sheet, screen crack, desaturate. |
| `HandPhone` | Stylised hand holding a `PhoneScreen`, with a second hand's finger that taps at each `phone.taps` frame. |
| `KenBurns` / `ParallaxLayer` | Slow push-in (default 3%), plus parallax layers that move more or less than the camera. |
| `SceneFrame` | Standard scene wrapper: background, KenBurns push-in, vignette, grain. |
| `TextSlam` / `SlamAt` | Overshoot-spring slam text with a hard shadow, an optional plate, a counting-number mode, an exit, and per-word highlight colours. |
| `TradingChart` | Fake candlestick chart that rises, ticks live, then freezes and turns grey at `freezeAt`. |
| `PhonePass` | A row of Persons passing a phone along an arc. Each smiles, then turns worried, leaving a dotted "trust trail". |
| `StampGrid` | Grid of abstract app icons. "NOT LICENSED" stamps land on each one, speeding up, while a counter ticks to the total. |
| `CalendarFlip` | Split-flap year display that riffles between keyframed years. |
| `Building` | Upscale glass-and-gold office or small rural office, with roller shutters that slam down and an optional CLOSED sign. |
| `Crowd` | Generated group of Persons in a cluster or a queue. Mood can be angry (fists), worried (phones, shrugs) or happy. |
| `PyramidCollapse` | Signature visual: build, then coins flow up, then no new people arrive, then the bottom row drops out, then the pyramid collapses under analytic gravity with bounces and dust. |
| `RedFlags` | Waving flags pop in with labels and optional "RUN" tags. |
| `Captions` | Sentence captions in the caption zone: Inter 800, cream with a dark outline, gold highlights, balanced lines of at most 6 words. |
| `WhipPan` | `whipPan()` / `whipTiming()` presentation for `@remotion/transitions`: horizontal motion blur plus speed streaks. |
| `GrainOverlay` | Animated SVG paper grain (a static fibre layer plus flickering fine grain). |

Everything that sets a colour accepts `colors` / `fonts` overrides, and a whole
video can be re-skinned with `<ThemeProvider theme={…}>`.

## Retiming

- Scene lengths live in `config/timeline.ts`. Caption times in `config/script.ts`
  are seconds from the start of each scene.
- Beats inside a scene (taps, freezes, slams) are constants at the top of each
  scene file.
- When a voiceover is added later, set each caption's `at` to the spoken
  timestamp and nudge the scene constants to match.
