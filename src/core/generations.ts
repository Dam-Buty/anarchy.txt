import { chain, chunk, flatMap, sortBy, sumBy } from "lodash";
import { chunkHeight, chunkWidth, structureMargin, structureScoreThreshold } from "../lib/constants";
import { Cell } from "../lib/supabase";
import {
  chooseWithNoise,
  Coords,
  createMatrix,
  fill,
  getRectangle,
  isInRectangle,
  mapMatrix,
  Rectangle,
} from "../lib/utils";
import { Biome, biomeCache } from "./biome";
import { isAmbiance, isPath, pathModel } from "./cell";

export function addStructures(cells: Partial<Cell>[][], structureCandidates: Partial<Cell>[]) {
  sortBy(structureCandidates, (cell) => cell.value).forEach((cell) => {
    const biome: Biome = biomeCache[cell.biomeName];

    const structure = chooseWithNoise(biome.txt.structures, cell.letterValue);

    // Normalize the structure by ensuring it is a full rectangle
    const width = Math.max(...structure.split("\n").map((line) => line.length));
    const normalizedStructure = structure.split("\n").map((line) => line.padEnd(width, pathModel));

    const rectangle: Rectangle = {
      corner: [cell.x - Math.floor(width / 2), cell.y - Math.floor(normalizedStructure.length / 2)],
      width,
      height: normalizedStructure.length,
    };

    const rectangleCells = getRectangle(cells, rectangle);

    drawStructure(rectangleCells, normalizedStructure.join("\n"));
  });
}

export function drawStructure(cells: Partial<Cell>[][], text: string) {
  mapMatrix(cells, (cell, [localX, localY]) => {
    const textLines = text.split("\n").map((line) => Array.from(line));
    const biome = biomeCache[cell.biomeName];
    cell.isPartOfStructure = true;

    // Determine characters for this cell
    const possibleLetters = (() => {
      // Otherwise just pick the corresponding letter in the text lines
      const letter = textLines[localY][localX];
      const variant = biome.alphabet.rares[letter] || letter;

      // Handle decay depending on the original type of the cell
      if (isPath(cell)) {
        return [...fill(4).of(cell.letter), ...fill(2).of("."), ...fill(3).of(variant), ...fill(1).of(letter)];
      }
      if (isAmbiance(cell)) {
        return [...fill(4).of(cell.letter), ...fill(2).of(variant), ...fill(5).of(letter)];
      }
      return [...fill(27).of(letter), ...fill(1).of("."), ...fill(5).of(variant)];
    })();

    cell.letter = chooseWithNoise(possibleLetters, cell.letterValue);

    return cell;
  });
}
