// Makes the AssetManifest available anywhere in the tree without prop-drilling.
import React, { createContext, useContext } from "react";
import type { AssetManifest } from "./assets";

const AssetContext = createContext<AssetManifest>({});

export const AssetProvider: React.FC<{ manifest: AssetManifest; children: React.ReactNode }> = ({
  manifest,
  children,
}) => <AssetContext.Provider value={manifest}>{children}</AssetContext.Provider>;

/** Returns true if /public/assets/<file> exists. Unknown files count as missing. */
export const useAssetExists = (file: string) => useContext(AssetContext)[file] === true;
