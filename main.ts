// news-image-20261122 — "THE WORLD TODAY" front page for Sunday 22 November 2026.
// The image is pre-rendered and committed as entry.png beside this file; this
// program only copies it into the grader's output directory. Node 22, standard
// library only. The copy is deterministic: the same bytes go out every run.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
const DEST = join(OUT_DIR, "entry.png");
const LIMIT = 1024 * 1024; // the gate refuses an image over 1 MiB

const bytes = readFileSync(join(HERE, "entry.png"));
if (bytes.length === 0 || bytes.length > LIMIT) {
  console.error(`entry.png is ${bytes.length} bytes; the gate allows 1..${LIMIT}`);
  process.exit(1);
}
if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
  console.error("entry.png does not start with the PNG signature");
  process.exit(1);
}
// The gate also caps the image at 1024 by 1024 pixels: read them from IHDR.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  console.error(`entry.png is ${width}x${height}; the gate allows at most 1024x1024`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(DEST, bytes);

const back = readFileSync(DEST);
if (!back.equals(bytes)) {
  console.error("output copy differs from the committed image");
  process.exit(1);
}
console.log(`wrote ${DEST} (${bytes.length} bytes, verified)`);
