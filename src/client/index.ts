import readline from "readline";
import fetch from "node-fetch";

import { Direction, directions, moveViewport } from "../lib/utils";

import { render } from "./render";
import { Cell, Player } from "../lib/supabase";
import { fetchPlayer, fetchView, rpc } from "./supabase";
import { playerOffset } from "../lib/constants";
import { chunk } from "lodash";
import { access_token } from "./jwt.json";
import { host, viewportHeight, viewportWidth } from "./constants";

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let dirty = false;
let loading = false;

export type Viewport = {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  cells: Cell[][];
};

export type PlayerWithViewport = Player & { viewport: Viewport };

async function refresh() {
  loading = true;
  const playerfromDb = await fetchPlayer();
  const cells = await fetchView();
  const player: PlayerWithViewport = {
    ...playerfromDb,
    viewport: getViewport(playerfromDb, chunk(cells, viewportWidth)),
  };

  render(player, dirty);
  loading = false;

  return player;
}

async function move(player: PlayerWithViewport, direction: Direction): Promise<PlayerWithViewport> {
  console.time("fetch");
  const { data: newCellsFromDb, error } = await rpc("move", { target: direction });
  console.timeEnd("fetch");

  const needsGenerate =
    (["left", "right"].includes(direction) && newCellsFromDb.length < viewportWidth) ||
    (["up", "down"].includes(direction) && newCellsFromDb.length < viewportHeight);

  // If some cells are missing then we need to request a chunk generation
  if (needsGenerate) {
    const { topLeft, topRight, bottomLeft, bottomRight } = player.viewport;
    const payload = (() => {
      switch (direction) {
        case "up":
          return {
            corners: [
              [topLeft.x, topLeft.y - 1],
              [topRight.x, topRight.y - 1],
            ],
            newCells: {
              x: topLeft.x,
              y: topLeft.y,
              width: viewportWidth,
              height: 1,
            },
          };
        case "right":
          return {
            corners: [
              [topRight.x + 1, topRight.y],
              [bottomRight.x + 1, bottomRight.y],
            ],
            newCells: {
              x: topRight.x + 1,
              y: topRight.y,
              width: 1,
              height: viewportHeight,
            },
          };
        case "down":
          return {
            corners: [
              [bottomLeft.x, bottomLeft.y + 1],
              [bottomRight.x, bottomRight.y + 1],
            ],
            newCells: {
              x: bottomLeft.x,
              y: bottomLeft.y,
              width: viewportWidth,
              height: 1,
            },
          };
        case "left":
          return {
            corners: [
              [topLeft.x - 1, topLeft.y],
              [bottomLeft.x - 1, bottomLeft.y],
            ],
            newCells: {
              x: topLeft.x - 1,
              y: topLeft.y,
              width: 1,
              height: viewportHeight,
            },
          };
      }
    })();

    const res = await fetch(`${host}/generate`, {
      method: "post",
      body: JSON.stringify({ accessToken: access_token, ...payload }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error(res.status, res.statusText);
    }

    const { newCells } = await res.json();
  }

  let newX = player.x;
  let newY = player.y;
  switch (direction) {
    case "up":
      newY--;
      break;
    case "right":
      newX++;
      break;
    case "down":
      newY++;
      break;
    case "left":
      newX--;
      break;
  }

  player.x = newX;
  player.y = newY;

  const viewport = getViewport(player, moveViewport(direction, player.viewport.cells, newCellsFromDb));

  return {
    ...player,
    viewport,
  };

  // const res = await fetch(`${host}/move`, {
  //   method: "post",
  //   body: JSON.stringify({ accessToken: access_token, direction }),
  //   headers: { "Content-Type": "application/json" },
  // });
  // if (!res.ok) {
  //   console.error(res.status, res.statusText);
  // }

  // const { player: updatedPlayer, newCells, ok } = await res.json();

  // if (ok === false || newCells.length === 0) {
  //   return;
  // }
  console.log(error);
  // console.log(newLine);
  // player = updatedPlayer;
}

function getViewport(player: Player, cells?: Cell[][]): Viewport {
  const startX = player.x - playerOffset;
  const startY = player.y - playerOffset;

  return {
    topLeft: { x: startX, y: startY },
    topRight: { x: startX + viewportWidth, y: startY },
    bottomRight: { x: startX + viewportWidth, y: startY + viewportHeight },
    bottomLeft: { x: startX, y: startY + viewportHeight },
    cells: cells || [],
  };
}

(async () => {
  let player = await refresh();

  process.stdin.on("keypress", async (str, key) => {
    if (loading) {
      return null;
    }
    loading = true;
    console.log(key);
    // Toggle inventory mode
    // if (key.sequence === "<" && player.inventory.length > 0) {
    //   player.inInventory = !player.inInventory;
    // }

    // Handle CTRL+X hotkeys
    if (key.ctrl) {
      switch (key.name) {
        case "c":
          if (key.ctrl) {
            process.exit(0);
          }
          break;

        // case "s":
        //   saveWorld();
        //   break;
        case "r":
          player = await refresh();
          break;
        case "n":
          dirty = !dirty;
          break;
      }
    } else {
      // Handle directional keys
      if (directions.includes(key.name)) {
        player = await move(player, key.name);
        // Ctrl + Directional : interact
        // if (key.ctrl) {
        //   interact(key.name);
        // } else {
        //   // Navigate in inventory
        //   if (player.inInventory) {
        //     switch (key.name) {
        //       case "left":
        //         player.hand = Math.max(0, player.hand - 1);
        //         break;
        //       case "right":
        //         player.hand = Math.min(player.inventory.length - 1, player.hand + 1);
        //         break;
        //     }
        //   } else {
        //     // Normal movement
        //     move(key.name);
        //   }
        // }
      }
    }

    render(player, dirty);
    loading = false;
  });
})().catch((err) => {
  console.error(err);
  process.exit(0);
});
