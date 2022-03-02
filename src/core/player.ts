import { Request } from "restify";
import { Cell } from "../lib/supabase";

// export type Player = {
//   x: number;
//   y: number;

//   inventory: {
//     letter: string;
//     stack: number;
//   }[];
//   hand: number;
//   inInventory: boolean;
// };

export async function addToInventory(req: Request, cell: Partial<Cell>) {
  const existingStack = req.player.stacks.find((stack) => stack.item === cell.letter);

  if (existingStack) {
    existingStack.size++;
    await req.from("stack").update({ size: existingStack.size }).eq("id", existingStack.id);
  } else {
    const { data: newStack } = await req
      .from("stack")
      .insert({ item: cell.letter, size: 1, playerId: req.player.id })
      .single();
    req.player.stacks.push(newStack);
  }
}
