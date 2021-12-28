import { chunkHeight, chunkWidth } from "./constants";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fill(size: number) {
  return {
    of(value: any) {
      return Array(size).fill(value);
    },
  };
}

export function chooseWithNoise<T>(array: T[], value: number) {
  const normalizedValue = (value + 1) / 2;
  return array[Math.round(normalizedValue * (array.length - 1))];
}

export function chunkCoordinates(
  x: number,
  y: number
): { chunkX: number; chunkY: number; cellXInChunk: number; cellYInChunk: number } {
  const chunkX = Math.floor(x / chunkWidth);
  const chunkY = Math.floor(y / chunkHeight);
  return {
    chunkX,
    chunkY,
    cellXInChunk: x - chunkX,
    cellYInChunk: y - chunkY,
  };
}

export function coord(value: number) {
  return Symbol.for(`${value}`);
}

export type Coords = [number, number];

export function createMatrix<T>(width: number, height: number, callback: (x, y) => T): T[][] {
  return Array(height)
    .fill(null)
    .map((_, cellY) =>
      Array(width)
        .fill(null)
        .map((__, cellX) => callback(cellX, cellY))
    );
}
