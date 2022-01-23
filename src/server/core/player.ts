import * as player from "../../../player.json";

export const playerModel = ["𐛩", "𐛪", "𐛧", "𐛫", "𐛪", "𐛧"];

export type Player = {
  x: number;
  y: number;

  inventory: {
    letter: string;
    stack: number;
  }[];
  hand: number;
  inInventory: boolean;
};

// export function createPlayer(x, y, name): Player {
//   let [playerX, playerY] = player.position;

//   return { x: playerX, y: playerY, inventory: [], hand: 0, inInventory: false };
// }

export function addToInventory(player: Player, letter: string) {
  const existingStack = player.inventory.find((item) => item.letter === letter);

  if (existingStack) {
    existingStack.stack++;
  } else {
    player.inventory.push({ letter, stack: 1 });
  }
}
