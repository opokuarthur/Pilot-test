// The two real photos in "Ronaldo vs Jesus" and how they're shown.
// Both are transparent cutouts (made by scripts/prepare-ronaldo-cutouts.py)
// shown as stickers: thick cream border following the shape, soft shadow,
// subtle warm grade, slight rotation, slide-in with overshoot, gentle float,
// a NameTag over the bottom edge and a small credit label underneath.
// Never flipped, recoloured or distorted. If a file is missing from public/,
// the matching silhouette (Player / Coach) is shown in its slot instead.
// Replace "[source]" with the photographer / outlet before publishing.
import React from "react";
import { Easing, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PhotoCutout } from "../components/PhotoCutout";
import { NameTag } from "../components/NameTag";
import { Coach, Player } from "../components/Silhouettes";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";

export const PHOTOS = {
  // 251×377 cutout (cropped above the shirt hem).
  ronaldo: { file: "assets/ronaldo/ronaldo.png", aspect: 251 / 377, credit: "Photo: [source]", name: "CRISTIANO RONALDO", role: "CAPTAIN" },
  // 673×704 cutout, head and shoulders, no background.
  jesus: { file: "assets/ronaldo/jorge-jesus.png", aspect: 673 / 704, credit: "Photo: [source]", name: "JORGE JESUS", role: "HEAD COACH" },
} as const;

export type PhotoId = keyof typeof PHOTOS;

/** True if `file` (path inside public/) exists in this bundle. */
export const hasPhoto = (file: string) => getStaticFiles().some((f) => f.name === file);

export type PhotoMomentProps = {
  photo: PhotoId;
  appearAt: number;
  exitAt?: number;
  /** Width of the cutout itself, in px. */
  width: number;
  from?: "left" | "right";
  rotate?: number;
  /** Show the NameTag (and when). */
  tag?: boolean;
  tagAt?: number;
};

/** Cutout sticker + NameTag + credit, sliding in (and optionally out). Place with a centred parent. */
export const PhotoMoment: React.FC<PhotoMomentProps> = ({ photo, appearAt, exitAt, width, from = "right", rotate = -2.5, tag = true, tagAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme();
  if (frame < appearAt) return null;
  const P = PHOTOS[photo];
  const height = width / P.aspect;
  const p = spring({ frame: frame - appearAt, fps, config: { damping: 12, mass: 0.8, stiffness: 120 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const dir = from === "left" ? -1 : 1;
  // Slides in from `from`, and back out the same way.
  const dx = dir * (1 - p + out) * 1000;
  const rot = rotate + dir * (1 - p + out) * 10;
  const bob = Math.sin((frame - appearAt) / 30) * 6;
  const sway = Math.sin((frame - appearAt) / 47 + 1) * 0.5;
  const present = hasPhoto(P.file);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translate(${dx}px, ${bob}px) rotate(${rot + sway}deg)` }}>
      <div style={{ position: "relative", width, height }}>
        {present ? (
          <PhotoCutout src={staticFile(P.file)} aspect={P.aspect} width={width} border={16} warmth={0.3} />
        ) : photo === "ronaldo" ? (
          <Player x={(width - height * 0.744) / 2} y={height} height={height} pose="cheer" />
        ) : (
          <Coach x={(width - height * 0.744) / 2} y={height} height={height} />
        )}
        {tag ? (
          <div style={{ position: "absolute", left: -40, right: -40, bottom: -36, display: "flex", justifyContent: "center", transform: `rotate(${-rotate}deg)` }}>
            <NameTag name={P.name} role={P.role} appearAt={tagAt ?? appearAt + 12} fontSize={46} />
          </div>
        ) : null}
      </div>
      {present ? (
        <div
          style={{
            marginTop: tag ? 56 : 18,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 0.5,
            color: alpha(colors.cream, 0.75),
            whiteSpace: "nowrap",
            padding: "3px 12px",
            borderRadius: 14,
            background: alpha(colors.ink, 0.55),
            transform: `rotate(${-rotate}deg)`,
          }}
        >
          {P.credit}
        </div>
      ) : null}
    </div>
  );
};
