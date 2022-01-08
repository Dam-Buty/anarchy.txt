import SimplexNoise from "simplex-noise";
import { Biome, getBiome } from "./biome";
import { structureValueThreshold } from "../lib/constants";
import { chooseWithNoise, NormalizeOptions } from "../lib/utils";
import { NoiseCollection } from "./map";

export const pathModel = " ";

export type Cell = {
  x: number;
  y: number;

  value: number;
  letterValue: number;

  letter: string;

  isAlphabet: boolean;
  isAlphabetOrRare: boolean;
  isRare: boolean;
  isAmbiance: boolean;
  isPath: boolean;

  isStructureCandidate: boolean;
  isPartOfStructure: boolean;

  biome: Biome;
};

export function createCell({ x, y }: Pick<Cell, "x" | "y">, noise: NoiseCollection): Cell {
  const biome = getBiome({ x, y }, noise);

  const value = noise.base.noise2D(x / biome.parameters.scaleFactor, y / biome.parameters.scaleFactor);
  const letterValue = noise.text.noise2D(x / biome.parameters.scaleFactor, y / biome.parameters.scaleFactor);

  const letter = (() => {
    if (value < biome.parameters.pathCeiling) {
      return pathModel;
    }
    if (value < biome.parameters.ambianceCeiling) {
      return chooseWithNoise(biome.alphabet.ambiance, letterValue);
    }
    return chooseWithNoise(biome.alphabet.full, letterValue);
  })();

  return {
    x,
    y,

    biome,
    value,
    letterValue,
    letter,

    isAlphabet: biome.alphabet.unique.includes(letter),
    isAlphabetOrRare: biome.alphabet.unique.includes(letter) || Object.values(biome.alphabet.rares).includes(letter),
    isRare: Object.values(biome.alphabet.rares).includes(letter),
    isAmbiance: biome.alphabet.ambiance.includes(letter),
    isPath: letter === pathModel,

    isStructureCandidate: value > structureValueThreshold,
    isPartOfStructure: false,
  };
}
