import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SupabaseQueryBuilder } from "@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder";
import { Request } from "restify";

import { definitions, paths } from "../core/models";

export type Stack = definitions["stack"];
export type Player = definitions["player"] & { stack: Stack };
export type Cell = definitions["cell"];

export type GetCorners = paths["/rpc/get_corners"];
export type GetRectangle = paths["/rpc/get_rectangle"];
export type GetTarget = paths["/rpc/get_target"];

interface patchedDefinitions {
  stack: Stack;
  player: Player;
  cell: Cell;
}

interface patchedPaths {
  get_corners: GetCorners;
  get_rectangle: GetRectangle;
  get_target: GetTarget;
}

export type From = <T extends keyof patchedDefinitions>(table: T) => SupabaseQueryBuilder<patchedDefinitions[T]>;
export type Rpc = <T extends keyof patchedPaths>(
  func: T,
  args: patchedPaths[typeof func]["post"]["parameters"]["body"]["args"]
) => PostgrestFilterBuilder<Cell>;

export function makeSupabase(req: Request, accessKey?: string) {
  req.supabase = createClient(process.env["SUPABASE_URL"], process.env["SUPABASE_KEY"]);

  if (accessKey) {
    req.supabase.auth.setAuth(accessKey);
  }

  req.from = function from(table) {
    return req.supabase.from<patchedDefinitions[typeof table]>(table);
  };

  req.rpc = function rpc(func, args: patchedPaths[typeof func]["post"]["parameters"]["body"]["args"]) {
    return req.supabase.rpc<Cell>(func, args);
  };
}
