import { Next, Request, Response } from "restify";
import { viewportHeight, viewportWidth } from "../../client/constants";
import { playerOffset, renderOffset } from "../../lib/constants";
import { makeSupabase, Player } from "../../lib/supabase";
import { Direction } from "../../lib/utils";

export async function frontPage(req: Request, res: Response) {
  const { url } = await req.supabase.auth.signIn({ provider: "discord" });

  res.end(`
  <html>
  <body>
    <pre>${url}</pre>
  </body>
  </html>`);
}

export async function oauthPage(req: Request, res: Response) {
  res.end(`<html>
  <body>
  <pre id="content"></pre>
  <script>
    const hash = window.location.hash;
    document.getElementById("content").textContent = JSON.stringify(
      hash
        .split("#")[1]
        .split("&")
        .map(element => element.split("="))
        .reduce((acc, curr) => {
          acc[curr[0]] = curr[1];
          return acc;
        }, {}),
      null,
      2
    )
  </script>
  </body>
  </html>
  `);
}

const authCache: Record<string, number> = {};
const livePlayers: Record<
  number,
  {
    player: Player;
    lastUpdated: Date;
  }
> = {};

export async function authenticate(req: Request, res: Response, next: Next) {
  const { accessToken } = req.body || req.query || {};

  if (!accessToken) {
    return next();
  }

  const playerId = authCache[accessToken];

  // Try to authenticate the player from the memory cache
  if (playerId) {
    console.log("Authenticating user from cache");
    req.player = livePlayers[playerId].player;
    livePlayers[authCache[accessToken]].lastUpdated = new Date();
    return next();
  }

  console.log("Authenticating user from database");
  // Try to authenticate using the access token to connect to the database
  const { from } = makeSupabase(accessToken);
  // An authenticated player can only select their own row
  const { data: player, error } = await from("player")
    .select(
      `
    id,
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

  if (error) {
    console.log(error.message);
    return res.send(500);
  }

  if (!player) {
    return res.send(401, "Unauthorized");
  }

  // Cache the player's access token
  authCache[accessToken] = player.id;
  updateLivePlayer(player);
  req.player = player;

  next();
}

export function movePlayer(req: Request, direction: Direction) {
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

  updateLivePlayer(req.player);
  req.dispatcher.emit("player", { req, player: req.player });
}

function updateLivePlayer(player: Player) {
  livePlayers[player.id] = {
    player,
    lastUpdated: new Date(),
  };
}
