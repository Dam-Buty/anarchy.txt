import fs from "fs";
import readline from "readline";
import chalk from "chalk";
import { Cell, damage } from "./core/cell";
import { createMap, getCellFromChunk, getView } from "./core/map";
import { addToInventory, createPlayer, playerModel } from "./core/player";
import { sortBy } from "lodash";

// const chalk = require("chalk");

const worldSeed = "with the absolute heart of the poem of life butchered out of their own bodies";
const textBias = "GOOD TO EAT a thousand years";
const technologyBias = "the world of the electron and the switch, the beauty of the baud";
const magicBias = "Lips that would kiss Form prayers to broken stone";

const viewportWidth = 60;
const viewportHeight = 40;
const playerXInViewport = 20;
const playerYInViewport = 20;

const map = createMap(worldSeed, { textBias, technologyBias, magicBias });
const player = createPlayer();

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

function formatLine(cells: Cell[]): string {
  return cells
    .map((cell) => {
      if (!cell) {
        return chalk.red("X");
      }
      if (cell.x === player.x && cell.y === player.y) {
        return playerModel[player.x % 3];
      }
      return formatCell(cell);
    })
    .join(" ");
}

let viewport: Cell[][] = [];

function refresh() {
  const viewportX = player.x - playerXInViewport;
  const viewportY = player.y - playerYInViewport;

  viewport = getView(map, { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight });
}

function render() {
  const viewportX = player.x - playerXInViewport;
  const viewportY = player.y - playerYInViewport;

  // Display the viewport
  // console.clear();

  console.log("Viewport", viewportX, viewportY);
  console.log(viewport.map(formatLine).join("\n"));
  console.log("Player", player.x, player.y);
  console.log(
    "Inventory",
    sortBy(player.inventory, (item) => item.letter)
      .map((item) => `${item.letter} (${item.stack})`)
      .join(" / ")
  );
}

refresh();
render();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const directions = ["up", "down", "left", "right"] as const;
type Direction = typeof directions[number];

const godMode = true;

function neighbor(direction: Direction): { x: number; y: number } {
  const neighbors: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const neighbor = neighbors[direction];
  return { x: player.x + neighbor.x, y: player.y + neighbor.y };
}

function move(direction: Direction) {
  const target = getCellFromChunk(map, neighbor(direction));

  if (godMode || target.isPath || target.letter === " ") {
    player.x = target.x;
    player.y = target.y;
  }
}

function interact(direction: Direction) {
  const target = getCellFromChunk(map, neighbor(direction));
  damage(player, target);
  if (target.health === 0) {
    move(direction);
  }
}

process.stdin.on("keypress", (str, key) => {
  if (directions.includes(key.name)) {
    if (key.ctrl) {
      interact(key.name);
    } else {
      move(key.name);
    }
    refresh();
    render();
    return;
  }
  console.log(key);
  switch (key.name) {
    case "c":
      if (key.ctrl) {
        process.exit(0);
      }
    case "s":
      if (key.ctrl) {
        const position = [player.x, player.y];
        fs.writeFileSync("./player.json", JSON.stringify({ position }, null, 2));
      }
  }
});
