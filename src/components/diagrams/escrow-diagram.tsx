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
      <svg
        viewBox="0 0 720 280"
        role="img"
        aria-label={`${labels.poster} → ${labels.escrow} → ${labels.contributor}; ${labels.refund}`}
        className="h-auto w-full"
      >
        <defs>
          <marker id="esc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Nodes */}
        <g fill="var(--card)" stroke="var(--primary)" strokeWidth="2">
          <circle cx="120" cy="120" r="34" />
          <rect x="300" y="80" width="120" height="80" rx="18" />
          <circle cx="600" cy="120" r="34" />
        </g>

        {/* Wallet glyph */}
        <g fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="104" y="108" width="32" height="24" rx="5" />
          <path d="M 124 120 h 12" />
        </g>
        {/* Lock glyph */}
        <g fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="346" y="112" width="28" height="22" rx="4" />
          <path d="M 352 112 v -7 a 8 8 0 0 1 16 0 v 7" />
        </g>
        {/* Person glyph */}
        <g fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
          <circle cx="600" cy="112" r="8" />
          <path d="M 584 138 a 16 12 0 0 1 32 0" />
        </g>

        {/* Lock path */}
        <path d="M 160 120 H 292" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#esc-arrow)" />
        {/* Release path */}
        <path d="M 428 120 H 558" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#esc-arrow)" />
        {/* Refund path */}
        <path d="M 360 166 C 360 236, 120 236, 120 162" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" markerEnd="url(#esc-arrow)" />

        {/* Labels */}
        <g fill="var(--foreground)" fontFamily="inherit" fontWeight="700" fontSize="17" textAnchor="middle">
          <text x="120" y="182">{labels.poster}</text>
          <text x="360" y="62">{labels.escrow}</text>
          <text x="600" y="182">{labels.contributor}</text>
        </g>
        <g fill="var(--muted-foreground)" fontFamily="inherit" fontWeight="600" fontSize="16" textAnchor="middle">
          <text x="226" y="106">{labels.lock}</text>
          <text x="493" y="106">{labels.release}</text>
          <text x="240" y="262">{labels.refund}</text>
        </g>
      </svg>
    </figure>
  )
}
