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
