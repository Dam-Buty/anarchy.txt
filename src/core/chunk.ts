import seedrandom from "seedrandom";
import murmurhash from "murmurhash";
import { chain, flatMap, mean, sumBy } from "lodash";
import { create } from "domain";
import chalk from "chalk";

import SimplexNoise = require("simplex-noise");

import { txt, rares, ambiance } from "../biomes/hollowmen";
import {
  chunkHeight,
  chunkWidth,
  structureMargin,
  structureScoreThreshold,
  structureValueThreshold,
} from "../lib/constants";
import { chooseWithNoise, Coords, createMatrix, fill, isInRectangle, Rectangle } from "../lib/utils";
import { ambianceNormalizer, Cell, createCell, letterNormalizer, pathModel, pathNormalizer } from "./cell";
import { createBiome } from "./biome";

export type Chunk = {
  x: number;
  y: number;

  realX: number;
  realY: number;

  cells: Cell[][];
};

export function createChunk(
  { x, y }: Pick<Chunk, "x" | "y">,
  { noise, textNoise }: { noise: SimplexNoise; textNoise: SimplexNoise }
): Chunk {
  const startX = x * chunkWidth;
  const startY = y * chunkHeight;

  const biome = createBiome({ txt, ambiance, rares });

  const structureCandidates: Coords[] = [];
  // Generate the base text layer
  const cells = createMatrix(chunkWidth, chunkHeight, (cellX, cellY) => {
    const cell = createCell({ x: cellX + startX, y: cellY + startY, biome }, { noise, textNoise });
    if (cell.isStructureCandidate) {
      structureCandidates.push([cellX, cellY]);
    }
    return cell;
  });

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

      // Choose the potential structure with the best coverage score
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

        const structure = chooseWithNoise(cell.biome.lines, cell.letterValue);

        drawStructure(possibleStructure.rectangle, structure, {
          corner: possibleStructure.corner,
          width: possibleStructure.width,
          height: possibleStructure.height,
        });
      }
    });

  return { x, y, realX: x * chunkWidth, realY: y * chunkHeight, cells };
}

export function drawStructure(cells: Cell[][], text: string, rectangle: Rectangle): Cell[][] {
  // const frame = ["⺁", "⺄", "ㅢ", "⻌"];
  const frame = ["┎", "┑", "╝", "╘"];
  let cursor = 0;
  return createMatrix(rectangle.width, rectangle.height, (x, y) => {
    const cell = cells[y][x];
    cell.isPartOfStructure = true;

    // Determine characters for this cell
    const possibleLetters = (() => {
      // Resolve corners
      if (x === 0 && y === 0) {
        if (cell.isPath) {
          return [...fill(5).of(pathModel), ...fill(2).of("."), ...fill(3).of(frame[0])];
        }
        if (cell.isAmbiance) {
          return [...fill(5).of(cell.letter), ...fill(5).of(frame[0])];
        }
        return [frame[0]];
      }
      if (x === rectangle.width - 1 && y === 0) {
        if (cell.isPath) {
          return [...fill(5).of(pathModel), ...fill(2).of("."), ...fill(3).of(frame[1])];
        }
        if (cell.isAmbiance) {
          return [...fill(5).of(cell.letter), ...fill(5).of(frame[1])];
        }
        return [frame[1]];
      }
      if (x === rectangle.width - 1 && y === rectangle.height - 1) {
        if (cell.isPath) {
          return [...fill(5).of(pathModel), ...fill(2).of("."), ...fill(3).of(frame[2])];
        }
        if (cell.isAmbiance) {
          return [...fill(5).of(cell.letter), ...fill(5).of(frame[2])];
        }
        return [frame[2]];
      }
      if (x === 0 && y === rectangle.height - 1) {
        if (cell.isPath) {
          return [...fill(5).of(pathModel), ...fill(2).of("."), ...fill(3).of(frame[3])];
        }
        if (cell.isAmbiance) {
          return [...fill(5).of(cell.letter), ...fill(5).of(frame[3])];
        }
        return [frame[3]];
      }

      // The borders of the rectangle may be decorated with ambiance
      if (x === 0 || y === 0 || x === rectangle.width - 1 || y === rectangle.height - 1) {
        return cell.biome.ambiance;
      }

      // If the first character of a line is a space, skip it
      if (x === 1 && text[cursor] === " ") {
        cursor++;
      }

      // Resolve other letters
      const letter = text[cursor];
      cursor++;
      if (cursor > text.length) {
        cell.isPartOfStructure = false;
        return [...fill(3).of(cell.letter), ...fill(3).of("."), cell.letter];
      }
      const variant = cell.biome.rares[letter] || letter;
      if (cell.isPath) {
        return [...fill(4).of(pathModel), ...fill(2).of("."), ...fill(3).of(variant), ...fill(1).of(letter)];
      }
      if (cell.isAmbiance) {
        return [...fill(4).of(cell.letter), ...fill(3).of(variant), ...fill(3).of(letter)];
      }
      return [...fill(17).of(letter), ...fill(1).of("."), ...fill(5).of(variant)];
    })();

    cell.letter = (() => {
      if (cell.isPath) {
        return chooseWithNoise(possibleLetters, cell.value, pathNormalizer);
      }
      if (cell.isAmbiance) {
        return chooseWithNoise(possibleLetters, cell.value, ambianceNormalizer);
      }
      return chooseWithNoise(possibleLetters, cell.value, letterNormalizer);
    })();

    return cell;
  });
}

export function getRectangle<T>(cells: T[][], rectangle: Rectangle): T[][] {
  const [x, y] = rectangle.corner;
  return cells.slice(y, y + rectangle.height).map((line) => line.slice(x, x + rectangle.width));
}

export function getCell(chunk: Chunk, { x, y }: { x: number; y: number }): Cell {
  if (y < chunk.realY || y > chunk.realY + chunkHeight || x < chunk.realX || x > chunk.realX + chunkWidth) {
    throw new Error(`Cell [${x},${y}] out of bounds for chunk [${chunk.x},${chunk.y}]`);
  }

  const cellXInChunk = x - chunk.realX;
  const cellYInChunk = y - chunk.realY;

  return chunk.cells[cellYInChunk][cellXInChunk];
}
