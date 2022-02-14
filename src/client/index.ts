import readline from "readline";
import fetch from "node-fetch";

import { Direction, directions, moveViewport } from "../lib/utils";

import { render } from "./render";
import { Cell, Player } from "../lib/supabase";
import { fetchPlayer, fetchView, rpc } from "./supabase";
import { playerOffset } from "../lib/constants";
import { chunk } from "lodash";
import { host, viewportHeight, viewportWidth } from "./constants";
import { apiFetch } from "./api";

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
  const { player: playerfromDb, viewport } = await apiFetch("login");

  let player: PlayerWithViewport = {
    ...playerfromDb,
    viewport: getViewport(playerfromDb, viewport),
  };
  console.log(player);
  render(player, dirty);

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
          const { player: updatedPlayer, viewport } = await apiFetch("view");
          player = {
            ...updatedPlayer,
            viewport: getViewport(updatedPlayer, viewport),
          };
          break;
        case "n":
          dirty = !dirty;
          break;
      }
    } else {
      // Handle directional keys
      if (directions.includes(key.name)) {
        const { ok, player: updatedPlayer, newCells } = await apiFetch("move", { direction: key.name });

        if (ok) {
          player = {
            ...updatedPlayer,
            viewport: getViewport(updatedPlayer, moveViewport(key.name, player.viewport.cells, newCells)),
          };
        }
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
