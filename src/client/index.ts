import { chain, keys } from "lodash";
import readline from "readline";
import { playerOffset } from "../lib/constants";
import { Cell, Player, Stack } from "../lib/supabase";
import { getUnicodeBlock } from "../lib/unicode-blocks";
import { directions, moveViewport } from "../lib/utils";
import { apiFetch } from "./api";
import { viewportHeight, viewportWidth } from "./constants";
import { render } from "./render";

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

type Inventory = Record<string, Stack[]>;
export type PlayerWithViewport = Player & { viewport: Viewport; inventory: Inventory };

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

function sortInventory(inventory: Stack[]): Inventory {
  return chain(inventory)
    .groupBy((stack) => getUnicodeBlock(stack.item))
    .value();
}

(async () => {
  const { player: playerfromDb, viewport } = await apiFetch("login");
  let inInventory = false;

  let player: PlayerWithViewport = {
    ...playerfromDb,
    viewport: getViewport(playerfromDb, viewport),
    inventory: sortInventory(playerfromDb.stack),
  };

  let handRow: keyof PlayerWithViewport["inventory"];
  let handSlot: number;

  const doRender = () => {
    render(player, { dirty, inInventory, handRow, handSlot });
  };

  doRender();

  process.stdin.on("keypress", async (str, key) => {
    if (loading) {
      return null;
    }
    loading = true;
    // console.log(key);

    // Space bar toggles inventory mode
    if (key.name === "space") {
      if (player.stack.length === 0) {
        inInventory = false;
      } else {
        inInventory = !inInventory;
      }
    }

    const inventoryKeys = keys(player.inventory);

    if (inInventory) {
      /**
       * Inventory mode
       */
      switch (key.name) {
        case "left":
          handSlot = Math.max(handSlot[0] - 1, 0);
          break;
        case "right":
          handSlot = Math.min(handSlot[0] + 1, player.inventory[handRow].length - 1);
          break;
        case "up":
          const currentKeyIndex = inventoryKeys.indexOf(handRow);
          const previousKeyIndex = Math.max(currentKeyIndex - 1, 0);
          handRow = inventoryKeys[previousKeyIndex];
          handSlot = Math.min(handSlot, player.inventory[handRow].length - 1);
          break;
        case "down":
          const currentKeyIndex_ = inventoryKeys.indexOf(handRow);
          const nextKeyIndex = Math.min(currentKeyIndex_ + 1, inventoryKeys.length - 1);
          handRow = inventoryKeys[nextKeyIndex];
          handSlot = Math.min(handSlot, player.inventory[handRow].length - 1);
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
              inventory: sortInventory(updatedPlayer.stack),
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
            case "r":
              const { player: updatedPlayer, viewport } = await apiFetch("view");
              player = {
                ...updatedPlayer,
                viewport: getViewport(updatedPlayer, viewport),
                inventory: sortInventory(updatedPlayer.stack),
              };
              break;
            case "n":
              dirty = !dirty;
              break;
          }
        }
      } else if (key.shift) {
        /**
         * Place mode
         */
        if (directions.includes(key.name)) {
          const {
            ok,
            player: updatedPlayer,
            updatedCell,
          } = await apiFetch("place", { direction: key.name, item: player.inventory[handRow][handSlot].item });

          if (ok) {
            setCellInViewport(player, updatedCell);
            player = {
              ...updatedPlayer,
              viewport: player.viewport,
              inventory: sortInventory(updatedPlayer.stack),
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
              inventory: sortInventory(updatedPlayer.stack),
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
