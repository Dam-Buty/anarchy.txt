import chalk from "chalk";
import fetch from "node-fetch";
import { playerXInViewport, playerYInViewport } from "../lib/constants";
import { Cell } from "../server/core/cell";

import { definitions } from "../server/core/models";
import { Player, playerModel } from "../server/core/player";
import { access_token } from "./jwt.json";

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

async function main() {
  const res = await fetch(`${host}/view`, {
    method: "post",
    body: JSON.stringify({ accessToken: access_token }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error(res.status, res.statusText);
  }

  const { viewport, player } = await res.json();
  // console.log(
  //   viewport.length,
  //   viewport.map((line) => line.length)
  // );

  console.log(player);

  console.log(viewport.map((line) => formatLine(player, line)).join("\n"));
}

main().catch((error) => {
  console.error(error);
});
