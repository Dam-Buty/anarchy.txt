import { Request } from "restify";
import { Cell } from "../lib/supabase";

export async function addToInventory(req: Request, cell: Partial<Cell>) {
  const existingStack = req.player.stack.find((stack) => stack.item === cell.letter);

  if (existingStack) {
    existingStack.size++;
    await req.from("stack").update({ size: existingStack.size }).eq("id", existingStack.id);
  } else {
    const { data: newStack } = await req
      .from("stack")
      .insert({ item: cell.letter, size: 1, playerId: req.player.id })
      .single();
    req.player.stack.push(newStack);
  }
}

export async function takeFromInventory(req: Request, item: string) {
  const existingStack = req.player.stack.find((stack) => stack.item === item);

  if (!existingStack) {
    return null;
  }

  existingStack.size--;

  // If the stack is empty remove it from the inventory
  if (existingStack.size === 0) {
    req.player.stack = req.player.stack.filter((stack) => stack.item !== item);
    await req.from("stack").delete().eq("id", existingStack.id);
  } else {
    await req.from("stack").update({ size: existingStack.size }).eq("id", existingStack.id);
  }

  return existingStack.item;
}
