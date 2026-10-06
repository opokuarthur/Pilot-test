// Scene registry: maps each timeline id to its component.
import React from "react";
import type { SceneId } from "../config/timeline";
import { Scene1ColdOpen } from "./Scene1ColdOpen";
import { Scene2YepBit } from "./Scene2YepBit";
import { Scene3CWPC } from "./Scene3CWPC";
import { Scene4List } from "./Scene4List";
import { Scene5Twist } from "./Scene5Twist";
import { Scene6Ponzi } from "./Scene6Ponzi";
import { Scene7RedFlags } from "./Scene7RedFlags";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  coldOpen: Scene1ColdOpen,
  yepbit: Scene2YepBit,
  cwpc: Scene3CWPC,
  list: Scene4List,
  twist: Scene5Twist,
  ponzi: Scene6Ponzi,
  redFlags: Scene7RedFlags,
};
