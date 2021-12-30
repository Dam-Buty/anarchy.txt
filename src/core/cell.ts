import SimplexNoise from "simplex-noise";
import { Biome } from "./biome";
import { structureValueThreshold } from "../lib/constants";
import { chooseWithNoise, NormalizeOptions } from "../lib/utils";

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

export const pathNormalizer: NormalizeOptions = { min: -1, max: 0 };
export const ambianceNormalizer: NormalizeOptions = { min: 0, max: 0.4 };
export const letterNormalizer: NormalizeOptions = { min: 0.4, max: 1 };

export function createCell(
  { x, y, biome }: Pick<Cell, "x" | "y" | "biome">,
  { noise, textNoise }: { noise: SimplexNoise; textNoise: SimplexNoise }
): Cell {
  const value = noise.noise2D(x / 16, y / 16);
  const letterValue = textNoise.noise2D(x / 16, y / 16);

  const letter = (() => {
    if (value < 0) {
      return pathModel;
    }
    if (value < 0.4) {
      return chooseWithNoise(biome.ambiance, letterValue);
    }
    return chooseWithNoise(biome.alphabet, letterValue);
  })();

  return {
    x,
    y,

    biome,
    value,
    letterValue,
    letter,

    isAlphabet: biome.uniqueAlphabet.includes(letter),
    isAlphabetOrRare: biome.alphabet.includes(letter) || Object.values(biome.rares).includes(letter),
    isRare: Object.values(biome.rares).includes(letter),
    isAmbiance: biome.ambiance.includes(letter),
    isPath: letter === pathModel,

    isStructureCandidate: value > structureValueThreshold,
    isPartOfStructure: false,
  };
}
