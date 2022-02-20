import { chunkHeight, chunkWidth, structureMargin, structureValueThreshold } from "../lib/constants";
import { Cell } from "../lib/supabase";
import { Coords, createMatrix, isInRectangle } from "../lib/utils";
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
  console.log(`Generating chunk`, { x, y });
  const startX = x * chunkWidth;
  const startY = y * chunkHeight;

  const structureCandidates: Partial<Cell>[] = [];
  // Generate the base text layer
  const cells = createMatrix(chunkWidth, chunkHeight, (cellX, cellY) => {
    const cell = createCell({ x: cellX + startX, y: cellY + startY }, noise);
    // Check if this cell is a candidate to seed a structure
    if (cell.value > structureValueThreshold) {
      // It needs to be far enough from the borders of the chunk
      const hasSafeChunkMargin =
        cellX > structureMargin &&
        cellX < chunkWidth - structureMargin &&
        cellY > structureMargin &&
        cellY < chunkHeight - structureMargin;
      // And from any other structure candidate
      const hasSafeStructureMargin = !structureCandidates.find((structure) =>
        isInRectangle([cellX, cellY], {
          corner: [structure.x - structureMargin / 2, structure.y - structureMargin / 2],
          width: structureMargin,
          height: structureMargin,
        })
      );
      console.log(cellX, cellY, hasSafeChunkMargin, hasSafeStructureMargin);
      if (hasSafeChunkMargin && hasSafeStructureMargin) {
        structureCandidates.push(cell);
      }
    }
    return cell;
  });
  console.log(structureCandidates);
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
