import * as player from "../../player.json";

export const playerModel = ["𐛩", "𐛪", "𐛫"];

export type Player = {
  x: number;
  y: number;

  inventory: {
    letter: string;
    stack: number;
  }[];
};

export function createPlayer(): Player {
  let [playerX, playerY] = player.position;

  return { x: playerX, y: playerY, inventory: [] };
}

export function addToInventory(player: Player, letter: string) {
  const existingStack = player.inventory.find((item) => item.letter === letter);

  if (existingStack) {
    existingStack.stack++;
  } else {
    player.inventory.push({ letter, stack: 1 });
  }
}
