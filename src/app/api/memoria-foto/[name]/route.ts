import fs from "node:fs";
import { NextResponse } from "next/server";
import { resolveMemoriaFotoPath } from "@/lib/local-memorias";

type Props = { params: Promise<{ name: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { name } = await params;
  const relative = decodeURIComponent(name);
  const filePath = resolveMemoriaFotoPath(relative);

  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filePath.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "mp4"
      ? "video/mp4"
      : ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

  const body = fs.readFileSync(filePath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
