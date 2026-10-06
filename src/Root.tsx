// Root: registers every composition shown in Remotion Studio.
//  • "WithdrawalPending" — the full video (added once scenes are built)
//  • "Preview-*" — one composition per component, for checking them in isolation
import React from "react";
import { Composition, Folder } from "remotion";
import { VIDEO } from "./config/video";
import { checkAssets } from "./lib/assets";
import { withPreviewShell } from "./previews/PreviewShell";
import { FoundationPreview } from "./previews/FoundationPreview";

// Runs once before rendering: works out which asset files exist.
const withManifest = async () => ({ props: { manifest: await checkAssets() } });

const previews: { id: string; component: React.FC; seconds: number }[] = [
  { id: "Preview-Foundation", component: FoundationPreview, seconds: 4 },
];

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Component-Previews">
      {previews.map(({ id, component, seconds }) => (
        <Composition
          key={id}
          id={id}
          component={withPreviewShell(component)}
          durationInFrames={Math.round(seconds * VIDEO.fps)}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
          defaultProps={{ manifest: {} }}
          calculateMetadata={withManifest}
        />
      ))}
    </Folder>
  </>
);
