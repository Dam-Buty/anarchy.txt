import seedrandom from "seedrandom";
import murmurhash from "murmurhash";
import { chain, flatMap, mean, sumBy } from "lodash";
import { create } from "domain";
import chalk from "chalk";

import SimplexNoise = require("simplex-noise");

import {
  chunkHeight,
  chunkWidth,
  structureMargin,
  structureScoreThreshold,
  structureValueThreshold,
} from "../lib/constants";
import { chooseWithNoise, Coords, createMatrix, fill, getRectangle, isInRectangle, Rectangle } from "../lib/utils";
import { Cell, createCell, pathModel } from "./cell";
import { getBiome } from "./biome";
import { addStructures } from "./generations";
import { NoiseCollection } from "./map";

export type Chunk = {
  x: number;
  y: number;

  realX: number;
  realY: number;

  cells: Cell[][];
};

export function createChunk({ x, y }: Pick<Chunk, "x" | "y">, noise: NoiseCollection): Chunk {
  const startX = x * chunkWidth;
  const startY = y * chunkHeight;

  const structureCandidates: Coords[] = [];
  // Generate the base text layer
  const cells = createMatrix(chunkWidth, chunkHeight, (cellX, cellY) => {
    const cell = createCell({ x: cellX + startX, y: cellY + startY }, noise);
    if (cell.isStructureCandidate) {
      structureCandidates.push([cellX, cellY]);
    }
    return cell;
  });

  addStructures(cells, structureCandidates);

  return { x, y, realX: x * chunkWidth, realY: y * chunkHeight, cells };
}

export function getCell(chunk: Chunk, { x, y }: { x: number; y: number }): Cell {
  if (y < chunk.realY || y > chunk.realY + chunkHeight || x < chunk.realX || x > chunk.realX + chunkWidth) {
    throw new Error(`Cell [${x},${y}] out of bounds for chunk [${chunk.x},${chunk.y}]`);
  }

  const cellXInChunk = x - chunk.realX;
  const cellYInChunk = y - chunk.realY;

  return chunk.cells[cellYInChunk][cellXInChunk];
}
