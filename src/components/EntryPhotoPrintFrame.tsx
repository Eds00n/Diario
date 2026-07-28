import type { ReactNode } from "react";

/** Moldura papel fotográfico — borda branca + sombra suave. */
export function EntryPhotoPrintFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`entry-photo-print relative z-0 overflow-visible shadow-[0_10px_30px_rgba(28,28,26,0.18),0_24px_48px_-10px_rgba(28,28,26,0.14)] ${className}`}>
      <div className="entry-photo-print__inner">{children}</div>
    </div>
  );
}
