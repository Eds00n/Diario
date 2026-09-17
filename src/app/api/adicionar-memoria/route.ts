import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getMemoriasJsonPath, getMemoriasRoot } from "@/lib/local-memorias";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Ferramenta temporária de cadastro rápido — só funciona no modo local-json
 * (sem Supabase configurado), o mesmo modo já usado neste dev local. */
function isLocalJsonMode(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
};

type Body = {
  data: string;
  texto: string;
  mediaBase64?: string;
  mediaMime?: string;
};

export async function POST(request: Request) {
  if (!isLocalJsonMode()) {
    return NextResponse.json(
      { error: "Disponível só no modo local (sem Supabase) em dev." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as Body;
  const data = body.data?.trim();
  const texto = body.texto?.trim() ?? "";

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }
  if (!texto && !body.mediaBase64) {
    return NextResponse.json(
      { error: "Adicione um texto ou uma foto." },
      { status: 400 },
    );
  }

  const root = getMemoriasRoot();
  const jsonPath = getMemoriasJsonPath();
  const raw = fs.existsSync(jsonPath)
    ? (JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Record<string, unknown>[])
    : [];

  const entry: Record<string, unknown> = {
    data,
    texto,
    is_data_especial: false,
  };

  if (body.mediaBase64) {
    const ext = EXT_BY_MIME[body.mediaMime ?? ""] ?? "jpg";
    const filename = `memoria-add-${Date.now()}.${ext}`;
    const bytes = Buffer.from(body.mediaBase64, "base64");

    fs.writeFileSync(path.join(root, filename), bytes);

    const publicDir = path.join(process.cwd(), "public", "memorias");
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, filename), bytes);

    entry.foto = filename;
  }

  raw.push(entry);
  fs.writeFileSync(jsonPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");

  return NextResponse.json({ ok: true, entry });
}
