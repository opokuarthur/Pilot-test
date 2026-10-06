// Scene registry for "Five Thousand Plates": maps each timeline id to its component.
import React from "react";
import type { PlatesSceneId } from "../timeline";
import { Scene1Hook } from "./Scene1Hook";
import { Scene2Who } from "./Scene2Who";
import { Scene3Claim } from "./Scene3Claim";
import { Scene4Math } from "./Scene4Math";
import { Scene5Defence } from "./Scene5Defence";
import { Scene6Twist } from "./Scene6Twist";
import { Scene7Verdict } from "./Scene7Verdict";

export const PLATES_SCENE_COMPONENTS: Record<PlatesSceneId, React.FC> = {
  hook: Scene1Hook,
  who: Scene2Who,
  claim: Scene3Claim,
  math: Scene4Math,
  defence: Scene5Defence,
  twist: Scene6Twist,
  verdict: Scene7Verdict,
};
