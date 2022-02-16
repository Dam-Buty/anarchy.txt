import fetch from "node-fetch";
import { Cell, Player } from "../lib/supabase";
import { Direction } from "../lib/utils";

import { host } from "./constants";
import { access_token } from "./jwt.json";

type Endpoints = {
  login: {
    body: never;
    response: { player: Player; viewport: Cell[][] };
  };
  view: {
    body: never;
    response: { player: Player; viewport: Cell[][] };
  };
  move: {
    body: { direction: Direction };
    response: { ok: boolean; player: Player; newCells: Cell[] };
  };
};

export async function apiFetch<T extends keyof Endpoints>(
  endpoint: T,
  body?: Endpoints[typeof endpoint]["body"]
): Promise<Endpoints[typeof endpoint]["response"]> {
  console.time(`${host}/${endpoint}`);
  const res = await fetch(`${host}/${endpoint}`, {
    method: "post",
    body: JSON.stringify({ accessToken: access_token, ...body }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API Error ${res.status} : ${res.statusText}`);
  }

  const response = await res.json();

  console.timeEnd(`${host}/${endpoint}`);
  return response as Endpoints[typeof endpoint]["response"];
}
