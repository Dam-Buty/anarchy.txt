import { chunkHeight, chunkWidth, structureValueThreshold } from "../lib/constants";
import { Coords, createMatrix } from "../lib/utils";
import { Cell } from "../server/supabase";
import { createCell } from "./cell";
import { addStructures } from "./generations";
import { NoiseCollection } from "./map";

export type Chunk = {
  x: number;
  y: number;

  realX: number;
  realY: number;

  cells: Partial<Cell>[][];
};

export async function generateChunk({ x, y }: Pick<Chunk, "x" | "y">, noise: NoiseCollection): Promise<Chunk> {
  console.log(`Generating chunk ${x}/${y}`);
  const startX = x * chunkWidth;
  const startY = y * chunkHeight;

  const structureCandidates: Coords[] = [];
  // Generate the base text layer
  const cells = createMatrix(chunkWidth, chunkHeight, (cellX, cellY) => {
    const cell = createCell({ x: cellX + startX, y: cellY + startY }, noise);
    if (cell.value > structureValueThreshold) {
      structureCandidates.push([cellX, cellY]);
    }
    return cell;
  });

  addStructures(cells, structureCandidates);

  return { x, y, realX: x * chunkWidth, realY: y * chunkHeight, cells };
}

// export function getCell(chunk: Chunk, { x, y }: { x: number; y: number }): Cell {
//   if (y < chunk.realY || y > chunk.realY + chunkHeight || x < chunk.realX || x > chunk.realX + chunkWidth) {
//     throw new Error(`Cell [${x},${y}] out of bounds for chunk [${chunk.x},${chunk.y}]`);
//   }

//   const cellXInChunk = x - chunk.realX;
//   const cellYInChunk = y - chunk.realY;

//   return chunk.cells[cellYInChunk][cellXInChunk];
// }
