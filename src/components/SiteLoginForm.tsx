import { GateCardShell } from "@/components/GateCardShell";

export function SiteLoginForm({
  action,
  next,
  showError,
}: {
  action: (formData: FormData) => Promise<void>;
  next: string;
  showError: boolean;
}) {
  return (
    <GateCardShell>
      <form action={action} className="mt-5 flex w-full flex-col gap-2.5 md:mt-8">
        <input type="hidden" name="next" value={next} />
        <label
          htmlFor="senha"
          className="text-left text-[10px] font-medium uppercase tracking-[0.22em] text-gold"
        >
          senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          placeholder="a nossa palavra"
          className={`h-[52px] w-full rounded-[3px] border bg-paper px-4 font-body text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:shadow-[0_0_0_3px_rgba(200,169,106,0.16)] md:h-[54px] md:px-[18px] md:text-base ${
            showError
              ? "border-gold shadow-[0_0_0_3px_rgba(200,169,106,0.16)]"
              : "border-hairline focus:border-gold/60"
          }`}
        />
        {showError ? (
          <div className="flex items-start gap-2 pl-0.5 text-left" role="alert">
            <span className="text-[13px] leading-[1.35] text-gold" aria-hidden>
              ♡
            </span>
            <span className="font-display text-[16px] italic leading-[1.35] text-ink-soft md:text-[17px]">
              Não foi essa palavra. Tenta de novo —{" "}
              <span className="font-script text-[19px] not-italic text-gold md:text-[21px]">
                vai da certo
              </span>
            </span>
          </div>
        ) : null}
        <button
          type="submit"
          className="mt-1 h-[52px] w-full rounded-[3px] bg-ink font-body text-[12px] font-medium uppercase tracking-[0.24em] text-paper transition-colors hover:bg-[#2e2e2a] md:h-[54px]"
        >
          Entrar
        </button>
      </form>
    </GateCardShell>
  );
}
