import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");

if (!fs.existsSync(outDir)) {
  console.error("publish-static-to-root: pasta out/ não encontrada. Rode npm run build:pages antes.");
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      copyRecursive(path.join(src, entry.name), path.join(dest, entry.name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

for (const name of fs.readdirSync(outDir)) {
  const src = path.join(outDir, name);
  const dest = path.join(root, name);
  fs.rmSync(dest, { recursive: true, force: true });
  copyRecursive(src, dest);
}

console.log("publish-static-to-root: site estático copiado de out/ para a raiz do repo.");
