// Renders the brand logos to static SVG markup (bundled by export-brand.mjs).
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandLogo } from "../../src/brand/BrandLogo";

export const svgs = {
  "logo-full.svg": renderToStaticMarkup(<BrandLogo variant="full" width={2000} />),
  "logo-square.svg": renderToStaticMarkup(<BrandLogo variant="square" size={1024} />),
};
