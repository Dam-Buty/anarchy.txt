import { chunkHeight, chunkWidth } from "./constants";
import { Cell } from "./supabase";

export const directions = ["up", "down", "left", "right"] as const;
export type Direction = typeof directions[number];

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fill(size: number) {
  return {
    of<T>(value: T): T[] {
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
  return `${value}`;
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

export function mapMatrix<T, U>(matrix: T[][], callback: (element: T, local: Coords) => U): U[][] {
  return matrix.map((line, y) => line.map((cell, x) => callback(cell, [x, y])));
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

export function getRectangle<T>(array: T[][], rectangle: Rectangle): T[][] {
  // Normalize global coordinates to local coordinates
  const [globalX, globalY] = rectangle.corner;
  const localX = globalX % chunkWidth;
  const localY = globalY % chunkHeight;
  return array.slice(localY, localY + rectangle.height).map((line) => line.slice(localX, localX + rectangle.width));
}

export function moveViewport(direction: Direction, viewport: Cell[][], newSet: Cell[]): Cell[][] {
  switch (direction) {
    case "up":
      return [newSet, ...viewport.slice(0, -1)];
    case "right":
      return viewport.map((line, y) => [...line.slice(1), newSet[y]]);
    case "down":
      return [...viewport.slice(1), newSet];
    case "left":
      return viewport.map((line, y) => [newSet[y], ...line.slice(0, -1)]);
  }
}

export function spliceLine(direction: Direction, viewport: Cell[][], newSet: Cell[]): Cell[][] {
  switch (direction) {
    case "up":
      return [newSet, ...viewport.slice(1)];
    case "right":
      return viewport.map((line, y) => [...line.slice(0, -1), newSet[y]]);
    case "down":
      return [...viewport.slice(1), newSet];
    case "left":
      return viewport.map((line, y) => [newSet[y], ...line.slice(0, -1)]);
  }
}
