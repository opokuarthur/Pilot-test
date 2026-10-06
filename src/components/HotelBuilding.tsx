// HotelBuilding: a tall hotel tower whose windows light up one by one.
// A thin wrapper around Building's "hotel" variant, with hotel defaults.
import React from "react";
import { Building, BuildingProps, hotelViewHeight } from "./Building";

export type HotelBuildingProps = Omit<BuildingProps, "variant" | "shutterAt" | "shutterStagger" | "closedSign">;

export const HotelBuilding: React.FC<HotelBuildingProps> = ({ floors = 14, cols = 6, signText = "HOTEL", ...rest }) => (
  <Building variant="hotel" floors={floors} cols={cols} signText={signText} {...rest} />
);

/** Rendered height in px for a given width and floor count. */
export const hotelHeight = (width: number, floors = 14) => (width * hotelViewHeight(floors)) / 600;
