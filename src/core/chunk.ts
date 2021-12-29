import seedrandom from "seedrandom";
import murmurhash from "murmurhash";
import { mean } from "lodash";
import { create } from "domain";
import chalk from "chalk";

import SimplexNoise = require("simplex-noise");

import { txt, rares, ambiance } from "../biomes/hollowmen";
import { chunkHeight, chunkWidth, structureThreshold } from "../lib/constants";
import { createMatrix } from "../lib/utils";
import { Cell, createCell } from "./cell";
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

  // Generate the base text layer
  const cells = createMatrix(chunkWidth, chunkHeight, (cellX, cellY) =>
    createCell({ x: cellX + startX, y: cellY + startY, biome }, { noise, textNoise })
  );

  // Generate structures

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
