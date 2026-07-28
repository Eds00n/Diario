/** Detalhe editorial: linhas finas + coração dourado fosco. */
export function EntryGoldOrnament({ className = "" }: { className?: string }) {
  return (
    <div
      className={`entry-gold-ornament flex items-center justify-center gap-3 ${className}`}
      aria-hidden
    >
      <span className="entry-gold-ornament__line" />
      <span className="entry-gold-ornament__heart">♥</span>
      <span className="entry-gold-ornament__line" />
    </div>
  );
}
