import murmurhash from "murmurhash";
import SimplexNoise from "simplex-noise";
import { Cell } from "./cell";
import { Chunk, createChunk, getCell } from "./chunk";
import { chunkCoordinates, coord, Coords, createMatrix } from "../lib/utils";

export type NoiseCollection = {
  base: SimplexNoise;
  text: SimplexNoise;
  technology: SimplexNoise;
  magic: SimplexNoise;
};

export type Map = {
  noise: NoiseCollection;

  chunks: Record<string, Record<string, Chunk>>;

  logs: string[];
};

export function combineSeeds(seed: string, bias: string) {
  const biasHash = murmurhash(bias);
  return seed
    .split("")
    .map((char) => char.charCodeAt(0) ^ biasHash)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
}

export function createMap(
  seed: string,
  { textBias, technologyBias, magicBias }: { textBias: string; technologyBias: string; magicBias: string }
): Map {
  const base = new SimplexNoise(seed);
  const text = new SimplexNoise(combineSeeds(seed, textBias));
  const technology = new SimplexNoise(combineSeeds(seed, technologyBias));
  const magic = new SimplexNoise(combineSeeds(seed, magicBias));

  return { noise: { base, text, technology, magic }, chunks: {}, logs: [] };
}

export function getOrGenerateChunk(map: Map, { x, y }: { x: number; y: number }): Chunk {
  // if (!map.chunks[coord(y)]) {
  //   map.chunks[coord(y)] = {};
  // }
  // if (!map.chunks[coord(y)][coord(x)]) {
  //   // mapLog(map, JSON.stringify({ x, y }));
  //   map.chunks[coord(y)][coord(x)] = createChunk({ x, y }, { noise: map.noise, textNoise: map.textNoise });
  // }
  // return map.chunks[coord(y)][coord(x)];
  try {
    if (!map.chunks[coord(y)]) {
      map.chunks[coord(y)] = {};
    }
    if (!map.chunks[coord(y)][coord(x)]) {
      // mapLog(map, JSON.stringify({ x, y }));
      map.chunks[coord(y)][coord(x)] = createChunk({ x, y }, map.noise);
    }
    return map.chunks[coord(y)][coord(x)];
  } catch (e) {
    console.error(e);
  }
}

export function getCellFromChunk(map: Map, { x, y }: { x: number; y: number }): Cell {
  const [chunkX, chunkY] = chunkCoordinates(x, y);

  const chunk = getOrGenerateChunk(map, { x: chunkX, y: chunkY });

  return getCell(chunk, { x, y });
}

export function getView(
  map: Map,
  { x, y, width, height }: { x: number; y: number; width: number; height: number }
): Cell[][] {
  return createMatrix(width, height, (cellX, cellY) => getCellFromChunk(map, { x: x + cellX, y: y + cellY }));
}

export function mapLog(map: Map, log: any) {
  map.logs.push(log);
}
