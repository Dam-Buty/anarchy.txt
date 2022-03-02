import { BiomeSpec } from "../../../core/biome";
import { fill } from "../../../lib/utils";
import { structures } from "./structures";
import { txt } from "./txt";

// unused
// [...fill(10).of("╭"), ...fill(10).of("╯"), ...fill(10).of("╮"), ...fill(10).of("╰")],
//  ...fill(10).of("෴")
// ...fill(4).of("𐁗"),

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
    [...fill(45).of("."), ...fill(15).of("𑀇"), ...fill(1).of("𐂷")],
    [...fill(10).of("𐂩"), ...fill(4).of("𐂐")],
    [...fill(4).of("𐃡"), ...fill(4).of("𐃓"), ...fill(4).of("𐃤"), ...fill(4).of("𐃰")],
  ],
  rares: {
    a: "ȃ",
    b: "ᗾ",
    c: "ᙅ",
    d: "ᗥ",
    e: "ᘍ",
    f: "ʄ",
    h: "ʯ",
    j: "ǰ",
    m: "ᙢ",
    o: "ㆆ",
    p: "Ᵽ",
    // s: "ᔖ",
    u: "u𑨶",
  },
  txt,
};
