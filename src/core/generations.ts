import { chain, chunk, flatMap, sumBy } from "lodash";
import { chunkHeight, chunkWidth, structureMargin, structureScoreThreshold } from "../lib/constants";
import { chooseWithNoise, Coords, createMatrix, fill, getRectangle, isInRectangle, Rectangle } from "../lib/utils";
import { Cell, pathModel } from "./cell";

export function addStructures(cells: Cell[][], structureCandidates: Coords[]) {
  // Generate structures
  const structuresCache: Coords[] = [];
  structureCandidates
    // Filter out candidates that are too close to the border of the chunk
    .filter(
      ([x, y]) =>
        x > structureMargin &&
        x < chunkWidth - structureMargin &&
        y > structureMargin &&
        y < chunkHeight - structureMargin
    )
    // Filter candidates that are too close to other candidates
    .filter(([x, y]) => {
      if (
        structuresCache.find((structure) =>
          isInRectangle([x, y], {
            corner: [x - structureMargin / 2, y - structureMargin / 2],
            width: structureMargin,
            height: structureMargin,
          })
        )
      ) {
        return false;
      }
      structuresCache.push([x, y]);
      return true;
    })
    .forEach(([x, y]) => {
      const possibleStructures: [number, number][] = [
        [5, 7],
        [7, 5],
        [9, 6],
      ];

      // For each remaining candidate we'll try every possible structure, and pick the one with the highest coverage score
      const possibleStructure = chain(possibleStructures)
        .map(([width, height]) => {
          const corner: Coords = [x - Math.floor(width / 2), y - Math.floor(height / 2)];
          const rectangle = getRectangle(cells, { corner, width, height });

          return { width, height, corner, rectangle, score: sumBy(flatMap(rectangle), (cell) => cell.value) };
        })
        .maxBy("score")
        .value();
      const workingThreshold = possibleStructure.width * possibleStructure.height * structureScoreThreshold;

      if (possibleStructure.score > workingThreshold) {
        // Chose structure
        const cell = cells[y][x];

        const structure = chooseWithNoise(cell.biome.txt.lines, cell.letterValue);

        drawStructure(possibleStructure.rectangle, structure, {
          corner: possibleStructure.corner,
          width: possibleStructure.width,
          height: possibleStructure.height,
        });
      }
    });
}

export function getPossibleLettersForStructureCorner(cell: Cell, cornerLetter: string): string[] {
  if (cell.isPath) {
    return [...fill(5).of(pathModel), ...fill(2).of("."), ...fill(3).of(cornerLetter)];
  }
  if (cell.isAmbiance) {
    return [...fill(3).of(cell.letter), ...fill(7).of(cornerLetter)];
  }
  return [cornerLetter];
}

export function getPossibleLettersForStructureFrame(
  cell: Cell,
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
    return cell.biome.alphabet.ambiance;
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

export function drawStructure(cells: Cell[][], text: string, rectangle: Rectangle): Cell[][] {
  // Prepare the string for display in the rectangle
  const textLines = fitText(text, rectangle);

  return createMatrix(rectangle.width, rectangle.height, (x, y) => {
    const cell = cells[y][x];
    cell.isPartOfStructure = true;

    // Determine characters for this cell
    const possibleLetters = (() => {
      // Identify if this cell is part of the frame of the rectangle
      const frameLetters = getPossibleLettersForStructureFrame(cell, text, [x, y], rectangle);

      if (frameLetters?.length) {
        return frameLetters;
      }

      // Otherwise just pick the corresponding letter in the text lines
      const letterX = x - 1;
      const letterY = y - 1;
      const letter = textLines[letterY][letterX];
      const variant = cell.biome.alphabet.rares[letter] || letter;
      // Handle decay depending on the original type of the cell
      if (cell.isPath) {
        return [...fill(4).of(pathModel), ...fill(2).of("."), ...fill(3).of(variant), ...fill(1).of(letter)];
      }
      if (cell.isAmbiance) {
        return [...fill(4).of(cell.letter), ...fill(2).of(variant), ...fill(5).of(letter)];
      }
      return [...fill(27).of(letter), ...fill(1).of("."), ...fill(5).of(variant)];
    })();

    // Choose the letter with the right normalizer
    cell.letter = (() => {
      if (cell.isPath) {
        return chooseWithNoise(possibleLetters, cell.value, cell.biome.normalizers.path);
      }
      if (cell.isAmbiance) {
        return chooseWithNoise(possibleLetters, cell.value, cell.biome.normalizers.ambiance);
      }
      return chooseWithNoise(possibleLetters, cell.value, cell.biome.normalizers.letter);
    })();

    return cell;
  });
}
