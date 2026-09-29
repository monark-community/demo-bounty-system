import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TallyNode {
  id: string
  name: string
  initials: string
  vote: "approve" | "reject" | null
  isYou?: boolean
  fresh?: boolean
}

/**
 * Signature moment: validators are nodes that fill in as votes land; the bar
 * settles towards the quorum marker and locks when it is reached.
 */
export function VoteTally({
  nodes,
  quorum,
  label,
  reachedLabel,
  approveLabel,
  rejectLabel,
  notVotedLabel,
}: {
  nodes: TallyNode[]
  quorum: number
  label: string
  reachedLabel: string
  approveLabel: string
  rejectLabel: string
  notVotedLabel: string
}) {
  const approvals = nodes.filter((n) => n.vote === "approve").length
  const reached = approvals >= quorum
  const total = nodes.length

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2">
        {nodes.map((n) => (
          <li key={n.id} className="flex items-center gap-2 rounded-full border bg-background py-1 pr-3 pl-1">
            <span
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-200",
                n.vote === "approve" && "bg-primary text-primary-foreground",
                n.vote === "reject" && "border-2 border-destructive text-destructive",
                n.vote === null && "border-2 border-dashed border-input text-muted-foreground",
                n.fresh && "tf-stamp"
              )}
            >
              {n.vote === "approve" ? <CheckIcon className="size-4" aria-hidden="true" /> : n.vote === "reject" ? <XIcon className="size-4" aria-hidden="true" /> : n.initials}
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-bold">{n.name}</span>
              <span className="block text-xs text-muted-foreground">
                {n.vote === "approve" ? approveLabel : n.vote === "reject" ? rejectLabel : notVotedLabel}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div>
        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
          <span>{label}</span>
          {reached ? <span className="font-bold text-success">{reachedLabel}</span> : null}
        </div>
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={approvals}
          aria-label={label}
          className="relative mt-1.5 h-2.5 rounded-full bg-muted"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${(Math.min(approvals, total) / total) * 100}%` }}
          />
          {/* Quorum marker */}
          <span
            aria-hidden="true"
            className={cn("absolute -top-1 -bottom-1 w-0.5 rounded-full", reached ? "bg-success" : "bg-foreground")}
            style={{ left: `calc(${(quorum / total) * 100}% - 1px)` }}
          />
        </div>
      </div>
    </div>
  )
}
