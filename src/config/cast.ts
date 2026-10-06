// The recurring characters. Reuse these presets, or build new ones from PersonFigureProps.
import type { PersonFigureProps } from "../components/Person";
import { defaultTheme } from "./theme";

const { skinTones } = defaultTheme;

export const CAST = {
  youngMan: {
    skinTone: skinTones[2],
    outfit: "tshirt",
    outfitColor: "#3E6FB0",
    accentColor: "#E9B44C",
    hair: "fade",
  },
  churchAuntie: {
    skinTone: skinTones[0],
    outfit: "dress",
    outfitColor: "#E9B44C",
    accentColor: "#D62828",
    pattern: "kente",
    accessory: "headwrap",
  },
  officeWorker: {
    skinTone: skinTones[1],
    outfit: "shirtTie",
    outfitColor: "#F4EDE1",
    accentColor: "#D62828",
    bottomColor: "#2A3550",
    accessory: "glasses",
    hair: "short",
  },
  student: {
    skinTone: skinTones[1],
    outfit: "tshirt",
    outfitColor: "#2F7D5B",
    accentColor: "#C8553D",
    pattern: "stripes",
    accessory: "backpack",
    hair: "puffs",
  },
} satisfies Record<string, PersonFigureProps>;
