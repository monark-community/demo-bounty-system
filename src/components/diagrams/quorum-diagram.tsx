/**
 * Line art: three validators feed a 2-of-3 gate; two have approved, so the
 * payout line leaves the gate. Flat orange strokes only.
 */
export function QuorumDiagram({
  labels,
}: {
  labels: { label: string; quorum: string; approve: string; pending: string; payout: string }
}) {
  const ys = [50, 130, 210]
  const votes = [true, true, false]
  return (
    <figure className="rounded-3xl border bg-card p-4 sm:p-6">
      <svg viewBox="0 0 560 260" role="img" aria-label={labels.label} className="h-auto w-full">
        {ys.map((y, i) => (
          <g key={y}>
            <path
              d={`M 74 ${y} C 170 ${y}, 160 130, 240 130`}
              fill="none"
              stroke={votes[i] ? "var(--primary)" : "var(--input)"}
              strokeWidth={votes[i] ? 2.5 : 2}
              strokeDasharray={votes[i] ? undefined : "5 7"}
              strokeLinecap="round"
            />
            <circle cx="50" cy={y} r="24" fill={votes[i] ? "var(--primary)" : "var(--card)"} stroke={votes[i] ? "var(--primary)" : "var(--input)"} strokeWidth="2" strokeDasharray={votes[i] ? undefined : "4 5"} />
            {votes[i] ? (
              <path d={`M 40 ${y} l 7 7 l 13 -14`} fill="none" stroke="var(--primary-foreground)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
            <text x="50" y={y + 42} textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--muted-foreground)" fontFamily="inherit">
              {votes[i] ? labels.approve : labels.pending}
            </text>
          </g>
        ))}
        <rect x="240" y="95" width="160" height="70" rx="35" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
        <text x="320" y="136" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--foreground)" fontFamily="inherit">
          {labels.quorum}
        </text>
        <path d="M 404 130 H 500" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 490 120 L 502 130 L 490 140" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="470" y="112" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--foreground)" fontFamily="inherit">
          {labels.payout}
        </text>
      </svg>
    </figure>
  )
}
