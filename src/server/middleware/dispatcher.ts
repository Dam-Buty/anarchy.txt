import { Request } from "restify";
import EventEmitter from "events";
import { Cell, Player } from "../../lib/supabase";
import { chunk } from "lodash";

export const dispatcher = new EventEmitter();

const k = () => Math.floor(Math.random() * 1000);

dispatcher.on("cells", async ({ req, cells }: { req: Request; cells: Cell[] }) => {
  const i = k();
  console.time(`persisting ${cells.length} cells ${i}`);
  for (const chunkCells of chunk(cells, 1000)) {
    console.log(`Persisting ${chunkCells.length} cells`);
    // await req.from("cell").insert(
    //   chunkCells.map((cell) => ({
    //     x: cell.x,
    //     y: cell.y,
    //     value: cell.value,
    //     letterValue: cell.letterValue,
    //     letter: cell.letter,
    //     biomeName: cell.biomeName,
    //     health: cell.health,
    //     isNatural: cell.isNatural,
    //     isPartOfStructure: cell.isPartOfStructure,
    //   })),
    //   { returning: "minimal" }
    // );
  }
  console.timeEnd(`persisting ${cells.length} cells ${i}`);
});

dispatcher.on("player", async ({ req, player }: { req: Request; player: Player }) => {
  await req.from("player").update({ x: player.x, y: player.y }).match({ id: player.id });
});
