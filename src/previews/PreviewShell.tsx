// Wraps a preview composition with the asset + theme providers, so each
// component can be checked on its own in Remotion Studio.
import React from "react";
import type { AssetManifest } from "../lib/assets";
import { AssetProvider } from "../lib/asset-context";
import { ThemeProvider } from "../lib/theme-context";

export type PreviewProps = { manifest: AssetManifest };

export const withPreviewShell = (Inner: React.FC) => {
  const Wrapped: React.FC<PreviewProps> = ({ manifest }) => (
    <AssetProvider manifest={manifest}>
      <ThemeProvider>
        <Inner />
      </ThemeProvider>
    </AssetProvider>
  );
  return Wrapped;
};
