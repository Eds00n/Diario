import sharp from "sharp";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

async function contentBBox(filePath, darkBackground) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      const isBorder = darkBackground ? lum < 25 : lum > 240;
      if (!isBorder) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const pad = 1;
  return {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(width, maxX - minX + 1 + pad * 2),
    height: Math.min(height, maxY - minY + 1 + pad * 2),
  };
}

const jobs = [
  { name: "memoria-marco-2025-treino-v2.png", dark: false },
  { name: "memoria-desmaiei-gi-v2.png", dark: true },
];

for (const job of jobs) {
  const filePath = path.join(root, job.name);
  const box = await contentBBox(filePath, job.dark);
  console.log(job.name, box);
  const out = await sharp(filePath).extract(box).png().toBuffer();
  const tempPath = filePath.replace(/\.png$/i, ".cropped.tmp.png");
  await sharp(out).toFile(tempPath);
  const fs = await import("node:fs");
  fs.renameSync(tempPath, filePath);
  const meta = await sharp(out).metadata();
  console.log("  saved", meta.width, "x", meta.height);
}
