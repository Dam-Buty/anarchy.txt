import seedrandom from "seedrandom";
import murmurhash from "murmurhash";
import { mean } from "lodash";
import { create } from "domain";
import chalk from "chalk";

import SimplexNoise = require("simplex-noise");

import { txt, rares, ambiance } from "../biomes/hollowmen";
import { chunkHeight, chunkWidth, structureThreshold } from "../lib/constants";
import { chunkCoordinates, coord, createMatrix } from "../lib/utils";
import { Cell, createCell } from "./cell";
import { createBiome } from "./biome";

// World seed

// Chunk seed
//

// export type RNG = {
//   seed: string;
//   prng: ReturnType<seedrandom>;

//   choice: <T>(values: T[]) => T;
//   shuffleArray: <T>(values: T[]) => T[];
//   floatArray: (size: number) => number[];
// };

// export function createRNG(seed: string): RNG {
//   const prng = seedrandom(seed);
//   return {
//     seed,
//     prng,

//     choice<T>(values: T[]): T {
//       return values[Math.floor(prng() * values.length)];
//     },

//     shuffleArray<T>(array: T[]): T[] {
//       const newArray = [...array];

//       for (let i = newArray.length - 1; i > 0; i--) {
//         const j = Math.floor(prng() * (i + 1));
//         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
//       }

//       return newArray;
//     },

//     floatArray(size: number) {
//       return Array(size)
//         .fill(null)
//         .map((_) => {
//           return prng();
//         });
//     },
//   };
// }

// const baseRNG = createRNG(worldSeed);
// const baseNoise = new SimplexNoise(worldSeed);
// const textNoise = new SimplexNoise(textSeed);

export type Chunk = {
  x: number;
  y: number;

  realX: number;
  realY: number;

  cells: Cell[][];
};

// function getColor(value: number) {
//   return chooseWithNoise([chalk.red, chalk.green, chalk.yellow, chalk.yellowBright, chalk.white], value);
// }

export function createChunk(
  { x, y }: Pick<Chunk, "x" | "y">,
  { noise, textNoise }: { noise: SimplexNoise; textNoise: SimplexNoise }
): Chunk {
  const startX = x * chunkWidth;
  const startY = y * chunkHeight;

  const biome = createBiome({ txt, ambiance, rares });

  // Generate the base text layer
  const cells = createMatrix(chunkWidth, chunkHeight, (x, y) => createCell({ x, y, biome }, { noise, textNoise }));

  return { x, y, realX: x * chunkWidth, realY: y * chunkHeight, cells };
}

export function getCell(chunk: Chunk, { x, y }: { x: number; y: number }): Cell {
  if (y < chunk.realY || y > chunk.realY + chunkHeight || x < chunk.realX || x > chunk.realX + chunkWidth) {
    throw new Error(`Cell [${x},${y}] out of bounds for chunk [${chunk.x},${chunk.y}]`);
  }
  const { cellXInChunk, cellYInChunk } = chunkCoordinates(x, y);

  return chunk.cells[cellYInChunk][cellXInChunk];
}
