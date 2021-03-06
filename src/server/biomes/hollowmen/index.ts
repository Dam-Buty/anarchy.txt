import { BiomeSpec } from "../../../core/biome";
import { fill } from "../../../lib/utils";
import { structures } from "./structures";
import { txt } from "./txt";

export const hollowmen: BiomeSpec = {
  name: "hollowmen",

  parameters: {
    scaleFactor: { x: 24, y: 24 },

    pathCeiling: 0,
    ambianceCeiling: 0.35,
    rareFloor: 0.9,
  },

  structures,

  ambiance: [
    [...fill(45).of("."), ...fill(15).of("ğ"), ...fill(1).of("ğ·")],
    [...fill(10).of("ğ©"), ...fill(4).of("ğ")],
    [...fill(4).of("ğ¡"), ...fill(4).of("ğ"), ...fill(4).of("ğ¤"), ...fill(4).of("ğ°")],
  ],
  rares: {
    a: "È",
    b: "á¾",
    c: "á",
    d: "á¥",
    e: "á",
    f: "Ê",
    h: "Ê¯",
    j: "Ç°",
    m: "á¢",
    o: "ã",
    p: "â±£",
    // s: "á",
    u: "uğ¨¶",
  },
  txt,
};
