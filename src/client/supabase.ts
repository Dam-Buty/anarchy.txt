import { makeSupabase, Player } from "../lib/supabase";
import { viewportHeight, viewportWidth } from "./constants";
import { access_token } from "./jwt.json";

export const { supabase, from, rpc } = makeSupabase(access_token);

export async function fetchPlayer(): Promise<Player> {
  const { data } = await from("player")
    .select(
      `
      x,
      y,
      name,
      stack (
        item,
        size
      )
    `
    )
    .single();

  return data;
}

export async function fetchView() {
  const { data } = await rpc("get_view", { width: viewportWidth, height: viewportHeight });

  return data;
}
