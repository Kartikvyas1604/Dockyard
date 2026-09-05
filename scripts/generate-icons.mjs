/**
 * Generates apps/web/app/favicon.ico from the Brass Lantern mark.
 * PNG-compressed entries at 16/32/48 — the modern ICO layout all
 * current browsers read. Run: pnpm --filter dockyard-icons generate
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "../apps/web/app/icon.svg");
const OUT = join(here, "../apps/web/app/favicon.ico");

const SIZES = [16, 32, 48];

async function pngFor(size) {
  return sharp(SRC, { density: 300 })
    .resize(size, size, { fit: "contain", background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png()
    .toBuffer();
}

function buildIco(entries) {
  // ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes each) + image blobs
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4); // count

  const dirSize = 6 + entries.length * 16;
  let offset = dirSize;
  const dir = Buffer.alloc(entries.length * 16);

  entries.forEach((e, i) => {
    const base = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, base); // width (0 = 256)
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, base + 1);
    dir.writeUInt8(0, base + 2); // palette
    dir.writeUInt8(0, base + 3);
    dir.writeUInt16LE(1, base + 4); // planes
    dir.writeUInt16LE(32, base + 6); // bpp
    dir.writeUInt32LE(e.data.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += e.data.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const entries = await Promise.all(
  SIZES.map(async (size) => ({ size, data: await pngFor(size) })),
);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buildIco(entries));
console.log(`favicon.ico written: ${SIZES.join(", ")} px entries → ${OUT}`);
