import restify from "restify";

import { createMap, getView } from "./core/map";
import { definitions } from "./core/models";
import { playerXInViewport, playerYInViewport } from "../lib/constants";
import { makeSupabase, Player, Cell } from "./supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SupabaseQueryBuilder } from "@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder";
import { frontPage, oauthPage } from "./middleware/auth";
import { update } from "lodash";
import { pathModel } from "./core/cell";
import { Direction, spliceViewport } from "../lib/utils";
const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

const worldSeed = "with the absolute heart of the poem of life butchered out of their own bodies";
const textBias = "GOOD TO EAT a thousand years";
const technologyBias = "the world of the electron and the switch, the beauty of the baud";
const magicBias = "Lips that would kiss Form prayers to broken stone";

const map = createMap(worldSeed, { textBias, technologyBias, magicBias });

const viewportWidth = 60;
const viewportHeight = 40;

declare module "restify" {
  export interface Request {
    player: Player;
    supabase: ReturnType<typeof makeSupabase>["supabase"];
    from: ReturnType<typeof makeSupabase>["from"];
    map: ReturnType<typeof createMap>;
    getView: (options?: { x: number; y: number; width: number; height: number }) => Promise<Cell[][]>;
  }
}

server.use(async (req, res, next) => {
  const { accessToken } = req.body || req.query || {};

  const { supabase, from } = makeSupabase(accessToken);

  req.supabase = supabase;
  req.from = from;

  if (accessToken) {
    const { data, error } = await from("player").select(
      `
    x,
    y,
    name,
    stack (
      item,
      size
    )
    `
    );

    if (error) {
      console.log(error.message);
      return res.send(500);
    }

    const [player] = data;

    req.player = player;
    req.map = map;
    req.getView = (
      options = {
        x: player.x - playerXInViewport,
        y: player.y - playerYInViewport,
        width: viewportWidth,
        height: viewportHeight,
      }
    ) => getView(req, options);
  }
  next();
});

server.get("/", frontPage);
server.get("/oauth", oauthPage);

export function authenticated(req, res, next) {
  if (!req.player) {
    return res.send(401, "Unauthorized");
  }
  next();
}

server.get("/view", authenticated, async (req, res) => {
  console.log(req, req.getView);
  const viewport = await req.getView();

  res.contentType = "text/plain";
  res.send(viewport.map((line) => line.map((cell) => cell.letter).join("")).join("\n"));
});

server.post("/view", authenticated, async (req, res) => {
  const viewport = await req.getView();
  console.log(req.player);

  res.json({ player: req.player, viewport });
});

function isWalkable(cell: Cell) {
  return [pathModel, " "].includes(cell.letter);
}

server.post("/move", async (req, res) => {
  const direction: Direction = req.body.direction;

  const { data: target } = await req.supabase.rpc<Cell>("get_target", { target: direction }).single();

  if (isWalkable(target)) {
    let newX = req.player.x;
    let newY = req.player.y;
    switch (direction) {
      case "up":
        newY++;
        break;
      case "right":
        newX++;
        break;
      case "down":
        newY--;
      case "left":
        newX--;
    }

    const {
      data: [updatedPlayer],
    } = await req.from("player").update({ x: newX, y: newY });
    req.player = updatedPlayer;

    const newViewport = (() => {
      switch (direction) {
        case "up":
          return {
            x: updatedPlayer.x - playerXInViewport,
            y: updatedPlayer.y - playerYInViewport - 1,
            width: viewportWidth,
            height: 1,
          };
        case "right":
          return {
            x: updatedPlayer.x - playerXInViewport + viewportWidth,
            y: updatedPlayer.y - playerYInViewport,
            width: 1,
            height: viewportHeight,
          };
        case "down":
          return {
            x: updatedPlayer.x - playerXInViewport,
            y: updatedPlayer.y - playerYInViewport + viewportHeight,
            width: viewportWidth,
            height: 1,
          };
        case "left":
          return {
            x: updatedPlayer.x - playerXInViewport - 1,
            y: updatedPlayer.y - playerYInViewport,
            width: 1,
            height: viewportHeight,
          };
      }
    })();

    const newCells = await req.getView(newViewport);

    return spliceViewport(direction, viewport, newCells);
  }
});

server.listen(8666);
