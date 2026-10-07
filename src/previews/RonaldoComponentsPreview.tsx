// Preview: the components added for "Ronaldo vs Jesus", laid out in a grid
// (scaled down) so their look can be checked at a glance. `page` picks a set.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { PrivateJet } from "../components/PrivateJet";
import { NotificationCard } from "../components/NotificationCard";
import { GoodbyeLetter } from "../components/GoodbyeLetter";
import { Clipboard } from "../components/Clipboard";
import { LunchTable } from "../components/LunchTable";
import { WarmUpClock } from "../components/WarmUpClock";
import { Sideline } from "../components/Sideline";
import { AgreementDoc } from "../components/AgreementDoc";
import { Podium } from "../components/Podium";
import { Gavel } from "../components/Gavel";
import { GoalProgress } from "../components/GoalProgress";
import { ShirtSplit } from "../components/ShirtSplit";
import { CalendarSlam } from "../components/CalendarSlam";
import { Spotlight } from "../components/Spotlight";
import { NameTag } from "../components/NameTag";
import { Coach, Player } from "../components/Silhouettes";

const Cell: React.FC<{ x: number; y: number; scale?: number; children: React.ReactNode }> = ({ x, y, scale = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin: "0 0" }}>{children}</div>
);

export const RonaldoComponentsPreview: React.FC<{ page: number }> = ({ page }) => (
  <SceneFrame push={0}>
    {page === 1 ? (
      <AbsoluteFill>
        <Cell x={0} y={0} scale={0.5}>
          <PrivateJet rollAt={10} liftAt={60} goneAt={140} />
        </Cell>
        <Cell x={560} y={60} scale={0.6}>
          <NotificationCard appearAt={5} />
        </Cell>
        <Cell x={600} y={260} scale={0.6}>
          <NameTag name="JORGE JESUS" role="HEAD COACH" appearAt={5} />
        </Cell>
        <Cell x={40} y={600} scale={0.6}>
          <GoodbyeLetter appearAt={0} pushAt={70} />
        </Cell>
        <Cell x={560} y={620} scale={0.7}>
          <Clipboard items={[{ text: "MATCH 1", at: 20 }, { text: "FINAL MATCH", at: 50 }]} />
        </Cell>
        <Cell x={40} y={1150} scale={0.5}>
          <LunchTable tapAt={30} bubbleAt={40} replyText="Yes." replyAt={70} />
        </Cell>
        <Player x={620} y={1600} height={420} pose="reach" />
        <Coach x={820} y={1600} height={420} pose="reach" flip />
      </AbsoluteFill>
    ) : page === 2 ? (
      <AbsoluteFill>
        <Cell x={40} y={40} scale={0.8}>
          <WarmUpClock minutes={[{ at: 0, value: 45 }, { at: 90, value: 90 }]} whistleAt={92} />
        </Cell>
        <Cell x={540} y={60} scale={0.8}>
          <AgreementDoc tickAt={[10, 20, 30, 40, 50, 60, 70, 80]} signAt={40} approvedAt={85} ripAt={140} />
        </Cell>
        <Cell x={0} y={700} scale={0.5}>
          <Sideline action={[{ at: 0, value: "jog" }, { at: 60, value: "stretch" }]} />
        </Cell>
        <Cell x={560} y={760} scale={0.5}>
          <Podium flashFrom={0} />
        </Cell>
        <Cell x={40} y={1300} scale={0.6}>
          <Gavel slamAt={[30, 70]} />
        </Cell>
        <Cell x={520} y={1300} scale={0.55}>
          <GoalProgress appearAt={0} countFrames={40} />
        </Cell>
      </AbsoluteFill>
    ) : (
      <AbsoluteFill>
        <ShirtSplit notifyAt={30} leftBannerAt={20} />
        <Cell x={130} y={180} scale={0.7}>
          <CalendarSlam at={40} />
        </Cell>
        <Cell x={670} y={180} scale={0.7}>
          <CalendarSlam at={46} rotate={3} />
        </Cell>
        <Spotlight fromX={270} toX={810} swingAt={80} appearAt={10} />
      </AbsoluteFill>
    )}
  </SceneFrame>
);
