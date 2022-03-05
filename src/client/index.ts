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

function setCellInViewport(player: PlayerWithViewport, cell: Cell) {
  const startX = player.x - playerOffset;
  const startY = player.y - playerOffset;

  player.viewport.cells[cell.y - startY][cell.x - startX] = cell;
}

(async () => {
  const { player: playerfromDb, viewport } = await apiFetch("login");
  let inInventory = false;
  let hand = 0;

  let player: PlayerWithViewport = {
    ...playerfromDb,
    viewport: getViewport(playerfromDb, viewport),
  };

  const doRender = () => {
    render(player, { dirty, inInventory, hand });
  };

  doRender();

  process.stdin.on("keypress", async (str, key) => {
    if (loading) {
      return null;
    }
    loading = true;
    // console.log(key);

    if (key.name === "space") {
      if (player.stack.length === 0) {
        inInventory = false;
      } else {
        inInventory = !inInventory;
      }
    }

    if (inInventory) {
      /**
       * Inventory mode
       */
      switch (key.name) {
        case "left":
          hand = Math.max(hand - 1, 0);
          break;
        case "right":
          hand = Math.min(hand + 1, player.stack.length - 1);
          break;
      }
    } else {
      if (key.ctrl) {
        /**
         * Interact mode
         */
        if (directions.includes(key.name)) {
          const { ok, player: updatedPlayer, updatedCell } = await apiFetch("interact", { direction: key.name });

          if (ok) {
            setCellInViewport(player, updatedCell);
            player = {
              ...updatedPlayer,
              viewport: player.viewport,
            };
          }
        } else {
          /**
           * Key binds
           */
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
        }
        // Handle shift + X ()
      } else if (key.shift) {
        /**
         * Place mode
         */
        if (directions.includes(key.name)) {
          const {
            ok,
            player: updatedPlayer,
            updatedCell,
          } = await apiFetch("place", { direction: key.name, item: player.stack[hand].item });

          if (ok) {
            setCellInViewport(player, updatedCell);
            player = {
              ...updatedPlayer,
              viewport: player.viewport,
            };
          }
        }
      } else {
        /**
         * Move mode
         */
        if (directions.includes(key.name)) {
          const { ok, player: updatedPlayer, newCells } = await apiFetch("move", { direction: key.name });

          if (ok) {
            player = {
              ...updatedPlayer,
              viewport: getViewport(updatedPlayer, moveViewport(key.name, player.viewport.cells, newCells)),
            };
          }
        }
      }
    }

    doRender();

    loading = false;
  });
})().catch((err) => {
  console.error(err);
  process.exit(0);
});
