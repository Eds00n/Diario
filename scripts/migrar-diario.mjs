#!/usr/bin/env node
/**
 * Migra o Nosso Diário do formato antigo (content/memorias.json + fotos soltas)
 * pro formato novo do diário (diario.json + pasta midias/).
 *
 * Não apaga nem altera NADA na origem. Só lê e copia.
 *
 * Uso:
 *   node migrar-diario.mjs --origem /caminho/do/projeto/antigo --destino /var/www/diario-data
 *   node migrar-diario.mjs --origem ... --destino ... --simular   (só mostra o que faria)
 *
 * Saída em --destino:
 *   diario.json   → { versao, gerado_em, memorias: [...], datas_especiais: [...] }
 *   midias/       → fotos e vídeos renomeados (AAAA-MM-DD-hash.ext), sem duplicatas
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ── argumentos ────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
const ORIGEM = path.resolve(arg("--origem") ?? ".");
const DESTINO = path.resolve(arg("--destino") ?? "./diario-data");
const SIMULAR = args.includes("--simular");
const AUTOR_PADRAO = arg("--autor") ?? "edson";

const JSON_MEMORIAS = path.join(ORIGEM, "content", "memorias.json");
const JSON_DATAS = path.join(ORIGEM, "content", "datas-especiais.json");
const PASTAS_BUSCA = [
  "",
  "memorias",
  "public/memorias",
  "public/images",
  "images",
  "nosso-diario/public/memorias",
  "nosso-diario/public/images",
  "_build-vps",
  "_build-vps/memorias",
];
const EXT_VIDEO = new Set([".mp4", ".mov", ".webm", ".m4v"]);

if (!fs.existsSync(JSON_MEMORIAS)) {
  console.error(`✗ Não achei ${JSON_MEMORIAS}. Confere o --origem.`);
  process.exit(1);
}

const destinoJson = path.join(DESTINO, "diario.json");
if (fs.existsSync(destinoJson) && !args.includes("--sobrescrever")) {
  console.error(
    `✗ ${destinoJson} já existe. Pra não perder memórias novas, a migração não sobrescreve.\n` +
      `  Se tiver certeza, rode de novo com --sobrescrever.`,
  );
  process.exit(1);
}

// ── helpers ───────────────────────────────────────────────────
const hash = (buf, n = 10) => crypto.createHash("sha1").update(buf).digest("hex").slice(0, n);

function acharArquivo(nome) {
  const limpo = nome.replace(/\\/g, "/").replace(/^\/+/, "");
  for (const pasta of PASTAS_BUSCA) {
    const p = path.join(ORIGEM, pasta, limpo);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    const pBase = path.join(ORIGEM, pasta, path.basename(limpo));
    if (fs.existsSync(pBase) && fs.statSync(pBase).isFile()) return pBase;
  }
  return null;
}

const copiados = new Map(); // hash do conteúdo → nome final
const faltando = [];
let bytesCopiados = 0;

function migrarMidia(nomeOriginal, data) {
  const origem = acharArquivo(nomeOriginal);
  if (!origem) {
    faltando.push(`${data}: ${nomeOriginal}`);
    return null;
  }
  const conteudo = fs.readFileSync(origem);
  const h = hash(conteudo);
  const ext = path.extname(origem).toLowerCase().replace(".jpeg", ".jpg");
  const tipo = EXT_VIDEO.has(ext) ? "video" : "foto";

  if (!copiados.has(h)) {
    const nomeFinal = `${data}-${h}${ext}`;
    copiados.set(h, nomeFinal);
    bytesCopiados += conteudo.length;
    if (!SIMULAR) fs.copyFileSync(origem, path.join(DESTINO, "midias", nomeFinal));
  }
  return { arquivo: copiados.get(h), tipo, original: nomeOriginal };
}

// ── migração ──────────────────────────────────────────────────
if (!SIMULAR) fs.mkdirSync(path.join(DESTINO, "midias"), { recursive: true });

const antigas = JSON.parse(fs.readFileSync(JSON_MEMORIAS, "utf8"));

const memorias = antigas.map((item, index) => {
  // Ordem das mídias: banner (foto) primeiro, depois fotos, depois foto do polaroid do hero.
  const nomes = [];
  if (item.foto) nomes.push(item.foto);
  for (const f of item.fotos ?? []) nomes.push(f);
  for (const f of item.fotos_abaixo ?? []) nomes.push(f);
  if (item.polaroid_foto) nomes.push(item.polaroid_foto);

  const midias = [];
  const vistos = new Set();
  for (const nome of nomes) {
    const m = migrarMidia(nome, item.data);
    if (m && !vistos.has(m.arquivo)) {
      vistos.add(m.arquivo);
      midias.push({ arquivo: m.arquivo, tipo: m.tipo });
    }
  }

  const texto = [item.texto, item.texto_complemento, item.texto_abaixo, item.texto_abaixo_direita]
    .map((t) => (t ?? "").trim())
    .filter(Boolean)
    .join("\n\n");

  return {
    id: `m_${hash(`${index}|${item.data}|${item.texto ?? ""}`, 12)}`,
    data: item.data,
    titulo: item.titulo?.trim() || null,
    texto,
    midias,
    autor: AUTOR_PADRAO,
    momento_especial: Boolean(
      item.foto_importante || item.foto_importante_banner || item.carrossel_polaroid,
    ),
    data_especial: Boolean(item.is_data_especial),
    criado_em: `${item.data}T12:00:00.000Z`,
    atualizado_em: null,
    // Tudo do formato antigo fica guardado aqui. Nada se perde.
    _legado: { indice: index, ...item },
  };
});

// Mais novas em cima.
memorias.sort((a, b) => b.data.localeCompare(a.data) || b._legado.indice - a._legado.indice);

const datasEspeciais = fs.existsSync(JSON_DATAS)
  ? JSON.parse(fs.readFileSync(JSON_DATAS, "utf8")).map((d, i) => ({
      id: `d_${hash(`${i}|${d.data}`, 8)}`,
      nome: d.nome ?? null,
      subtitulo: d.subtitulo ?? null,
      data: d.data,
      recorrente: d.recorrente ?? false,
    }))
  : [];

const saida = {
  versao: 1,
  gerado_em: new Date().toISOString(),
  memorias,
  datas_especiais: datasEspeciais,
};

if (!SIMULAR) {
  // Escrita atômica: grava num temporário e renomeia.
  const tmp = `${destinoJson}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(saida, null, 2));
  fs.renameSync(tmp, destinoJson);
}

// ── relatório ─────────────────────────────────────────────────
const porMes = {};
for (const m of memorias) porMes[m.data.slice(0, 7)] = (porMes[m.data.slice(0, 7)] ?? 0) + 1;

console.log(SIMULAR ? "\n— SIMULAÇÃO (nada foi gravado) —\n" : "\n✓ Migração concluída\n");
console.log(`Origem:   ${ORIGEM}`);
console.log(`Destino:  ${DESTINO}`);
console.log(`Memórias: ${antigas.length} lidas → ${memorias.length} migradas`);
console.log(`Momentos especiais: ${memorias.filter((m) => m.momento_especial).length}`);
console.log(`Só texto: ${memorias.filter((m) => m.midias.length === 0).length}`);
console.log(`Mídias:   ${copiados.size} arquivos únicos (${(bytesCopiados / 1048576).toFixed(1)} MB)`);
console.log(`Datas especiais: ${datasEspeciais.length}`);
console.log("\nPor mês (mais novo → mais antigo):");
for (const [mes, n] of Object.entries(porMes)) console.log(`  ${mes}  ${"●".repeat(n)} ${n}`);
if (faltando.length) {
  console.log(`\n⚠ ${faltando.length} mídia(s) não encontrada(s) (a memória foi migrada sem elas):`);
  for (const f of faltando) console.log(`  - ${f}`);
  process.exitCode = 2;
}
