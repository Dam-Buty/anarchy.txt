import restify from "restify";

import { cacheRenderBox, createMap, getCell, getView, Map } from "../core/map";
import { authenticate, frontPage, movePlayer, oauthPage } from "./middleware/auth";
import { pathModel } from "../core/cell";
import { Direction, Rectangle } from "../lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { Cell, From, makeSupabase, Player, Rpc } from "../lib/supabase";
import { playerOffset, renderOffset } from "../lib/constants";
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
    supabase: SupabaseClient;
    rpc: Rpc;
    from: From;
    map: Map;
    renderBox: Rectangle;
    viewBox: Rectangle;
    neighbors: Record<Direction, Partial<Cell>>;
    cacheRenderBox: (options?: Rectangle) => Promise<void>;
    getView: (options?: Rectangle) => Promise<Partial<Cell>[][]>;
    stackPromise: (promise: Promise<any>) => void;
  }
}

let promises: Promise<any>[] = [];
const { supabase, from, rpc } = makeSupabase();

server.use(authenticate);
server.use(async (req, res, next) => {
  req.supabase = supabase;
  req.from = from;
  req.rpc = rpc;

  if (!req.player) {
    return next();
  }

  req.stackPromise = (promise: Promise<any>) => {
    promises.push(
      promise.catch((err) => {
        console.error(err);
      })
    );
  };

  req.renderBox = {
    corner: [req.player.x - renderOffset, req.player.y - renderOffset],
    width: renderOffset * 2,
    height: renderOffset * 2,
  };
  req.viewBox = {
    corner: [req.player.x - playerOffset, req.player.y - playerOffset],
    width: viewportWidth,
    height: viewportHeight,
  };

  req.map = map;
  req.cacheRenderBox = (options = req.renderBox) => cacheRenderBox(req, options);
  req.getView = (options = req.viewBox) => getView(req, options);
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

server.post("/login", authenticated, async (req, res) => {
  // Cache the renderbox of the player
  await req.cacheRenderBox();
  // return their viewbox
  const viewport = await req.getView();
  res.json({ player: req.player, viewport });
});

server.get("/view", authenticated, async (req, res) => {
  const viewport = await req.getView();
  res.contentType = "text/plain";
  res.send(viewport.map((line) => line.map((cell) => cell.letter).join("")).join("\n"));
});

server.post("/view", authenticated, async (req, res) => {
  const viewport = await req.getView();

  res.json({ player: req.player, viewport });
});

function isWalkable(cell: Partial<Cell>) {
  return [pathModel, " "].includes(cell.letter);
}

function setNeighbors(req: restify.Request, res: restify.Response, next: restify.Next) {
  req.neighbors = {
    up: getCell(req, { x: req.player.x, y: req.player.y - 1 }),
    right: getCell(req, { x: req.player.x + 1, y: req.player.y }),
    down: getCell(req, { x: req.player.x, y: req.player.y + 1 }),
    left: getCell(req, { x: req.player.x - 1, y: req.player.y }),
  };
  next();
}

server.post("/move", setNeighbors, async (req, res) => {
  const direction: Direction = req.body.direction;

  if (!isWalkable(req.neighbors[direction])) {
    return res.json({ ok: false });
  }

  movePlayer(req, direction);

  const newViewport: Rectangle = (() => {
    switch (direction) {
      case "up":
        return {
          corner: [req.player.x - playerOffset, req.player.y - playerOffset],
          width: viewportWidth,
          height: 1,
        };
      case "right":
        return {
          corner: [req.player.x - playerOffset + viewportWidth, req.player.y - playerOffset],
          width: 1,
          height: viewportHeight,
        };
      case "down":
        return {
          corner: [req.player.x - playerOffset, req.player.y - playerOffset + viewportHeight],
          width: viewportWidth,
          height: 1,
        };
      case "left":
        return {
          corner: [req.player.x - playerOffset, req.player.y - playerOffset],
          width: 1,
          height: viewportHeight,
        };
    }
  })();
  const newCells = await req.getView(newViewport);

  // Cache the new renderbox
  req.cacheRenderBox(req.renderBox);

  res.json({ ok: true, player: req.player, newCells });
});

server.listen(8666);

// setInterval(() => {
//   console.log(mapValues(process.memoryUsage(), (value) => `${(value / (1024 * 1024)).toFixed(2)} Mb`));
// }, 2000);
