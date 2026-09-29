/**
 * Line art: poster's wallet -> escrow -> approved contributor, with the refund
 * path looping back. Flat orange strokes, no fills beyond the card colour.
 */
export function EscrowDiagram({
  labels,
}: {
  labels: { poster: string; escrow: string; contributor: string; refund: string; lock: string; release: string }
}) {
  return (
    <figure className="rounded-3xl border bg-card p-4 sm:p-6">
      <svg viewBox="0 0 640 260" role="img" aria-label={`${labels.poster} → ${labels.escrow} → ${labels.contributor}; ${labels.refund}`} className="h-auto w-full">
        <defs>
          <marker id="esc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Nodes */}
        <g fill="var(--card)" stroke="var(--primary)" strokeWidth="2">
          <circle cx="80" cy="110" r="34" />
          <rect x="250" y="70" width="140" height="80" rx="18" />
          <circle cx="560" cy="110" r="34" />
        </g>

        {/* Wallet glyph */}
        <g fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="64" y="98" width="32" height="24" rx="5" />
          <path d="M 84 110 h 12" />
        </g>
        {/* Lock glyph */}
        <g fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="306" y="102" width="28" height="22" rx="4" />
          <path d="M 312 102 v -7 a 8 8 0 0 1 16 0 v 7" />
        </g>
        {/* Person glyph */}
        <g fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
          <circle cx="560" cy="102" r="8" />
          <path d="M 544 128 a 16 12 0 0 1 32 0" />
        </g>

        {/* Lock path */}
        <path d="M 118 110 H 244" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#esc-arrow)" />
        {/* Release path */}
        <path d="M 396 110 H 520" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#esc-arrow)" />
        {/* Refund path */}
        <path d="M 320 156 C 320 220, 80 220, 80 150" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" markerEnd="url(#esc-arrow)" />

        {/* Labels */}
        <g fill="var(--foreground)" fontFamily="inherit" fontWeight="700" fontSize="19" textAnchor="middle">
          <text x="80" y="170">{labels.poster}</text>
          <text x="320" y="56">{labels.escrow}</text>
          <text x="560" y="170">{labels.contributor}</text>
        </g>
        <g fill="var(--muted-foreground)" fontFamily="inherit" fontWeight="600" fontSize="16" textAnchor="middle">
          <text x="182" y="98">{labels.lock}</text>
          <text x="458" y="98">{labels.release}</text>
          <text x="200" y="232">{labels.refund}</text>
        </g>
      </svg>
    </figure>
  )
}
