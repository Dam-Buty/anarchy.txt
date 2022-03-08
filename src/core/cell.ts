import { Cell } from "../lib/supabase";
import { chooseWithNoise } from "../lib/utils";
import { Biome, biomeCache, getBiome } from "./biome";
import { NoiseCollection } from "./map";

export const pathModel = " ";

function biomeChecker(cb: (biome: Biome, letter: string) => boolean) {
  return (cell: Partial<Cell>) => {
    const biome: Biome = biomeCache[cell.biomeName];
    return cb(biome, cell.letter);
  };
}

export const isAlphabet = biomeChecker((biome, letter) => biome.alphabet.unique.includes(letter));
export const isAlphabetOrRare = biomeChecker(
  (biome, letter) => biome.alphabet.unique.includes(letter) || Object.values(biome.alphabet.rares).includes(letter)
);
export const isRare = biomeChecker((biome, letter) => Object.values(biome.alphabet.rares).includes(letter));
export const isAmbiance = biomeChecker((biome, letter) => biome.alphabet.ambiance.includes(letter));

export const isPath = ({ letter }: Partial<Cell>) => letter === pathModel;
export const isWalkable = ({ letter }: Partial<Cell>) => [pathModel, " "].includes(letter);

export function createCell({ x, y }: Pick<Cell, "x" | "y">, noise: NoiseCollection): Partial<Cell> {
  const biome = getBiome({ x, y }, noise);

  const value = noise.base.noise2D(x / biome.parameters.scaleFactor.x, y / biome.parameters.scaleFactor.y);
  const letterValue = noise.text.noise2D(x / biome.parameters.scaleFactor.x, y / biome.parameters.scaleFactor.y);

  const letter = (() => {
    if (value < biome.parameters.pathCeiling) {
      return pathModel;
    }
    if (value < biome.parameters.ambianceCeiling) {
      return chooseWithNoise(biome.alphabet.ambiance, letterValue);
    }
    const chosenLetter = chooseWithNoise(biome.alphabet.full, letterValue);
    if (value > biome.parameters.rareFloor && biome.alphabet.rares[chosenLetter]) {
      return biome.alphabet.rares[chosenLetter];
    }
    return chosenLetter;
  })();

  return {
    x,
    y,

    health: 100,

    biomeName: biome.name,
    value,
    letterValue,
    letter,

    isNatural: true,

    isPartOfStructure: false,
  };
}
