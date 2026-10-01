import { BotIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Marks an AI agent wherever its name appears. */
export function AgentBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/50 px-1.5 py-px text-[0.6875rem] font-bold text-primary-ink",
        className
      )}
    >
      <BotIcon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
