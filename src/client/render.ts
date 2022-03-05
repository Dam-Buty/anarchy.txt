import chalk from "chalk";
import { chain } from "lodash";
import { PlayerWithViewport } from ".";
import { Cell, Player } from "../lib/supabase";
import { getUnicodeBlock } from "../lib/unicode-blocks";
import { playerModel } from "./constants";

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
        return playerModel[
          Math.abs(Math.round(((player.x % playerModel.length) + (player.y % playerModel.length)) / 2))
        ];
      }
      return formatCell(cell);
    })
    .join(" ");
}

export function render(
  player: PlayerWithViewport,
  { dirty, inInventory, hand }: { dirty: boolean; inInventory: boolean; hand: number }
) {
  const { viewport } = player;
  if (!dirty) {
    console.clear();
  }
  console.log(player.x, player.y, dirty ? "D" : "");
  console.log(viewport.cells.map((line) => formatLine(player, line)).join("\n"));
  console.log();
  console.log("Inventory");
  console.log(
    chain(player.stack)
      .groupBy((stack) => getUnicodeBlock(stack.item))
      .values()
      .map((inventoryLine) =>
        inventoryLine
          .map(({ item, size }, slot) => {
            // if (slot === hand) {
            //   if (inInventory) {
            //     return chalk.bgBlack(chalk.white(`${item} (${size})`));
            //   } else {
            //     return chalk.underline(`${item} (${size})`);
            //   }
            // }
            return `${item} (${size})`;
          })
          .join(" / ")
      )
      .value()
      .join("\n")
  );
  // player.stack
  //   .map(({ item, size }, slot) => {
  //     if (slot === hand) {
  //       if (inInventory) {
  //         return chalk.bgBlack(chalk.white(`${item} (${size})`));
  //       } else {
  //         return chalk.underline(`${item} (${size})`);
  //       }
  //     }
  //     return `${item} (${size})`;
  //   })
  //   .join(" / ");
}
