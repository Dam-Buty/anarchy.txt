import { BiomeSpec } from "../../../core/biome";
import { fill } from "../../../lib/utils";
import { structures } from "./structures";
import { txt } from "./txt";

export const hacker: BiomeSpec = {
  name: "hacker",

  parameters: {
    scaleFactor: { x: 44, y: 64 },

    pathCeiling: 0,
    ambianceCeiling: 0.35,
    rareFloor: 0.9,
  },

  ambiance: [
    [...fill(50).of("·"), ...fill(10).of("°"), ...fill(10).of("+"), ...fill(10).of("-"), ...fill(10).of("=")],
    [
      ...fill(10).of("╔"),
      ...fill(10).of("╩"),
      ...fill(10).of("╦"),
      ...fill(5).of("╠"),
      ...fill(10).of("═"),
      ...fill(5).of("╬"),
    ],
    [
      ...fill(4).of("░"),
      ...fill(4).of("▒"),
      ...fill(4).of("▓"),
      ...fill(4).of("█"),
      ...fill(4).of("▄"),
      ...fill(4).of("▀"),
    ],
  ],
  rares: {
    "a": "Ä",
    "b": "ß",
    "c": "¢",
    "d": "Ð",
    "e": "É",
    "f": "ƒ",
    "i": "ï",
    "n": "Ñ",
    "o": "Ø",
    "s": "§",
    "u": "µ",
    "x": "×",
    "y": "¥",
    "'": "¹",
  },
  structures,
  txt,
};
