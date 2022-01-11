import SimplexNoise from "simplex-noise";
import { Biome, getBiome } from "./biome";
import { structureValueThreshold } from "../lib/constants";
import { chooseWithNoise, NormalizeOptions } from "../lib/utils";
import { NoiseCollection } from "./map";
import { addToInventory, Player } from "./player";
import { isNull } from "lodash";

export const pathModel = " ";

export type Cell = {
  x: number;
  y: number;

  health: number;

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

export function damage(player: Player, cell: Cell) {
  if (cell.isPath || cell.letter === " ") {
    return;
  }
  if (cell.isAmbiance) {
    cell.health -= 34;
  }
  if (cell.isAlphabet) {
    cell.health -= 25;
  }
  if (cell.isRare) {
    cell.health -= 20;
  }
  if (cell.health <= 0) {
    addToInventory(player, cell.letter);
    cell.health = 0;
    setLetter(cell, " ");
  }
}

export function setLetter(cell: Cell, letter: string, natural?: false) {
  const { biome } = cell;
  cell.letter = letter;

  cell.isAlphabet = biome.alphabet.unique.includes(letter);
  cell.isAlphabetOrRare =
    biome.alphabet.unique.includes(letter) || Object.values(biome.alphabet.rares).includes(letter);
  cell.isRare = Object.values(biome.alphabet.rares).includes(letter);
  cell.isAmbiance = biome.alphabet.ambiance.includes(letter);
  cell.isPath = letter === pathModel;

  cell.health = 100;
}

export function place(player: Player, cell: Cell): boolean {
  if (!player.inInventory || player.inventory.length <= player.hand) {
    return false;
  }
  setLetter(cell, player.inventory[player.hand].letter);

  player.inventory[player.hand].stack--;
  if (player.inventory[player.hand].stack <= 0) {
    player.inventory.splice(player.hand, 1);
    player.hand = Math.min(player.hand, player.inventory.length);
  }

  return true;
}

export function createCell({ x, y }: Pick<Cell, "x" | "y">, noise: NoiseCollection): Cell {
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
