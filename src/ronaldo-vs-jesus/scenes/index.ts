import type React from "react";
import type { RvjSceneId } from "../timeline";
import { Scene1Hook } from "./Scene1Hook";
import { Scene2Plan } from "./Scene2Plan";
import { Scene3Norway } from "./Scene3Norway";
import { Scene4Deal } from "./Scene4Deal";
import { Scene5Press } from "./Scene5Press";
import { Scene6Twist } from "./Scene6Twist";
import { Scene7Timing } from "./Scene7Timing";

export const RVJ_SCENE_COMPONENTS: Record<RvjSceneId, React.FC> = {
  hook: Scene1Hook,
  plan: Scene2Plan,
  norway: Scene3Norway,
  deal: Scene4Deal,
  press: Scene5Press,
  twist: Scene6Twist,
  timing: Scene7Timing,
};
