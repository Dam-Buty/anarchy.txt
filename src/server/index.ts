import { SupabaseClient } from "@supabase/supabase-js";
import EventEmitter from "events";
import restify from "restify";
import { isAlphabet, isAmbiance, isRare, pathModel } from "../core/cell";
import { cacheRenderBox, createMap, getCell, getView, Map } from "../core/map";
import { addToInventory, takeFromInventory } from "../core/player";
import { playerOffset, renderOffset } from "../lib/constants";
import { Cell, From, makeSupabase, Player, Rpc } from "../lib/supabase";
import { Direction, Rectangle } from "../lib/utils";
import { authenticate, frontPage, movePlayer, oauthPage } from "./middleware/auth";
import { dispatcher } from "./middleware/dispatcher";

const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

const worldSeed = "with the absolute heart of the poem of life butchered out of their own bodies";
const textBias = "GOOD TO EAT a thousand years";
const technologyBias = "the world of the electron and the switch, the beauty of the baud";
const orderBias = "Lips that would kiss Form prayers to broken stone";

const map = createMap(worldSeed, { textBias, technologyBias, orderBias });

const viewportWidth = 60;
const viewportHeight = 40;

declare module "restify" {
  export interface Request {
    player: Player;
    supabase: SupabaseClient;
    rpc: Rpc;
    from: From;
    dispatcher: EventEmitter;
    map: Map;
    renderBox: Rectangle;
    viewBox: Rectangle;
    neighbors: Record<Direction, Partial<Cell>>;
    cacheRenderBox: (options?: Rectangle) => Promise<void>;
    getView: (options?: Rectangle) => Promise<Partial<Cell>[][]>;
  }
}

const { supabase, from, rpc } = makeSupabase();

server.use(authenticate);
server.use(async (req, res, next) => {
  req.supabase = supabase;
  req.from = from;
  req.rpc = rpc;
  req.dispatcher = dispatcher;

  if (!req.player) {
    return next();
  }

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
  req.cacheRenderBox = (rectangle = req.renderBox) => cacheRenderBox(req, rectangle);
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

server.post("/move", authenticated, setNeighbors, async (req, res) => {
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
          corner: [req.player.x - playerOffset + viewportWidth - 1, req.player.y - playerOffset],
          width: 1,
          height: viewportHeight,
        };
      case "down":
        return {
          corner: [req.player.x - playerOffset, req.player.y - playerOffset + viewportHeight - 1],
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
  req.cacheRenderBox();

  res.json({ ok: true, player: req.player, newCells: newCells.flat() });
});

server.post("/interact", authenticated, setNeighbors, async (req, res) => {
  const direction: Direction = req.body.direction;

  if (isWalkable(req.neighbors[direction])) {
    return res.json({ ok: false });
  }

  const target = req.neighbors[direction];

  console.log(target);

  if (!target.isNatural) {
    target.health -= target.placedById === req.player.id ? 45 : 25;
  }

  if (isAmbiance(target)) {
    target.health -= 34;
  }
  if (isAlphabet(target)) {
    target.health -= 25;
  }
  if (isRare(target)) {
    target.health -= 20;
  }

  if (target.health <= 0) {
    await addToInventory(req, target);
    target.health = 100;
    target.letter = " ";
  }

  req.dispatcher.emit("cells", { req, cells: [target] });

  res.json({ ok: true, player: req.player, updatedCell: target });
});

server.post("/place", authenticated, setNeighbors, async (req, res) => {
  const direction: Direction = req.body.direction;
  const item: string = req.body.item;

  if (!isWalkable(req.neighbors[direction])) {
    return res.json({ ok: false });
  }

  const target = req.neighbors[direction];

  // Confirm the player has the item in their inventory
  const confirm = takeFromInventory(req, item);

  if (!confirm) {
    return res.json({ ok: false });
  }

  target.health = 100;
  target.letter = item;
  target.isNatural = false;
  target.placedAt = new Date().toISOString();
  target.placedById = req.player.id;

  req.dispatcher.emit("cells", { req, cells: [target] });

  res.json({ ok: true, player: req.player, updatedCell: target });
});

server.listen(8666);
