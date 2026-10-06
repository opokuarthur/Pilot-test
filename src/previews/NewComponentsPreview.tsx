// Preview: the components added for "Five Thousand Plates", in a 2-column grid
// (scaled down), so their look can be checked at a glance.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { Stopwatch } from "../components/Stopwatch";
import { TalkShowSet } from "../components/TalkShowSet";
import { HotelBuilding } from "../components/HotelBuilding";
import { BreakfastTray } from "../components/BreakfastTray";
import { ConveyorDishwasher } from "../components/ConveyorDishwasher";
import { MathWrite } from "../components/MathWrite";
import { Person } from "../components/Person";

const Cell: React.FC<{ x: number; y: number; scale?: number; children: React.ReactNode }> = ({ x, y, scale = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin: "0 0" }}>{children}</div>
);

export const NewComponentsPreview: React.FC = () => (
  <SceneFrame push={0}>
    <AbsoluteFill>
      <Cell x={40} y={40} scale={0.6}>
        <Stopwatch size={420} runs={[{ at: 0, speed: 4, eventEvery: 6 }]} />
      </Cell>
      <Cell x={330} y={40} scale={0.5}>
        <TalkShowSet width={1000} lightsOnAt={0} talking={[{ side: "right", from: 0, to: 300 }]} />
      </Cell>
      <Cell x={40} y={520} scale={0.5}>
        <HotelBuilding width={500} lightsAt={0} lightStagger={2} />
      </Cell>
      <Cell x={330} y={560} scale={0.5}>
        <ConveyorDishwasher width={1000} />
      </Cell>
      <Cell x={360} y={980} scale={0.5}>
        <BreakfastTray cols={3} rows={2} cellWidth={300} multiplyAt={0} />
      </Cell>
      <Cell x={40} y={1400}>
        <MathWrite lines={[{ text: "5,000 ÷ 8 = *625*", at: 0 }, { text: "12 hrs → *9 sec*", at: 20, underline: true }]} fontSize={70} width={600} />
      </Cell>
      <Person x={700} y={1800} height={360} view="back" hair="fade" outfitColor="#3E6FB0" walk={22} />
      <Person x={880} y={1800} height={360} view="back" silhouette="#0B1326" rimLight="#E9B44C" walk={22} seed={3} />
    </AbsoluteFill>
  </SceneFrame>
);
