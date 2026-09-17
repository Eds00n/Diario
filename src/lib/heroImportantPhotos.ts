import type { Entry } from "@/lib/types";

const TAPE_TILTS = ["-6deg", "8deg", "-7deg"] as const;
const SLOTS = [
  "hero-frame-photo--left",
  "hero-frame-photo--top-right",
  "hero-frame-photo--bottom-right",
] as const;

export type HeroPolaroidPhoto = {
  key: string;
  url: string;
  tapeTilt: string;
  slot: string;
  objectPosition?: string;
  objectScale?: number;
};

export function getHeroImportantPhotos(entries: Entry[]): HeroPolaroidPhoto[] {
  const pinned = entries.filter(
    (entry) => entry.polaroid_hero === true && entry.fotos.length > 0,
  );
  const important = entries.filter(
    (entry) =>
      entry.foto_importante === true &&
      entry.polaroid_hero !== true &&
      entry.fotos.length > 0,
  );

  return [...pinned, ...important]
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3)
    .map((entry, index) => ({
      key: entry.id,
      url: entry.polaroid_foto ?? entry.fotos[0]!,
      tapeTilt: TAPE_TILTS[index] ?? "-7deg",
      slot: SLOTS[index] ?? "hero-frame-photo--bottom-right",
      objectPosition: entry.foto_object_position,
      objectScale: entry.foto_object_scale,
    }));
}

export function isVideoMediaUrl(url: string): boolean {
  return decodeURIComponent(url).toLowerCase().includes(".mp4");
}

export type HeroClotheslinePhoto = {
  key: string;
  url: string;
  objectPosition?: string;
  objectScale?: number;
};

/** Gerador pseudo-aleatório com seed fixa — a ordem embaralhada do varal
 * precisa sair IGUAL no server (SSR) e no client (hidratação); usar
 * `Math.random()` direto gera uma ordem em cada lado e quebra a hidratação
 * do React (mismatch). A seed muda por dia, então a ordem varia dia a dia
 * mas nunca diverge entre server e client dentro do mesmo dia. */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Resolve a foto/URL representativa de uma entrada — usada pro varal, que só
 * mostra imagem (vídeo autoplay às vezes renderiza em branco antes do
 * primeiro frame, o que deixava um polaroid vazio pendurado). */
function heroPhotoUrl(entry: Entry): string | undefined {
  const url = entry.polaroid_foto ?? entry.fotos[0];
  return url && !isVideoMediaUrl(url) ? url : undefined;
}

/** Fotos pra "varal" do hero — prioridade 1 é a curadoria dedicada
 * (`varal_hero`, escolhida a dedo pro varal e independente dos outros
 * destaques da timeline); prioridade 2 são os destaques gerais
 * (polaroid_hero/foto_importante); o resto das vagas é preenchido com fotos
 * normais. Nunca repete a mesma foto duas vezes no varal, e nunca inclui
 * vídeo (só imagem), pra nenhum polaroid ficar em branco. A ordem final é
 * embaralhada — não segue a data das entradas. */
export function getHeroClotheslinePhotos(
  entries: Entry[],
  count: number,
): HeroClotheslinePhoto[] {
  const curated = entries.filter(
    (entry) => entry.varal_hero === true && heroPhotoUrl(entry),
  );
  const pinned = entries.filter(
    (entry) =>
      entry.polaroid_hero === true &&
      entry.varal_hero !== true &&
      heroPhotoUrl(entry),
  );
  const important = entries.filter(
    (entry) =>
      entry.foto_importante === true &&
      entry.polaroid_hero !== true &&
      entry.varal_hero !== true &&
      heroPhotoUrl(entry),
  );
  const normal = entries.filter(
    (entry) =>
      entry.polaroid_hero !== true &&
      entry.foto_importante !== true &&
      entry.varal_hero !== true &&
      heroPhotoUrl(entry),
  );

  const rand = seededRandom(dailySeed());
  const priority = [...curated, ...pinned, ...important];
  const rest = shuffled(normal, rand);

  const seenUrls = new Set<string>();
  const result: HeroClotheslinePhoto[] = [];

  for (const entry of [...priority, ...rest]) {
    if (result.length >= count) break;
    const url = heroPhotoUrl(entry)!;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    result.push({
      key: entry.id,
      url,
      objectPosition: entry.foto_object_position,
      objectScale: entry.foto_object_scale,
    });
  }

  return shuffled(result, rand);
}
