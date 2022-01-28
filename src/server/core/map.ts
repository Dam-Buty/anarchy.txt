import murmurhash from "murmurhash";
import SimplexNoise from "simplex-noise";
import { Request } from "restify";
import { Chunk, generateChunk } from "./chunk";
import { chunkCoordinates } from "../../lib/utils";
import { chain, chunk, isEqual } from "lodash";
import { Cell } from "../supabase";

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

// export function getOrGenerateChunk(map: Map, { x, y }: { x: number; y: number }): Chunk {
//   // if (!map.chunks[coord(y)]) {
//   //   map.chunks[coord(y)] = {};
//   // }
//   // if (!map.chunks[coord(y)][coord(x)]) {
//   //   // mapLog(map, JSON.stringify({ x, y }));
//   //   map.chunks[coord(y)][coord(x)] = createChunk({ x, y }, { noise: map.noise, textNoise: map.textNoise });
//   // }
//   // return map.chunks[coord(y)][coord(x)];
//   try {
//     if (!map.chunks[coord(y)]) {
//       map.chunks[coord(y)] = {};
//     }
//     if (!map.chunks[coord(y)][coord(x)]) {
//       // mapLog(map, JSON.stringify({ x, y }));
//       console.time("createChunk");
//       map.chunks[coord(y)][coord(x)] = createChunk({ x, y }, map.noise);
//       console.timeEnd("createChunk");
//     }
//     return map.chunks[coord(y)][coord(x)];
//   } catch (e) {
//     console.error(e);
//   }
// }

// export function getCellFromChunk(map: Map, { x, y }: { x: number; y: number }): Cell {
//   const [chunkX, chunkY] = chunkCoordinates(x, y);

//   const chunk = getOrGenerateChunk(map, { x: chunkX, y: chunkY });

//   return getCell(chunk, { x, y });
// }

// Generate any needed chunks to render that view
async function checkView(
  req: Request,
  { x: startX, y: startY, width, height }: { x: number; y: number; width: number; height: number }
) {
  console.log(`Checking viewport at ${startX}/${startY}`);
  // Get the 4 corner cells of the view
  const { data: cornerCells } = await req.supabase.rpc<Cell>("get_corners", {
    startx: startX,
    starty: startY,
    width,
    height,
  });

  // Missing corner cells indicate ungenerated chunks
  if (cornerCells.length < 4) {
    const corners = chain([
      [startX, startY],
      [startX + width - 1, startY],
      [startX + width - 1, startY + height - 1],
      [startX, startY + height - 1],
    ])
      .filter(
        ([x, y]) =>
          !cornerCells.find((cell) => {
            cell.x === x && cell.y === y;
          })
      )
      .map(([x, y]) => chunkCoordinates(x, y))
      .uniqWith(isEqual)
      .value();

    for (const [x, y] of corners) {
      const chunk = await generateChunk({ x, y }, req.map.noise);

      const { error } = await req.from("cell").insert(
        chunk.cells.flat().map((cell) => ({
          x: cell.x,
          y: cell.y,
          value: cell.value,
          letterValue: cell.letterValue,
          letter: cell.letter,
          biomeName: cell.biomeName,
          health: cell.health,
          isNatural: cell.isNatural,
          isPartOfStructure: cell.isPartOfStructure,
        }))
      );

      console.log(error);
    }
  }
}

export async function getView(
  req: Request,
  { x: startX, y: startY, width, height }: { x: number; y: number; width: number; height: number }
): Promise<Cell[][]> {
  await checkView(req, { x: startX, y: startY, width, height });
  console.log(`Getting viewport at ${startX}/${startY}`);

  const { data: cells, error } = await req.supabase.rpc<Cell>("get_rectangle", {
    startx: startX,
    starty: startY,
    width,
    height,
  });

  return chunk(cells, width);
}

export function mapLog(map: Map, log: any) {
  map.logs.push(log);
}
