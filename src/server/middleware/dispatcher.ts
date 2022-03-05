import { Request } from "restify";
import EventEmitter from "events";
import { Cell, Player } from "../../lib/supabase";
import { chunk, omit, partition, pick } from "lodash";

export const dispatcher = new EventEmitter();

const k = () => Math.floor(Math.random() * 1000);

dispatcher.on("cells", async ({ req, cells }: { req: Request; cells: Cell[] }) => {
  const i = k();
  console.time(`persisting ${cells.length} cells ${i}`);

  const [updates, inserts] = partition(cells, (cell) => !!cell.id);
  for (const chunkCells of chunk(inserts, 1000)) {
    console.log(`Inserting ${chunkCells.length} cells`);
    await req.from("cell").insert(
      chunkCells.map((cell) => ({
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
    );
  }
  for (const cell of updates) {
    console.log(`Updating cell ${cell.id}`);
    await req
      .from("cell")
      .update({ ...pick(cell, ["letter", "health", "isNatural", "placedAt", "placedById"]) })
      .eq("id", cell.id);
  }
  console.timeEnd(`persisting ${cells.length} cells ${i}`);
});

dispatcher.on("player", async ({ req, player }: { req: Request; player: Player }) => {
  await req.from("player").update({ x: player.x, y: player.y }).match({ id: player.id });
});
