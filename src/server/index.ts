import restify from "restify";

import { createMap, getView } from "../core/map";
import { frontPage, oauthPage } from "./middleware/auth";
import { pathModel } from "../core/cell";
import { Direction } from "../lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { Cell, From, makeSupabase, Player, Rpc } from "../lib/supabase";
import { playerOffset } from "../lib/constants";
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
    map: ReturnType<typeof createMap>;
    getView: (options?: { x: number; y: number; width: number; height: number }) => Promise<Partial<Cell>[][]>;
    stackPromise: (promise: Promise<any>) => void;
  }
}

let promises: Promise<any>[] = [];

server.use(async (req, res, next) => {
  const { accessToken } = req.body || req.query || {};

  const { supabase, from, rpc } = makeSupabase();

  req.supabase = supabase;
  req.from = from;
  req.rpc = rpc;

  if (accessToken) {
    const { data, error } = await req.from("player").select(
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

    req.stackPromise = (promise: Promise<any>) => {
      promises.push(
        promise.catch((err) => {
          console.error(err);
        })
      );
    };

    req.player = player;
    req.map = map;
    req.getView = (
      options = {
        x: player.x - playerOffset,
        y: player.y - playerOffset,
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
  const viewport = await req.getView();
  res.contentType = "text/plain";
  res.send(viewport.map((line) => line.map((cell) => cell.letter).join("")).join("\n"));
});

server.post("/view", authenticated, async (req, res) => {
  const viewport = await req.getView();

  res.json({ player: req.player, viewport });
});

function isWalkable(cell: Cell) {
  return [pathModel, " "].includes(cell.letter);
}

server.post("/move", async (req, res) => {
  const direction: Direction = req.body.direction;

  console.time("full rpc");
  const { data: newCells } = await req.rpc("move", { target: direction });
  console.timeEnd("full rpc");

  if (newCells.length > 0) {
    let newX = req.player.x;
    let newY = req.player.y;
    switch (direction) {
      case "up":
        newY--;
        break;
      case "right":
        newX++;
        break;
      case "down":
        newY++;
        break;
      case "left":
        newX--;
        break;
    }

    req.player.x = newX;
    req.player.y = newY;
  }

  res.json({ player: req.player, newCells });
});

server.post("/generate", async (req, res) => {
  const corners: [number, number][] = req.body.corners;

  for (const [startx, startY] of corners) {
  }
});

// server.post("/moves", async (req, res) => {
//   const direction: Direction = req.body.direction;

//   console.time("rpc");
//   // Get the target cell and check that it is walkable
//   const { data: target } = await req.rpc("get_target", { target: direction }).single();
//   console.timeEnd("rpc");

//   if (!isWalkable(target)) {
//     return res.json({ ok: false });
//   }

//   let newX = req.player.x;
//   let newY = req.player.y;
//   switch (direction) {
//     case "up":
//       newY--;
//       break;
//     case "right":
//       newX++;
//       break;
//     case "down":
//       newY++;
//       break;
//     case "left":
//       newX--;
//       break;
//   }
//   console.time("updateplayer");
//   const {
//     data: [updatedPlayer],
//   } = await req.from("player").update({ x: newX, y: newY });
//   req.player = updatedPlayer;
//   console.timeEnd("updateplayer");

//   const newViewport = (() => {
//     switch (direction) {
//       case "up":
//         return {
//           x: updatedPlayer.x - playerXInViewport,
//           y: updatedPlayer.y - playerYInViewport - 1,
//           width: viewportWidth,
//           height: 1,
//         };
//       case "right":
//         return {
//           x: updatedPlayer.x - playerXInViewport + viewportWidth + 1,
//           y: updatedPlayer.y - playerYInViewport,
//           width: 1,
//           height: viewportHeight,
//         };
//       case "down":
//         return {
//           x: updatedPlayer.x - playerXInViewport,
//           y: updatedPlayer.y - playerYInViewport + viewportHeight + 1,
//           width: viewportWidth,
//           height: 1,
//         };
//       case "left":
//         return {
//           x: updatedPlayer.x - playerXInViewport - 1,
//           y: updatedPlayer.y - playerYInViewport,
//           width: 1,
//           height: viewportHeight,
//         };
//     }
//   })();

//   const view = await req.getView(newViewport);

//   // Unzip the cells according to the direction
//   const newCells = (() => {
//     if (["left", "right"].includes(direction)) {
//       return view.map((line) => line[0]);
//     }
//     return view[0];
//   })();

//   console.time("json");
//   res.json({ player: req.player, newCells });
//   console.timeEnd("json");
// });

server.listen(8666);

// setInterval(() => {
//   console.log(mapValues(process.memoryUsage(), (value) => `${(value / (1024 * 1024)).toFixed(2)} Mb`));
// }, 2000);
