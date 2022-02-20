const blocks = [
  [32, 126],
  [128, 254],
];

const output: string[] = [];

for (const [start, end] of blocks) {
  console.log(start, end);
  for (let c = start; c <= end; c++) {
    console.log(c, String.fromCharCode(c));
    output.push(String.fromCharCode(c));
  }
}

console.log(output.join(""));
