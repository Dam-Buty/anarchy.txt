import { Biome, biomeCache, getBiome } from "./biome";
import { chooseWithNoise } from "../lib/utils";
import { NoiseCollection } from "./map";
import { Cell } from "../lib/supabase";

export const pathModel = " ";

// export type Cell = {
//   x: number;
//   y: number;

//   health: number;

//   value: number;
//   letterValue: number;

//   letter: string;

//   isAlphabet: boolean;
//   isAlphabetOrRare: boolean;
//   isRare: boolean;
//   isAmbiance: boolean;
//   isPath: boolean;
//   isNatural: boolean;

//   isStructureCandidate: boolean;
//   isPartOfStructure: boolean;

//   biomeName: BiomeName;
// };

// export function damage(player: Player, cell: Cell) {
//   if (cell.isPath || cell.letter === " ") {
//     return;
//   }
//   if (cell.isAmbiance) {
//     cell.health -= 34;
//   }
//   if (cell.isAlphabet) {
//     cell.health -= 25;
//   }
//   if (cell.isRare) {
//     cell.health -= 20;
//   }
//   if (cell.health <= 0) {
//     addToInventory(player, cell.letter);
//     cell.health = 0;
//     setLetter(cell, " ");
//   }
// }

// export function setLetter(cell: Cell, letter: string, natural: boolean = false) {
//   const biome = biomeCache[cell.biomeName];
//   cell.letter = letter;

//   cell.isAlphabet = biome.alphabet.unique.includes(letter);
//   cell.isAlphabetOrRare =
//     biome.alphabet.unique.includes(letter) || Object.values(biome.alphabet.rares).includes(letter);
//   cell.isRare = Object.values(biome.alphabet.rares).includes(letter);
//   cell.isAmbiance = biome.alphabet.ambiance.includes(letter);
//   cell.isPath = letter === pathModel;
//   cell.isNatural = natural;

//   cell.health = 100;
// }

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
export const isPath = (cell) => cell.letter === pathModel;
export const isWalkable = (cell: Cell) => {
  return [pathModel, " "].includes(cell.letter);
};

// export function place(player: Player, cell: Cell): boolean {
//   if (!player.inInventory || player.inventory.length <= player.hand) {
//     return false;
//   }
//   setLetter(cell, player.inventory[player.hand].letter);

//   player.inventory[player.hand].stack--;
//   if (player.inventory[player.hand].stack <= 0) {
//     player.inventory.splice(player.hand, 1);
//     player.hand = Math.min(player.hand, player.inventory.length);
//   }

//   return true;
// }

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
