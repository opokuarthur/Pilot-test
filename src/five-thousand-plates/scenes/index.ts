// Scene registry for "Five Thousand Plates": maps each timeline id to its component.
import React from "react";
import type { PlatesSceneId } from "../timeline";
import { Scene1Hook } from "./Scene1Hook";
import { Scene2Who } from "./Scene2Who";

const Todo: React.FC = () => null;

export const PLATES_SCENE_COMPONENTS: Record<PlatesSceneId, React.FC> = {
  hook: Scene1Hook,
  who: Scene2Who,
  claim: Todo,
  math: Todo,
  defence: Todo,
  twist: Todo,
  verdict: Todo,
};
