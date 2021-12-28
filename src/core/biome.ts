import { uniq } from "lodash";

export type Biome = {
  txt: string;
  lines: string[];
  alphabet: string[];
  uniqueAlphabet: string[];
  rares: Record<string, string>;
  ambiance: string[];
};

export function createBiome({ txt, ambiance, rares }: Pick<Biome, "txt" | "ambiance" | "rares">): Biome {
  const lines = txt.split("\n");
  const alphabet = lines.join("").split("");

  return {
    txt,
    lines,
    alphabet,
    uniqueAlphabet: uniq(alphabet),
    rares: {
      a: "ȃ",
      b: "ᗾ",
      c: "ᙅ",
      d: "ᗥ",
      e: "ᘍ",
      f: "ʄ",
      j: "ǰ",
      m: "ᙢ",
      s: "ᔖ",
    },
    ambiance,
  };
}
