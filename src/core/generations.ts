import { chain, chunk, flatMap, sumBy } from "lodash";
import { chunkHeight, chunkWidth, structureMargin, structureScoreThreshold } from "../lib/constants";
import { Cell } from "../lib/supabase";
import { chooseWithNoise, Coords, createMatrix, fill, getRectangle, isInRectangle, Rectangle } from "../lib/utils";
import { Biome, biomeCache } from "./biome";
import { isAmbiance, isPath, pathModel } from "./cell";

export function addStructures(cells: Partial<Cell>[][], structureCandidates: Partial<Cell>[]) {
  chain(structureCandidates)
    .sortBy((cell) => cell.value)
    .forEach((cell) => {
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

      drawStructure(rectangleCells, normalizedStructure.join("\n"), rectangle);
    });
}

export function getPossibleLettersForStructureCorner(cell: Partial<Cell>, cornerLetter: string): string[] {
  if (isPath(cell)) {
    return [...fill(5).of(pathModel), ...fill(2).of("."), ...fill(3).of(cornerLetter)];
  }
  if (isAmbiance(cell)) {
    return [...fill(3).of(cell.letter), ...fill(7).of(cornerLetter)];
  }
  return [cornerLetter];
}

export function getPossibleLettersForStructureFrame(
  cell: Partial<Cell>,
  text: string,
  [x, y]: Coords,
  rectangle: Rectangle
): string[] | null {
  // const frame = ["⺁", "⺄", "ㅢ", "⻌"];
  const frame = ["┎", "┑", "╝", "╘"];

  // Resolve corners
  if (x === 0 && y === 0) {
    return getPossibleLettersForStructureCorner(cell, frame[0]);
  }
  if (x === rectangle.width - 1 && y === 0) {
    return getPossibleLettersForStructureCorner(cell, frame[1]);
  }
  if (x === rectangle.width - 1 && y === rectangle.height - 1) {
    return getPossibleLettersForStructureCorner(cell, frame[2]);
  }
  if (x === 0 && y === rectangle.height - 1) {
    return getPossibleLettersForStructureCorner(cell, frame[3]);
  }

  // The borders of the rectangle may be decorated with ambiance
  if (x === 0 || y === 0 || x === rectangle.width - 1 || y === rectangle.height - 1) {
    const biome = biomeCache[cell.biomeName];
    return biome.alphabet.ambiance;
  }

  return null;
}

export function fitText(text: string, rectangle: Rectangle): string[][] {
  const [usableWidth, usableHeight] = [rectangle.width - 2, rectangle.height - 2];

  if (text.length >= usableWidth * usableHeight) {
    return chunk(text.split(""), usableWidth).slice(0, usableHeight);
  }

  let paddedString = text;
  let additionalSpaces = usableWidth * usableHeight - text.length;
  // Pad between the words with spaces until there is no more room in the rectangle
  while (additionalSpaces > 0) {
    let tempString = "";
    if (paddedString.charAt(0) !== " ") {
      tempString = tempString.concat(" ");
      additionalSpaces--;
    }
    let waitForNextWord = false;
    paddedString.split("").forEach((char) => {
      tempString = tempString.concat(char);
      if (additionalSpaces > 0) {
        if (char === " ") {
          if (!waitForNextWord) {
            tempString = tempString.concat(char);
            additionalSpaces--;
            waitForNextWord = true;
          }
        } else {
          waitForNextWord = false;
        }
      }
    });
    if (additionalSpaces > 0 && tempString.charAt(tempString.length - 1) !== " ") {
      tempString = tempString.concat(" ");
      additionalSpaces--;
    }
    paddedString = tempString;
  }

  return chunk(paddedString.split(""), usableWidth).slice(0, usableHeight);
}

export function drawStructure(cells: Partial<Cell>[][], text: string, rectangle: Rectangle) {
  createMatrix(rectangle.width, rectangle.height, (x, y) => {
    const textLines = text.split("\n").map((line) => line.split(""));
    const cell = cells[y][x];
    const biome = biomeCache[cell.biomeName];
    cell.isPartOfStructure = true;

    // Determine characters for this cell
    const possibleLetters = (() => {
      // Otherwise just pick the corresponding letter in the text lines
      const letter = textLines[y][x];
      const variant = biome.alphabet.rares[letter] || letter;
      // Handle decay depending on the original type of the cell
      if (isPath(cell)) {
        return [...fill(4).of(pathModel), ...fill(2).of("."), ...fill(3).of(variant), ...fill(1).of(letter)];
      }
      if (isAmbiance(cell)) {
        return [...fill(4).of(cell.letter), ...fill(2).of(variant), ...fill(5).of(letter)];
      }
      return [...fill(27).of(letter), ...fill(1).of("."), ...fill(5).of(variant)];
    })();

    // Choose the letter from the options we have
    // You have to normalize the value otherwise you wouldn't be choosing from all the options
    // (for example all paths would have value < 0 so you'd only be choosing from the first half of the array)
    cell.letter = (() => {
      if (isPath(cell)) {
        return chooseWithNoise(possibleLetters, cell.value, biome.normalizers.path);
      }
      if (isAmbiance(cell)) {
        return chooseWithNoise(possibleLetters, cell.value, biome.normalizers.ambiance);
      }
      return chooseWithNoise(possibleLetters, cell.value, biome.normalizers.letter);
    })();

    return cell;
  });
}
