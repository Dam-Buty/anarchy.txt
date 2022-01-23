import { createClient } from "@supabase/supabase-js";
import { definitions } from "./core/models";

export type Stack = definitions["stack"];
export type Player = definitions["player"] & { stack: Stack };
export type Cell = definitions["cell"];

interface patchedDefinitions {
  stack: Stack;
  player: Player;
  cell: Cell;
}

export function makeSupabase(accessKey?: string) {
  const supabase = createClient(process.env["SUPABASE_URL"], process.env["SUPABASE_KEY"]);

  if (accessKey) {
    supabase.auth.setAuth(accessKey);
  }

  return {
    supabase,
    from<T extends keyof patchedDefinitions>(table: T) {
      return supabase.from<patchedDefinitions[typeof table]>(table);
    },
  };
}
