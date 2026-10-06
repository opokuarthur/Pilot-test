// Remotion CLI config — applies to `remotion studio`, `remotion render` and `remotion still`.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// H.264 + high quality; good default for TikTok / Shorts uploads.
Config.setCodec("h264");
Config.setCrf(18);
