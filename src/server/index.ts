import restify from "restify";

import { createMap, getView } from "./core/map";
import { definitions } from "./core/models";
import { playerXInViewport, playerYInViewport } from "../lib/constants";
import { makeSupabase, Player } from "./supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SupabaseQueryBuilder } from "@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder";
import { frontPage, oauthPage } from "./middleware/auth";
import { Cell } from "./core/cell";

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
    getView: () => Promise<Cell[][]>;
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

    console.log(`Request for player`, player);

    req.player = player;
    req.map = map;
    req.getView = () =>
      getView(req, {
        x: player.x - playerXInViewport,
        y: player.y - playerYInViewport,
        width: viewportWidth,
        height: viewportHeight,
      });
  }
  next();
});

server.get("/", frontPage);
server.get("/oauth", oauthPage);

server.get("/view", async (req, res) => {
  if (!req.map) {
    res.send(401, "Unauthorized");
  }
  console.log(req, req.getView);
  const viewport = await req.getView();

  res.contentType = "text/plain";
  res.send(viewport.map((line) => line.map((cell) => cell.letter).join("")).join("\n"));
});

server.post("/view", async (req, res, next) => {
  if (!req.map) {
    res.send(401, "Unauthorized");
  }
  const viewport = await req.getView();
  console.log(req.player);

  res.json({ player: req.player, viewport });
});

server.listen(8666);
