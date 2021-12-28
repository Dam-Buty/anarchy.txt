import SimplexNoise from "simplex-noise";
import { Biome } from "./biome";
import { structureThreshold } from "../lib/constants";
import { chooseWithNoise } from "../lib/utils";

const pathModel = " ";

export type Cell = {
  x: number;
  y: number;

  letter: string;
  value: number;

  biome: Biome;
};

export function isAlphabet({ biome, letter }: Cell) {
  return biome.uniqueAlphabet.includes(letter);
}

export function isAlphabetOrRare({ biome, letter }: Cell) {
  return biome.alphabet.includes(letter) || Object.values(biome.rares).includes(letter);
}

export function isRare({ biome, letter }: Cell) {
  return Object.values(biome.rares).includes(letter);
}

export function isAmbiance({ biome, letter }: Cell) {
  return biome.ambiance.includes(letter);
}

export function isPath({ letter }: Cell) {
  return letter === pathModel;
}

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
    letter,
  };
}
