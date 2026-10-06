// Root: registers every composition shown in Remotion Studio.
//  • "WithdrawalPending" — the full video
//  • "Scene-*"           — each scene alone, with its captions (fast iteration)
//  • "Preview-*"         — component previews
import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import { VIDEO } from "./config/video";
import { SCENE_SECONDS, SceneId, TOTAL_FRAMES, sceneCaptions, sceneFrames } from "./config/timeline";
import { SCENE_COMPONENTS } from "./scenes";
import { Captions } from "./components/Captions";
import { Video } from "./Video";
import { CharactersPreview } from "./previews/CharactersPreview";
import { PhonePreview } from "./previews/PhonePreview";

const comp = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height };

const ScenePreview: React.FC<{ id: SceneId }> = ({ id }) => {
  const Scene = SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill>
      <Scene />
      <Captions chunks={sceneCaptions(id)} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WithdrawalPending" component={Video} durationInFrames={TOTAL_FRAMES} {...comp} />
    <Folder name="Scenes">
      {SCENE_SECONDS.map(({ id }, i) => (
        <Composition
          key={id}
          id={`Scene${i + 1}-${id}`}
          component={ScenePreview}
          defaultProps={{ id }}
          durationInFrames={sceneFrames(id)}
          {...comp}
        />
      ))}
    </Folder>
    <Folder name="Component-Previews">
      <Composition id="Preview-Characters" component={CharactersPreview} durationInFrames={150} {...comp} />
      <Composition id="Preview-Phone" component={PhonePreview} durationInFrames={300} {...comp} />
    </Folder>
  </>
);
