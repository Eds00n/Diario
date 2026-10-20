/** Lírio em traço fino (como o gravado no pingente). Usa currentColor. */
export function Lirio({ className = "" }: { className?: string }) {
  const petala = "M24 24 C 21 18, 21.5 10, 24 4 C 26.5 10, 27 18, 24 24 Z";
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {/* pétalas de trás */}
      {[30, 150, 270].map((r) => (
        <path key={r} d={petala} transform={`rotate(${r} 24 24)`} opacity={0.55} />
      ))}
      {/* pétalas da frente, com a nervura central */}
      {[-30, 90, 210].map((r) => (
        <g key={r} transform={`rotate(${r} 24 24)`}>
          <path d={petala} />
          <path d="M24 22 L24 8" opacity={0.45} />
        </g>
      ))}
      {/* estames */}
      {[-50, -20, 10, 40].map((r) => (
        <g key={r} transform={`rotate(${r} 24 24)`}>
          <path d="M24 24 L24 15.5" opacity={0.8} />
          <ellipse cx={24} cy={14.6} rx={0.9} ry={1.6} fill="currentColor" stroke="none" />
        </g>
      ))}
      {/* haste e folha */}
      <path d="M24 26 C 24.5 33, 23.5 39, 24.5 46" />
      <path d="M24.3 37 C 28 34.5, 31.5 34.5, 34 35.5 C 31 37.5, 27.5 38, 24.3 37 Z" />
    </svg>
  );
}
