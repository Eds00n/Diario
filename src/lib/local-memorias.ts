import fs from "node:fs";
import path from "node:path";
import type { Entry, SpecialDate } from "@/lib/types";
import { assetPath } from "@/lib/asset-path";

function isStaticExportBuild(): boolean {
  return process.env.STATIC_EXPORT === "1";
}

/** Raiz "E. S." (pasta pai do app nosso-diario) ou raiz do repo no GitHub Pages */
export function getMemoriasRoot(): string {
  if (isStaticExportBuild()) {
    return process.cwd();
  }
  return path.resolve(process.cwd(), "..");
}

function mediaUrlForFile(relativeFile: string): string {
  const normalized = relativeFile.replace(/\\/g, "/");
  const fileName = path.basename(normalized);
  const encodedName = encodeURIComponent(fileName);
  if (isStaticExportBuild()) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
    return `${base}/memorias/${encodedName}`;
  }
  const publicCopy = path.join(process.cwd(), "public", "memorias", fileName);
  if (fs.existsSync(publicCopy)) {
    return `/memorias/${encodedName}`;
  }
  return `/api/memoria-foto/${encodeURIComponent(normalized)}`;
}

export function getMemoriasJsonPath(): string {
  return path.join(getMemoriasRoot(), "content", "memorias.json");
}

type MemoriasJsonItem = {
  data: string;
  data_fim?: string;
  foto?: string;
  fotos?: string[];
  texto: string;
  titulo?: string;
  citacao_apenas?: boolean;
  texto_complemento?: string;
  texto_abaixo?: string;
  texto_abaixo_direita?: string;
  is_data_especial?: boolean;
  foto_importante?: boolean;
  foto_importante_banner?: boolean;
  foto_direita?: boolean;
  foto_revelar_blur?: boolean;
  foto_object_position?: string;
  foto_object_scale?: number;
  fundo_imersivo?: string;
  fundo_imersivo_grupo?: boolean;
};

function toMediaUrls(files: string[]): string[] {
  return files.map((f) => mediaUrlForFile(f));
}

export function loadMemoriasFromJson(): Entry[] {
  const jsonPath = getMemoriasJsonPath();
  if (!fs.existsSync(jsonPath)) {
    return [];
  }

  const raw = JSON.parse(
    fs.readFileSync(jsonPath, "utf8"),
  ) as MemoriasJsonItem[];

  return raw.map((item, index) => {
    const isBanner = item.foto_importante_banner === true && !!item.foto;

    let fotos: string[];
    let fotosAbaixo: string[] | undefined;

    if (isBanner) {
      fotos = toMediaUrls([item.foto!]);
      fotosAbaixo =
        item.fotos && item.fotos.length > 0
          ? toMediaUrls(item.fotos)
          : undefined;
    } else {
      const files =
        item.fotos && item.fotos.length > 0
          ? item.fotos
          : item.foto
            ? [item.foto]
            : [];
      fotos = toMediaUrls(files);
    }

    return {
      id: `memoria-local-${index}`,
      data: item.data,
      data_fim: item.data_fim,
      titulo: item.titulo,
      citacao_apenas: item.citacao_apenas ?? false,
      texto: item.texto ?? "",
      texto_complemento: item.texto_complemento,
      texto_abaixo: item.texto_abaixo,
      texto_abaixo_direita: item.texto_abaixo_direita,
      fotos,
      fotos_abaixo: fotosAbaixo,
      is_data_especial: item.is_data_especial ?? false,
      foto_importante: item.foto_importante ?? false,
      foto_importante_banner: item.foto_importante_banner ?? false,
      foto_direita: item.foto_direita ?? false,
      foto_revelar_blur: item.foto_revelar_blur ?? false,
      foto_object_position: item.foto_object_position,
      foto_object_scale: item.foto_object_scale,
      fundo_imersivo: item.fundo_imersivo
        ? assetPath(`/images/${item.fundo_imersivo.replace(/^\/+/, "")}`)
        : undefined,
      fundo_imersivo_grupo: item.fundo_imersivo_grupo ?? false,
      created_at: `${item.data}T12:00:00.000Z`,
    };
  });
}

export function resolveMemoriaFotoPath(relativeFile: string): string | null {
  const root = getMemoriasRoot();
  const normalized = relativeFile.replace(/\\/g, "/");
  if (normalized.includes("..") || normalized.startsWith("/")) {
    return null;
  }
  const full = path.join(root, normalized);
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(root) + path.sep)) {
    return null;
  }
  if (!fs.existsSync(resolved)) {
    return null;
  }
  return resolved;
}

export function loadSpecialDatesFromJson(): SpecialDate[] {
  const jsonPath = path.join(getMemoriasRoot(), "content", "datas-especiais.json");
  if (!fs.existsSync(jsonPath)) {
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Array<{
    nome?: string;
    subtitulo?: string;
    data: string;
    recorrente?: boolean;
  }>;
  return raw.map((item, index) => ({
    id: `local-sd-${index}`,
    nome: item.nome,
    subtitulo: item.subtitulo,
    data: item.data,
    recorrente: item.recorrente ?? false,
    created_at: `${item.data}T12:00:00.000Z`,
  }));
}
