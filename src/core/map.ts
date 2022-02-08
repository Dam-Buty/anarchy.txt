import murmurhash from "murmurhash";
import SimplexNoise from "simplex-noise";
import { Request } from "restify";
import { generateChunk } from "./chunk";
import { chunkCoordinates, createMatrix } from "../lib/utils";
import { chain, chunk, isEqual, map } from "lodash";
import { Cell } from "../lib/supabase";

export type NoiseCollection = {
  base: SimplexNoise;
  text: SimplexNoise;
  technology: SimplexNoise;
  magic: SimplexNoise;
};

export type Map = {
  noise: NoiseCollection;

  cells: Record<string, Record<string, Partial<Cell>>>;

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

  return { noise: { base, text, technology, magic }, cells: {}, logs: [] };
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
async function generateView(
  req: Request,
  { x: startX, y: startY, width, height }: { x: number; y: number; width: number; height: number }
) {
  console.log(`Checking viewport`, { x: startX, y: startY, width, height });

  // Get the 4 corner cells of the view
  console.time("get corners");
  const { data: cornerCells, error } = await req.rpc("get_corners", {
    startx: startX,
    starty: startY,
    width,
    height,
  });
  console.timeEnd("get corners");

  const expectedCorners = width === 1 || height === 1 ? 2 : 4;

  // Missing corner cells indicate ungenerated chunks
  if (cornerCells.length < expectedCorners) {
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

    console.log(`Generating chunks`, corners);

    for (const [x, y] of corners) {
      console.time("generate chunk");
      const chunk = await generateChunk({ x, y }, req.map.noise);
      console.timeEnd("generate chunk");

      console.time("cache cells");
      chunk.cells.flat().forEach((cell) => {
        setCell(req, cell);
      });
      console.timeEnd("cache cells");

      console.time("insert cells");
      req.stackPromise(
        new Promise((resolve, reject) => {
          req
            .from("cell")
            .insert(
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
              })),
              { returning: "minimal" }
            )
            .then(
              () => {
                resolve(null);
              },
              (reason) => {
                reject(reason);
              }
            );
        })
      );
      console.timeEnd("insert cells");
    }
  }
}

function getCell(req: Request, { x, y }: { x: number; y: number }) {
  if (!req.map.cells[y]) {
    req.map.cells[y] = {};
  }
  return req.map.cells[y][x] || null;
}

function setCell(req: Request, cell: Partial<Cell>) {
  if (!req.map.cells[cell.y]) {
    req.map.cells[cell.y] = {};
  }
  req.map.cells[cell.y][cell.x] = cell;
}

function getRectangleFromCache(
  req: Request,
  { x: startX, y: startY, width, height }: { x: number; y: number; width: number; height: number }
): {
  cacheMiss: boolean;
  cells: Partial<Cell>[][];
} {
  let cacheMiss = false;

  const cells = createMatrix(width, height, (x, y) => {
    const cell = getCell(req, { x: startX + x, y: startY + y });

    if (!cell) {
      cacheMiss = true;
      return null;
    }
    return cell;
  });

  return { cacheMiss, cells };
}

export async function getView(
  req: Request,
  { x: startX, y: startY, width, height }: { x: number; y: number; width: number; height: number }
): Promise<Partial<Cell>[][]> {
  console.log(`Getting from cache`, { x: startX, y: startY, width, height });

  console.time("get from cache");
  const { cacheMiss: cacheMissFromCache, cells: cellsFromCache } = getRectangleFromCache(req, {
    x: startX,
    y: startY,
    width,
    height,
  });
  console.timeEnd("get from cache");

  if (!cacheMissFromCache) {
    console.log("Got the whole thing from cache 1st try !");
    return cellsFromCache;
  }

  console.time("generate view");
  await generateView(req, { x: startX, y: startY, width, height });
  console.timeEnd("generate view");

  console.time("reget from cache");
  const { cells: cellsFromGenerated, cacheMiss: cacheMissFromGenerated } = getRectangleFromCache(req, {
    x: startX,
    y: startY,
    width,
    height,
  });
  console.timeEnd("reget from cache");

  if (!cacheMissFromGenerated) {
    console.log("Got the whole thing from cache 2nd try !");
    return cellsFromGenerated;
  }

  console.time("fetch view");
  const { data: cells, error } = await req.supabase.rpc<Cell>("get_rectangle", {
    startx: startX,
    starty: startY,
    width,
    height,
  });
  console.timeEnd("fetch view");

  console.time("cache cells");
  cells.forEach((cell) => {
    setCell(req, cell);
  });
  console.timeEnd("cache cells");

  return chunk(cells, width);
}

export function mapLog(map: Map, log: any) {
  map.logs.push(log);
}
