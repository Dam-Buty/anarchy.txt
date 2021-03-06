import { BiomeSpec } from "../../../core/biome";
import { fill } from "../../../lib/utils";
import { structures } from "./structures";
import { txt } from "./txt";

export const raven: BiomeSpec = {
  name: "raven",

  parameters: {
    scaleFactor: { x: 44, y: 64 },

    pathCeiling: 0,
    ambianceCeiling: 0.35,
    rareFloor: 0.85,
  },

  ambiance: [
    [...fill(50).of("ยท"), ...fill(10).of("๐"), ...fill(10).of("๐จ"), ...fill(10).of("๐"), ...fill(10).of("๐ง")],
    [...fill(10).of("๐"), ...fill(10).of("๐"), ...fill(10).of("๐"), ...fill(10).of("๐")],
    [...fill(4).of("๐ฉ"), ...fill(4).of("๐ช"), ...fill(4).of("๐")],
  ],
  rares: {
    a: "๐ถ",
    b: "๐ท",
    c: "๐ธ",
    d: "๐น",
    f: "๐ป",
    h: "๐ฝ",
    i: "๐พ",
    j: "๐ฟ",
    k: "๐",
    l: "๐",
    m: "๐",
    n: "๐",
    p: "๐",
    q: "๐",
    r: "๐",
    s: "๐",
    t: "๐",
    u: "๐",
    v: "๐",
    w: "๐",
    x: "๐",
    y: "๐",
    z: "๐",
    A: "๐",
    B: "ร",
    C: "๐",
    D: "๐",
    E: "๐",
    F: "๐",
    G: "๐ข",
    J: "๐ฅ",
    K: "๐ฆ",
    L: "๐",
    M: "๐",
    N: "๐ฉ",
    O: "๐ช",
    P: "๐ซ",
    Q: "๐ฌ",
    S: "๐ฎ",
    T: "๐ฏ",
    U: "๐ฐ",
    V: "๐ฑ",
    W: "๐ฒ",
    X: "๐ณ",
    Y: "๐ด",
    Z: "๐ต",
  },
  structures,
  txt,
};
