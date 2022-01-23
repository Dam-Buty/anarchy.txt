import wcwidth from "wcwidth";
import { getRectangle } from "./server/core/chunk";

const test = [
  [1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 1],
];

console.log(
  getRectangle(test, {
    corner: [2, 3],
    width: 2,
    height: 2,
  })
);

console.log("a", wcwidth("a"));
console.log("⻌", wcwidth("⻌"));
