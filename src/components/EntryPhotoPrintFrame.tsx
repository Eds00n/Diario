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
    <div className={`entry-photo-print ${className}`}>
      <div className="entry-photo-print__inner">{children}</div>
    </div>
  );
}
