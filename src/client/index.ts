import chalk from "chalk";
import readline from "readline";
import fetch from "node-fetch";

import { spliceViewport } from "../lib/utils";

import { playerModel } from "../core/player";
import { Cell, Player } from "../server/supabase";
import { access_token } from "./jwt.json";
import { writeFileSync } from "fs";

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const directions = ["up", "down", "left", "right"] as const;
type Direction = typeof directions[number];

const host = "http://localhost:8666";
let bootstrapped = false;
let viewport: Cell[][];
let player: Player;

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

function formatLine(player: Player, cells: Cell[]): string {
  return cells
    .map((cell) => {
      if (!cell) {
        return chalk.red("X");
      }
      if (cell.x === player.x && cell.y === player.y) {
        console.log(666, Math.abs(Math.round(((player.x % playerModel.length) + (player.y % playerModel.length)) / 2)));
        return playerModel[
          Math.abs(Math.round(((player.x % playerModel.length) + (player.y % playerModel.length)) / 2))
        ];
      }
      return formatCell(cell);
    })
    .join(" ");
}

let dirty = false;

function render() {
  if (!dirty) {
    console.clear();
  }
  console.log(player.x, player.y, dirty ? "D" : "");
  console.log(viewport.map((line) => formatLine(player, line)).join("\n"));
}

// Fetch the player and its current view
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

  writeFileSync("./dump.json", JSON.stringify(data, null, 2));

  viewport = data.viewport;
  player = data.player;
}

async function move(direction: Direction) {
  const res = await fetch(`${host}/move`, {
    method: "post",
    body: JSON.stringify({ accessToken: access_token, direction }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    console.error(res.status, res.statusText);
  }

  const { player: updatedPlayer, newCells, ok } = await res.json();

  if (ok === false) {
    return;
  }

  // Unzip the cells according to the direction
  const newLine = (() => {
    if (["left", "right"].includes(direction)) {
      return newCells.map((line) => line[0]);
    }
    return newCells[0];
  })();

  console.log(newLine);
  player = updatedPlayer;
  viewport = spliceViewport(direction, viewport, newLine);
}

process.stdin.on("keypress", async (str, key) => {
  if (!bootstrapped) {
    return null;
  }
  // console.log(key);
  // Toggle inventory mode
  // if (key.sequence === "<" && player.inventory.length > 0) {
  //   player.inInventory = !player.inInventory;
  // }
  // Handle directional keys
  if (directions.includes(key.name)) {
    await move(key.name);
    render();
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
      case "n":
        dirty = !dirty;
        break;
    }
  }
  render();
});

(async () => {
  await refresh();
  await render();
  bootstrapped = true;
})().catch((err) => {
  console.error(err);
  process.exit(0);
});
