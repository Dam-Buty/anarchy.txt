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

export type NormalizeOptions = {
  min: number;
  max: number;
};

export function chooseWithNoise<T>(array: T[], value: number, { min, max }: NormalizeOptions = { min: -1, max: 1 }) {
  const normalizedValue = (value - min) / (max - min);
  return array[Math.round(normalizedValue * (array.length - 1))];
}

export function chunkCoordinates(x: number, y: number): [number, number] {
  const chunkX = Math.floor(x / chunkWidth);
  const chunkY = Math.floor(y / chunkHeight);
  return [chunkX, chunkY];
}

export function coord(value: number) {
  return Symbol.for(`${value}`);
}

export type Coords = [number, number];

export function createMatrix<T>(width: number, height: number, callback: (x: number, y: number) => T): T[][] {
  return Array(height)
    .fill(null)
    .map((_, cellY) =>
      Array(width)
        .fill(null)
        .map((__, cellX) => callback(cellX, cellY))
    );
}

export type Rectangle = { corner: Coords; width: number; height: number };

export function isInRectangle(
  [pointX, pointY]: Coords,
  { corner: [rectangleX, rectangleY], width, height }: Rectangle
) {
  const maxX = rectangleX + width - 1;
  const maxY = rectangleY + height - 1;

  return pointX >= rectangleX && pointX <= maxX && pointY >= rectangleY && pointY <= maxY;
}
