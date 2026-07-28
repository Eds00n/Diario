/** Divisória editorial: linhas flex + coração âmbar suave. */
export function EntryGoldOrnament({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** Ornamento estreito centralizado (ex.: abaixo da data). */
  variant?: "default" | "under-date";
}) {
  const widthClass =
    variant === "under-date"
      ? "mx-auto w-full max-w-[14rem] sm:max-w-[16rem]"
      : "w-full max-w-md";

  return (
    <div
      className={`entry-gold-ornament flex items-center gap-3 text-amber-600/70 ${widthClass} ${className}`}
      aria-hidden
    >
      <span className="h-px flex-1 bg-current opacity-40" />
      <span className="text-[10px] leading-none">♥</span>
      <span className="h-px flex-1 bg-current opacity-40" />
    </div>
  );
}
