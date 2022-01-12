import fs from "fs";
import readline from "readline";
import chalk from "chalk";
import bigJson from "big-json";
import { Cell, damage, place } from "./core/cell";
import { createMap, getCellFromChunk, getView } from "./core/map";
import { addToInventory, createPlayer, playerModel } from "./core/player";
import { isNull, mapValues, sortBy } from "lodash";
import { createMatrix, mapMatrix } from "./lib/utils";
import { chunkHeight, chunkWidth } from "./lib/constants";

const godMode = false;

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

let cleanUp = false;

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
      if (cell.x === player.x && cell.y === player.y && !godMode) {
        return playerModel[Math.abs(player.x % 3) + Math.abs(player.y % 3)];
      }
      return formatCell(cell);
    })
    .join(" ");
}

let viewport: Cell[][] = [];

function refresh() {
  const viewportX = player.x - playerXInViewport;
  const viewportY = player.y - playerYInViewport;

  console.time("getView");
  viewport = getView(map, { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight });
  console.timeEnd("getView");
}

function render() {
  const viewportX = player.x - playerXInViewport;
  const viewportY = player.y - playerYInViewport;

  // Display the viewport
  if (cleanUp) {
    console.clear();
  }

  console.log("Viewport", viewportX, viewportY, cleanUp ? "clean" : "dirty");
  console.log(viewport.map(formatLine).join("\n"));
  console.log("Player", player.x, player.y);
  console.log(
    "Inventory",
    player.inventory
      .map((item, slot) => {
        if (slot === player.hand && player.inInventory) {
          return chalk.bgBlack(chalk.white(`${item.letter} (${item.stack})`));
        }
        return `${item.letter} (${item.stack})`;
      })
      .join(" / ")
  );
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
  return { x: player.x + neighbor.x, y: player.y + neighbor.y };
}

function move(direction: Direction) {
  const target = getCellFromChunk(map, neighbor(direction));

  if (godMode || target.isPath || target.letter === " ") {
    player.x = target.x;
    player.y = target.y;
  }
  refresh();
}

function interact(direction: Direction) {
  const target = getCellFromChunk(map, neighbor(direction));
  if (target.isPath || target.letter === " ") {
    if (!place(player, target)) {
      move(direction);
    }
  } else {
    damage(player, target);
  }
  if (target.health === 0) {
    move(direction);
  }
}

function saveWorld() {
  // Save the player first
  fs.writeFileSync("./player.json", JSON.stringify({ position: [player.x, player.y] }, null, 2));

  // Stream the world to disk
  const saveData = mapValues(map.chunks, (chunkLine) =>
    mapValues(chunkLine, (chunk) => {
      return {
        cells: mapMatrix(chunk.cells, ({ x, y, health, letter }) => ({ x, y, health, letter })),
      };
    })
  );
  fs.writeFileSync("./world.json", JSON.stringify({ chunks: saveData }, null, 2));
  // const stringifyStream = bigJson.createStringifyStream({ body: { chunks: saveData } });
  // const writeStream = fs.createWriteStream("./world.json");
  // stringifyStream.pipe(writeStream);
}

process.stdin.on("keypress", (str, key) => {
  console.log(key);
  // Toggle inventory mode
  if (key.sequence === "<" && player.inventory.length > 0) {
    player.inInventory = !player.inInventory;
  }
  // Handle directional keys
  if (directions.includes(key.name)) {
    // Ctrl + Directional : interact
    if (key.ctrl) {
      interact(key.name);
    } else {
      // Navigate in inventory
      if (player.inInventory) {
        switch (key.name) {
          case "left":
            player.hand = Math.max(0, player.hand - 1);
            break;
          case "right":
            player.hand = Math.min(player.inventory.length - 1, player.hand + 1);
            break;
        }
      } else {
        // Normal movement
        move(key.name);
      }
    }
  }
  // Handle CTRL+X hotkeys
  if (key.ctrl) {
    switch (key.name) {
      case "c":
        if (key.ctrl) {
          process.exit(0);
        }
        break;
      case "s":
        saveWorld();
        break;
      case "n":
        cleanUp = !cleanUp;
        break;
    }
  }
  render();
});
