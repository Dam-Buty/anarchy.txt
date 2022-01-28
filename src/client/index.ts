import chalk from "chalk";
import fetch from "node-fetch";
import { playerXInViewport, playerYInViewport } from "../lib/constants";
import { Cell } from "../server/core/cell";

import { definitions } from "../server/core/models";
import { Player, playerModel } from "../server/core/player";
import { access_token } from "./jwt.json";

const directions = ["up", "down", "left", "right"] as const;
type Direction = typeof directions[number];

function formatCell(cell: Cell): string {
  if (cell.isPartOfStructure) {
    return chalk.bold(chalk.yellow(cell.letter));
  }
  if (cell.health === 0) {
    return " ";
  }
  if (cell.health < 25) {
    return chalk.bgRed(cell.letter);
  }
  if (cell.health < 50) {
    return chalk.bgMagenta(cell.letter);
  }
  if (cell.health < 75) {
    return chalk.bgGreen(cell.letter);
  }
  return cell.letter;
}

const host = "http://localhost:8666";
let bootstrapped = false;
let viewport: Cell[][];
let player: Player;

function formatLine(player: Player, cells: Cell[]): string {
  return cells
    .map((cell) => {
      if (!cell) {
        return chalk.red("X");
      }
      if (cell.x === playerXInViewport && cell.y === playerYInViewport) {
        return playerModel[
          Math.abs((player.x % playerModel.length) / 2) + Math.abs((player.y % playerModel.length) / 2)
        ];
      }
      return formatCell(cell);
    })
    .join(" ");
}

function render() {
  console.log(viewport.map((line) => formatLine(player, line)).join("\n"));
}

async function refresh() {
  const res = await fetch(`${host}/view`, {
    method: "post",
    body: JSON.stringify({ accessToken: access_token }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error(res.status, res.statusText);
  }

  const data = await res.json();

  viewport = data.viewport;
  player = data.player;
}

// process.stdin.on("keypress", async (str, key) => {
//   if (!bootstrapped) {
//     return null;
//   }
//   console.log(key);
//   // Toggle inventory mode
//   // if (key.sequence === "<" && player.inventory.length > 0) {
//   //   player.inInventory = !player.inInventory;
//   // }
//   // Handle directional keys
//   if (directions.includes(key.name)) {
//     // Ctrl + Directional : interact
//     if (key.ctrl) {
//       interact(key.name);
//     } else {
//       // Navigate in inventory
//       if (player.inInventory) {
//         switch (key.name) {
//           case "left":
//             player.hand = Math.max(0, player.hand - 1);
//             break;
//           case "right":
//             player.hand = Math.min(player.inventory.length - 1, player.hand + 1);
//             break;
//         }
//       } else {
//         // Normal movement
//         move(key.name);
//       }
//     }
//   }
//   // Handle CTRL+X hotkeys
//   if (key.ctrl) {
//     switch (key.name) {
//       case "c":
//         if (key.ctrl) {
//           process.exit(0);
//         }
//         break;
//       // case "s":
//       //   saveWorld();
//       //   break;
//       // case "n":
//       //   cleanUp = !cleanUp;
//       //   break;
//     }
//   }
//   render();
// });

(async () => {
  await refresh();
  await render();
  bootstrapped = true;
})().catch((err) => {
  console.error(err);
});
