import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createClient } from "@supabase/supabase-js";
import { SupabaseQueryBuilder } from "@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder";
import { Request } from "restify";

import { definitions, paths } from "../core/models";

export type Stack = definitions["stack"];
export type Player = definitions["player"] & { stack: Stack[] };
export type Cell = definitions["cell"];

export type GetCorners = paths["/rpc/get_corners"];
export type GetRectangle = paths["/rpc/get_rectangle"];
export type GetTarget = paths["/rpc/get_target"];
export type GetView = paths["/rpc/get_view"];
export type Move = paths["/rpc/move"];

interface patchedDefinitions {
  stack: Stack;
  player: Player;
  cell: Cell;
}

interface patchedPaths {
  get_corners: GetCorners;
  get_rectangle: GetRectangle;
  get_target: GetTarget;
  get_view: GetView;
  move: Move;
}

export type From = <T extends keyof patchedDefinitions>(table: T) => SupabaseQueryBuilder<patchedDefinitions[T]>;
export type Rpc = <T extends keyof patchedPaths>(
  func: T,
  args: patchedPaths[typeof func]["post"]["parameters"]["body"]["args"]
) => PostgrestFilterBuilder<Cell>;

export function makeSupabase(accessKey?: string) {
  const supabase = createClient(process.env["SUPABASE_URL"], process.env["SUPABASE_KEY"]);

  if (accessKey) {
    supabase.auth.setAuth(accessKey);
  }

  const from: From = function from(table) {
    return supabase.from<patchedDefinitions[typeof table]>(table);
  };

  const rpc: Rpc = function rpc(func, args: patchedPaths[typeof func]["post"]["parameters"]["body"]["args"]) {
    return supabase.rpc<Cell>(func, args);
  };

  return { supabase, from, rpc };
}
