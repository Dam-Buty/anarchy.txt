import { uniq } from "lodash";
import shuffle from "knuth-shuffle-seeded";
import { hacker } from "../server/biomes/hacker";
import { hollowmen } from "../server/biomes/hollowmen";
import { NormalizeOptions } from "../lib/utils";
import { NoiseCollection } from "./map";
import { Cell } from "../lib/supabase";

type GenerationParameters = {
  scaleFactor: { x: number; y: number };
  pathCeiling: number;
  ambianceCeiling: number;
  rareFloor: number;
};

export type BiomeName = "hacker" | "hollowmen";

export type Biome = {
  name: BiomeName;

  txt: {
    raw: string;
    lines: string[];
    structures: string[];
  };

  alphabet: {
    full: string[];
    unique: string[];
    ambiance: string[];
    rares: Record<string, string>;
  };

  normalizers: {
    path: NormalizeOptions;
    ambiance: NormalizeOptions;
    letter: NormalizeOptions;
  };

  parameters: GenerationParameters;
};

export type BiomeSpec = {
  name: BiomeName;

  parameters: GenerationParameters;

  ambiance: string[][];
  rares: Record<string, string>;
  structures: string[];
  txt: string;
};

// This predictably shuffles the sub-arrays of the ambiance
function shuffleArray<T>(array: T[]): T[] {
  return shuffle(array, "Damn kids");
}

function parseBiomeSpec(biomeSpec: BiomeSpec): Biome {
  console.log(`Parsing biome ${biomeSpec.name}`);
  const rawTxt = biomeSpec.txt;
  const lines = rawTxt.split("\n");
  const fullAlphabet = lines.join("").split("");

  const pathNormalizer = { min: -1, max: biomeSpec.parameters.pathCeiling };
  const ambianceNormalizer = {
    min: biomeSpec.parameters.pathCeiling,
    max: biomeSpec.parameters.ambianceCeiling,
  };
  const letterNormalizer = { min: biomeSpec.parameters.ambianceCeiling, max: 1 };

  const ambiance: string[] = [];
  biomeSpec.ambiance.forEach((ambianceBlock) => {
    ambiance.push(...shuffleArray(ambianceBlock));
  });

  const biome: Biome = {
    name: biomeSpec.name,
    txt: {
      raw: rawTxt,
      lines,
      structures: biomeSpec.structures,
    },
    alphabet: {
      full: fullAlphabet,
      unique: uniq(fullAlphabet),
      rares: biomeSpec.rares,
      ambiance,
    },
    normalizers: {
      path: pathNormalizer,
      ambiance: ambianceNormalizer,
      letter: letterNormalizer,
    },
    parameters: biomeSpec.parameters,
  };

  return biome;
}

export const biomeCache = {
  howl: parseBiomeSpec(hollowmen),
  hacker: parseBiomeSpec(hacker),
  hollowmen: parseBiomeSpec(hollowmen),
  raven: parseBiomeSpec(hollowmen),
};

function selectBiome(technologyValue: number, magicValue: number): Biome {
  if (technologyValue > 0) {
    if (magicValue > 0) {
      // Howl
      return biomeCache.howl;
    } else {
      // Hacker manifesto
      return biomeCache.hacker;
    }
  } else {
    if (magicValue > 0) {
      // Hollowmen
      return biomeCache.hollowmen;
    } else {
      // The raven
      return biomeCache.raven;
    }
  }
}

const biomeScaleFactor = 1600;

export function getBiome({ x, y }: Pick<Cell, "x" | "y">, noise: NoiseCollection): Biome {
  const technologyValue = noise.technology.noise2D(x / biomeScaleFactor, y / biomeScaleFactor);
  const magicValue = noise.magic.noise2D(x / biomeScaleFactor, y / biomeScaleFactor);

  return selectBiome(technologyValue, magicValue);
}
