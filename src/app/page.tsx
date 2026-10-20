import "./diario.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Diario } from "@/components/diario/Diario";
import { listarDatasEspeciais, listarMemorias } from "@/lib/diario/store";
import { isSiteAuthenticated } from "@/lib/site-auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Segunda trava além do proxy: sem login, nada de memórias.
  if (!(await isSiteAuthenticated(await cookies()))) redirect("/login");

  const [memorias, datas] = await Promise.all([listarMemorias(), listarDatasEspeciais()]);
  // Data em que começou o namoro: a data especial "Juntos há" (ou a primeira cadastrada).
  const inicio =
    datas.find((d) => /juntos/i.test(`${d.subtitulo ?? ""} ${d.nome ?? ""}`))?.data ?? datas[0]?.data ?? null;

  return (
    <main className="min-h-full flex-1">
      <Diario
        memorias={memorias}
        inicio={inicio}
        nomeEle={process.env.NOME_ELE?.trim() || "Edson"}
        nomeEla={process.env.NOME_ELA?.trim() || "ela"}
      />
    </main>
  );
}
