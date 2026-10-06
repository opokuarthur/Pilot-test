// Preview: the four main characters plus every expression and pose.
import React from "react";
import { AbsoluteFill } from "remotion";
import { PersonFigure, Expression, Pose } from "../components/Person";
import { SceneFrame } from "../components/SceneFrame";
import { CAST } from "../config/cast";

const EXPRESSIONS: Expression[] = ["neutral", "happy", "excited", "worried", "angry", "shocked"];
const POSES: Pose[] = ["idle", "phone", "phoneOne", "cheer", "reach", "fist", "shrug", "cheeks"];

export const CharactersPreview: React.FC = () => (
  <SceneFrame>
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        {Object.values(CAST).map((c, i) => (
          <g key={i} transform={`translate(${100 + i * 230} 170) scale(0.95)`}>
            <PersonFigure {...c} expression="happy" pose="idle" seed={i} />
          </g>
        ))}
        {EXPRESSIONS.map((e, i) => (
          <g key={e} transform={`translate(${60 + i * 165} 650) scale(0.7)`}>
            <PersonFigure {...CAST.youngMan} expression={e} seed={i} />
          </g>
        ))}
        {POSES.map((p, i) => (
          <g key={p} transform={`translate(${70 + (i % 4) * 240} ${1010 + Math.floor(i / 4) * 420}) scale(0.8)`}>
            <PersonFigure {...CAST.churchAuntie} pose={p} expression="happy" seed={i} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  </SceneFrame>
);
