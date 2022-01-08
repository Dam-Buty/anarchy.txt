import wcwidth from "wcwidth";
import readline from "readline";
import * as player from "../player.json";
import { Cell } from "./core/cell";
import { createMap, getView } from "./core/map";

const chalk = require("chalk");

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
  return cells.map((cell) => (cell ? formatCell(cell) : chalk.red("X"))).join(" ");
}

function render(playerX: number, playerY: number) {
  const viewportX = playerX - playerXInViewport;
  const viewportY = playerY - playerYInViewport;

  const viewport = getView(map, { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight });

  // Display the viewport
  console.clear();

  console.log("Viewport", viewportX, viewportY);
  console.log(viewport.map(formatLine).join("\n"));
  console.log("Player", playerX, playerY);
  // console.log(`Needed chunks : ${neededChunks.map((chunk) => chunk.join(",")).join(" - ")}`);
  // console.log(`Generated chunks : ${chunksToGenerate.map((chunk) => chunk.join(",")).join(" - ")}`);
}

render(playerX, playerY);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (str, key) => {
  // console.log(key);
  switch (key.name) {
    case "up":
      playerY--;
      break;
    case "down":
      playerY++;
      break;
    case "left":
      playerX--;
      break;
    case "right":
      playerX++;
      break;
    case "c":
      if (key.ctrl) {
        process.exit(0);
      }
  }
  render(playerX, playerY);
});
