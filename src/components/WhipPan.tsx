// WhipPan: a fast horizontal blur-swipe between scenes, as a custom
// @remotion/transitions presentation. Usage inside <TransitionSeries>:
//   <TransitionSeries.Transition presentation={whipPan()} timing={whipTiming(8)} />
// The outgoing scene flies out with horizontal motion blur while the incoming
// scene flies in; a few speed streaks sell the movement.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { linearTiming, TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

export type WhipPanProps = {
  direction?: "left" | "right";
  /** Peak horizontal blur in px. */
  blur?: number;
  streakColor?: string;
};

const WhipPanPresentation: React.FC<TransitionPresentationComponentProps<WhipPanProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const { direction = "left", blur = 60, streakColor = "#F4EDE1" } = passedProps;
  const dir = direction === "left" ? -1 : 1;
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const exiting = presentationDirection === "exiting";
  const x = exiting ? dir * p * 100 : -dir * (1 - p) * 100;
  const b = Math.sin(p * Math.PI) * blur;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`whip${id}`} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${b.toFixed(1)} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform: `translateX(${x}%)`, filter: b > 0.5 ? `url(#whip${id})` : undefined }}>{children}</AbsoluteFill>
      {!exiting ? (
        <AbsoluteFill style={{ pointerEvents: "none", opacity: Math.sin(p * Math.PI) * 0.5 }}>
          {[220, 560, 900, 1250, 1600].map((y, i) => (
            <div
              key={y}
              style={{
                position: "absolute",
                top: y,
                left: `${(1 - p) * 140 - 40 - i * 7}%`,
                width: "70%",
                height: 6 + (i % 3) * 4,
                borderRadius: 8,
                background: `linear-gradient(90deg, transparent, ${streakColor}, transparent)`,
              }}
            />
          ))}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const whipPan = (props: WhipPanProps = {}): TransitionPresentation<WhipPanProps> => ({
  component: WhipPanPresentation,
  props,
});

/** Fast in-out timing for whip pans. */
export const whipTiming = (durationInFrames: number) =>
  linearTiming({ durationInFrames, easing: Easing.inOut(Easing.cubic) });
