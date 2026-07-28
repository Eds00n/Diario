import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function firstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const memoriasJson = firstExisting([
  path.join(root, "content", "memorias.json"),
  path.join(root, "..", "content", "memorias.json"),
]);

if (!memoriasJson) {
  console.error(
    "prepare-static-assets: não achei content/memorias.json (no projeto ou na pasta pai).",
  );
  process.exit(1);
}

const targetContentDir = path.join(root, "content");
if (path.dirname(memoriasJson) !== targetContentDir) {
  fs.mkdirSync(targetContentDir, { recursive: true });
  fs.copyFileSync(memoriasJson, path.join(targetContentDir, "memorias.json"));
}

const datasSrc = firstExisting([
  path.join(root, "content", "datas-especiais.json"),
  path.join(root, "..", "content", "datas-especiais.json"),
]);
if (datasSrc && datasSrc !== path.join(targetContentDir, "datas-especiais.json")) {
  fs.copyFileSync(datasSrc, path.join(targetContentDir, "datas-especiais.json"));
}

const items = JSON.parse(fs.readFileSync(memoriasJson, "utf8"));
const filenames = new Set();
for (const item of items) {
  if (item.foto) filenames.add(item.foto);
  if (Array.isArray(item.fotos)) item.fotos.forEach((f) => filenames.add(f));
}

const outDir = path.join(root, "public", "memorias");
fs.mkdirSync(outDir, { recursive: true });

const searchRoots = [root, path.join(root, "..")];
let copied = 0;
const missing = [];

for (const name of filenames) {
  const normalized = name.replace(/\\/g, "/");
  if (normalized.includes("..") || normalized.startsWith("/")) continue;

  let src = null;
  for (const base of searchRoots) {
    const candidate = path.join(base, normalized);
    if (fs.existsSync(candidate)) {
      src = candidate;
      break;
    }
  }

  if (!src) {
    missing.push(name);
    continue;
  }

  const dest = path.join(outDir, path.basename(normalized));
  fs.copyFileSync(src, dest);
  copied += 1;
}

console.log(`prepare-static-assets: ${copied} arquivo(s) em public/memorias/`);
if (missing.length > 0) {
  console.warn("Arquivos não encontrados (fotos/vídeos):", missing.slice(0, 8).join(", "));
  if (missing.length > 8) console.warn(`… e mais ${missing.length - 8}`);
}
