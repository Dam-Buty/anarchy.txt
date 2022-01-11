import { uniq } from "lodash";
import { hacker } from "../biomes/hacker";
import { hollowmen } from "../biomes/hollowmen";
import { NormalizeOptions } from "../lib/utils";
import { Cell } from "./cell";
import { NoiseCollection } from "./map";

type GenerationParameters = {
  scaleFactor: { x: number; y: number };
  pathCeiling: number;
  ambianceCeiling: number;
  rareFloor: number;
};

export type Biome = {
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
  parameters: GenerationParameters;

  ambiance: string[];
  rares: Record<string, string>;
  structures: string[];
  txt: string;
};

function parseBiomeSpec(biomeSpec: BiomeSpec): Biome {
  const rawTxt = biomeSpec.txt;
  const lines = rawTxt.split("\n");
  const fullAlphabet = lines.join("").split("");

  const pathNormalizer = { min: -1, max: biomeSpec.parameters.pathCeiling };
  const ambianceNormalizer = {
    min: biomeSpec.parameters.pathCeiling,
    max: biomeSpec.parameters.ambianceCeiling,
  };
  const letterNormalizer = { min: biomeSpec.parameters.ambianceCeiling, max: 1 };

  const biome: Biome = {
    txt: {
      raw: rawTxt,
      lines,
      structures: biomeSpec.structures,
    },
    alphabet: {
      full: fullAlphabet,
      unique: uniq(fullAlphabet),
      rares: biomeSpec.rares,
      ambiance: biomeSpec.ambiance,
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

const biomeCache = {
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
