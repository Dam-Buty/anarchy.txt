import fs from "fs";
import readline from "readline";
import chalk from "chalk";
import * as player from "../player.json";
import { Cell, damage } from "./core/cell";
import { createMap, getCellFromChunk, getView } from "./core/map";

// const chalk = require("chalk");

const playerModel = ["𐛩", "𐛪", "𐛫"];
const worldSeed = "with the absolute heart of the poem of life butchered out of their own bodies";
const textBias = "GOOD TO EAT a thousand years";
const technologyBias = "the world of the electron and the switch, the beauty of the baud";
const magicBias = "Lips that would kiss Form prayers to broken stone";

const viewportWidth = 60;
const viewportHeight = 40;
const playerXInViewport = 20;
const playerYInViewport = 20;

let [playerX, playerY] = player.position;

const map = createMap(worldSeed, { textBias, technologyBias, magicBias });

function formatCell(cell: Cell): string {
  if (cell.isPartOfStructure) {
    return chalk.bold(chalk.red(cell.letter));
  }
  return cell.letter;
}

function formatLine(cells: Cell[]): string {
  return cells
    .map((cell) => {
      if (!cell) {
        return chalk.red("X");
      }
      if (cell.x === playerX && cell.y === playerY) {
        return playerModel[playerX % 3];
      }
      return formatCell(cell);
    })
    .join(" ");
}

let viewport: Cell[][] = [];

function refresh() {
  const viewportX = playerX - playerXInViewport;
  const viewportY = playerY - playerYInViewport;

  viewport = getView(map, { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight });
}

function render() {
  const viewportX = playerX - playerXInViewport;
  const viewportY = playerY - playerYInViewport;

  // Display the viewport
  console.clear();

  console.log("Viewport", viewportX, viewportY);
  console.log(viewport.map(formatLine).join("\n"));
  console.log("Player", playerX, playerY);
}

refresh();
render();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const directions = ["up", "down", "left", "right"] as const;
type Direction = typeof directions[number];

function neighbor(direction: Direction): { x: number; y: number } {
  const neighbors: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const neighbor = neighbors[direction];
  return { x: playerX + neighbor.x, y: playerY + neighbor.y };
}

function move(direction: Direction) {
  const target = getCellFromChunk(map, neighbor(direction));

  if (target.isPath || target.letter === " ") {
    playerX = target.x;
    playerY = target.y;
  }
}

function interact(direction: Direction) {
  const target = getCellFromChunk(map, neighbor(direction));
  damage(target);
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
        const position = [playerX, playerY];
        fs.writeFileSync("./player.json", JSON.stringify({ position }, null, 2));
      }
  }
});
