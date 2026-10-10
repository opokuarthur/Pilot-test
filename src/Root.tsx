// Root: registers every composition shown in Remotion Studio.
//  • "WithdrawalPending"  — video 1, full
//  • "FiveThousandPlates" — video 2, full
//  • "RonaldoVsJesus"     — video 3, full
//  • "Scene*-*" / "Plates*-*" / "Rvj*-*" — each scene alone, with its captions (fast iteration)
//  • "Preview-*"          — component previews
//  • "Brand-*"            — LET’S UNFOLD brand: sting, end card, logo/banner exports
// Every full video is wrapped in <BrandedVideo>: watermark after 1.5 s, and the
// logo sting + end card appended after the last scene (+5 s).
import React from "react";
import { AbsoluteFill, Audio, Composition, Folder, Sequence, staticFile } from "remotion";
import { VIDEO } from "./config/video";
import { SCENE_SECONDS, SceneId, TOTAL_FRAMES, sceneCaptions, sceneFrames, sceneStart } from "./config/timeline";
import { SCENE_COMPONENTS } from "./scenes";
import { Captions } from "./components/Captions";
import { Video } from "./Video";
import { CharactersPreview } from "./previews/CharactersPreview";
import { PhonePreview } from "./previews/PhonePreview";
import { FiveThousandPlates } from "./five-thousand-plates/FiveThousandPlates";
import { PLATES_SCENES, PLATES_TOTAL_FRAMES, PlatesSceneId, platesFrames, platesTimeline } from "./five-thousand-plates/timeline";
import { PLATES_SCENE_COMPONENTS } from "./five-thousand-plates/scenes";
import { NewComponentsPreview } from "./previews/NewComponentsPreview";
import { RonaldoComponentsPreview } from "./previews/RonaldoComponentsPreview";
import { RonaldoVsJesus } from "./ronaldo-vs-jesus/RonaldoVsJesus";
import { RVJ_SCENES, RVJ_TOTAL_FRAMES, RvjSceneId, rvjFrames, rvjTimeline } from "./ronaldo-vs-jesus/timeline";
import { RVJ_SCENE_COMPONENTS } from "./ronaldo-vs-jesus/scenes";
import { BrandedVideo, brandedDuration } from "./brand/BrandedVideo";
import { WITHDRAWAL_PENDING_END_CARD, WithdrawalPendingSoundtrack } from "./WithdrawalPendingSoundtrack";
import { VOICEOVER } from "./config/voiceover";
import { Watermark } from "./brand/Watermark";
import { LogoSting, stingFrames } from "./brand/LogoSting";
import { EndCard, endCardFrames } from "./brand/EndCard";
import { ASSET_SIZES, BrandSheetPreview, LogoFullAsset, LogoIconAsset, LogoSquareAsset, WatermarkAsset, YouTubeBanner } from "./brand/BrandAssets";

const comp = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height };

// Full videos with the channel branding (watermark + sting + end card).
type BrandedProps = { watermark?: boolean };
const WP_END = WITHDRAWAL_PENDING_END_CARD;
const WithdrawalPendingBranded: React.FC<BrandedProps> = ({ watermark }) => (
  <AbsoluteFill>
    <BrandedVideo
      contentFrames={TOTAL_FRAMES}
      watermark={watermark}
      endCardSeconds={WP_END.seconds}
      endCard={{ lineAt: WP_END.lineAt, followAt: WP_END.followAt }}
    >
      <Video />
    </BrandedVideo>
    <WithdrawalPendingSoundtrack />
  </AbsoluteFill>
);
const FiveThousandPlatesBranded: React.FC<BrandedProps> = ({ watermark }) => (
  <BrandedVideo contentFrames={PLATES_TOTAL_FRAMES} watermark={watermark}>
    <FiveThousandPlates />
  </BrandedVideo>
);
const RonaldoVsJesusBranded: React.FC<BrandedProps> = ({ watermark }) => (
  <BrandedVideo contentFrames={RVJ_TOTAL_FRAMES} watermark={watermark}>
    <RonaldoVsJesus />
  </BrandedVideo>
);

const Outro: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={stingFrames(VIDEO.fps)}>
      <LogoSting />
    </Sequence>
    <Sequence from={stingFrames(VIDEO.fps)}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);

const ScenePreview: React.FC<{ id: SceneId }> = ({ id }) => {
  const Scene = SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill>
      {/* The matching slice of the voiceover, to check sync scene by scene */}
      <Audio src={staticFile(VOICEOVER.file)} trimBefore={sceneStart(id)} volume={VOICEOVER.volume} />
      <Scene />
      <Captions chunks={sceneCaptions(id)} />
      <Watermark />
    </AbsoluteFill>
  );
};

const PlatesScenePreview: React.FC<{ id: PlatesSceneId }> = ({ id }) => {
  const Scene = PLATES_SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill>
      <Scene />
      <Captions chunks={platesTimeline.sceneCaptions(id)} />
      <Watermark />
    </AbsoluteFill>
  );
};

const RvjScenePreview: React.FC<{ id: RvjSceneId }> = ({ id }) => {
  const Scene = RVJ_SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill>
      <Scene />
      <Captions chunks={rvjTimeline.sceneCaptions(id)} />
      <Watermark />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WithdrawalPending" component={WithdrawalPendingBranded} durationInFrames={brandedDuration(TOTAL_FRAMES, VIDEO.fps, WP_END.seconds)} {...comp} />
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
    <Composition id="FiveThousandPlates" component={FiveThousandPlatesBranded} durationInFrames={brandedDuration(PLATES_TOTAL_FRAMES, VIDEO.fps)} {...comp} />
    <Folder name="Plates-Scenes">
      {PLATES_SCENES.map(({ id }, i) => (
        <Composition
          key={id}
          id={`Plates${i + 1}-${id}`}
          component={PlatesScenePreview}
          defaultProps={{ id }}
          durationInFrames={platesFrames(id)}
          {...comp}
        />
      ))}
    </Folder>
    <Composition id="RonaldoVsJesus" component={RonaldoVsJesusBranded} durationInFrames={brandedDuration(RVJ_TOTAL_FRAMES, VIDEO.fps)} {...comp} />
    <Folder name="Rvj-Scenes">
      {RVJ_SCENES.map(({ id }, i) => (
        <Composition
          key={id}
          id={`Rvj${i + 1}-${id}`}
          component={RvjScenePreview}
          defaultProps={{ id }}
          durationInFrames={rvjFrames(id)}
          {...comp}
        />
      ))}
    </Folder>
    <Folder name="Brand">
      <Composition id="Brand-LogoSting" component={LogoSting} durationInFrames={stingFrames(VIDEO.fps)} {...comp} />
      <Composition id="Brand-EndCard" component={EndCard} durationInFrames={endCardFrames(VIDEO.fps)} {...comp} />
      <Composition id="Brand-Outro" component={Outro} durationInFrames={stingFrames(VIDEO.fps) + endCardFrames(VIDEO.fps)} {...comp} />
      <Composition id="Brand-LogoFull" component={LogoFullAsset} durationInFrames={1} fps={VIDEO.fps} {...ASSET_SIZES.logoFull} />
      <Composition id="Brand-LogoSquare" component={LogoSquareAsset} durationInFrames={1} fps={VIDEO.fps} {...ASSET_SIZES.logoSquare} />
      <Composition id="Brand-LogoIcon" component={LogoIconAsset} durationInFrames={1} fps={VIDEO.fps} {...ASSET_SIZES.logoIcon} />
      <Composition id="Brand-Watermark" component={WatermarkAsset} durationInFrames={1} fps={VIDEO.fps} {...ASSET_SIZES.watermark} />
      <Composition id="Brand-YouTubeBanner" component={YouTubeBanner} durationInFrames={1} fps={VIDEO.fps} {...ASSET_SIZES.youtubeBanner} />
      <Composition id="Brand-Sheet" component={BrandSheetPreview} durationInFrames={1} {...comp} />
    </Folder>
    <Folder name="Component-Previews">
      <Composition id="Preview-Characters" component={CharactersPreview} durationInFrames={150} {...comp} />
      <Composition id="Preview-Phone" component={PhonePreview} durationInFrames={300} {...comp} />
      <Composition id="Preview-PlatesComponents" component={NewComponentsPreview} durationInFrames={300} {...comp} />
      {[1, 2, 3].map((page) => (
        <Composition key={page} id={`Preview-RonaldoComponents${page}`} component={RonaldoComponentsPreview} defaultProps={{ page }} durationInFrames={300} {...comp} />
      ))}
    </Folder>
  </>
);
