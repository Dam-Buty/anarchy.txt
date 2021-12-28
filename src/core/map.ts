import { chain } from "lodash";
import murmurhash from "murmurhash";
import SimplexNoise from "simplex-noise";
import { Cell } from "./cell";
import { Chunk, createChunk, getCell } from "./chunk";
import { chunkCoordinates, coord, Coords, createMatrix } from "../lib/utils";

export type Map = {
  seed: string;
  noise: SimplexNoise;

  textBias: string;
  textNoise: SimplexNoise;

  chunks: Record<symbol, Record<symbol, Chunk>>;
};

export function combineSeeds(seed: string, bias: string) {
  const biasHash = murmurhash(bias);
  return seed
    .split("")
    .map((char) => char.charCodeAt(0) ^ biasHash)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
}

export function createMap(seed: string, { textBias }: { textBias: string }): Map {
  const noise = new SimplexNoise(seed);
  const textNoise = new SimplexNoise(combineSeeds(seed, textBias));

  return { seed, noise, textBias, textNoise, chunks: {} };
}

export function getOrGenerateChunk(map: Map, { x, y }: { x: number; y: number }): Chunk {
  try {
    if (!map.chunks[coord(y)]) {
      map.chunks[coord(y)] = {};
    }
    if (!map.chunks[coord(y)][coord(x)]) {
      map.chunks[coord(y)][coord(x)] = createChunk({ x, y }, { noise: map.noise, textNoise: map.textNoise });
    }
    return map.chunks[coord(y)][coord(x)];
  } catch (e) {
    console.error(x, y, map.chunks[coord(y)]);
  }
}

export function getCellFromChunk(map: Map, { x, y }: { x: number; y: number }): Cell {
  const { chunkX, chunkY } = chunkCoordinates(x, y);

  const chunk = getOrGenerateChunk(map, { x: chunkX, y: chunkY });

  return getCell(chunk, { x, y });
}

export function getView(
  map: Map,
  { x, y, width, height }: { x: number; y: number; width: number; height: number }
): Cell[][] {
  return createMatrix(width, height, (cellX, cellY) => getCellFromChunk(map, { x: x + cellX, y: y + cellY }));
}
