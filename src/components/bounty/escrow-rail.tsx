"use client"

import { CheckIcon, LockIcon, UndoIcon, UserRoundIcon } from "lucide-react"

import { WalletAvatar } from "@/components/ui/wallet"
import { cn } from "@/lib/utils"

export interface RailParty {
  name: string
  address?: string
  caption: string
}

/**
 * Signature moment: the reward sits in an escrow bracket between the poster
 * and the contributor. On approval an orange line draws from the escrow to the
 * winner; on cancellation the line back to the poster lights up instead.
 */
export function EscrowRail({
  state,
  amount,
  token,
  poster,
  winner,
  lockedLabel,
  releasedLabel,
  refundedLabel,
  pendingWinner,
  justChanged,
  className,
}: {
  state: "locked" | "released" | "refunded"
  amount: string
  token: string
  poster: RailParty
  winner?: RailParty
  lockedLabel: string
  releasedLabel: string
  refundedLabel: string
  pendingWinner: string
  /** Play the transition (only right after a confirmed transaction). */
  justChanged?: boolean
  className?: string
}) {
  const released = state === "released"
  const refunded = state === "refunded"
  const settled = released || refunded

  return (
    <div className={cn("flex items-center", className)}>
      <Party party={poster} align="start" highlight={refunded} />

      <Connector active={!released} animate={refunded && justChanged} reverse />

      <div
        className={cn(
          "flex w-[7.5rem] shrink-0 flex-col items-center rounded-2xl border-2 bg-card px-2 py-3 text-center transition-colors duration-200 sm:w-40 sm:px-4",
          settled ? "border-border" : "border-primary"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[0.6875rem] font-bold tracking-wide uppercase",
            settled ? "text-muted-foreground" : "text-primary-ink"
          )}
        >
          {released ? (
            <CheckIcon className="size-3" aria-hidden="true" />
          ) : refunded ? (
            <UndoIcon className="size-3" aria-hidden="true" />
          ) : (
            <LockIcon className={cn("size-3", justChanged && "tf-stamp")} aria-hidden="true" />
          )}
          {released ? releasedLabel : refunded ? refundedLabel : lockedLabel}
        </span>
        <span className={cn("mt-0.5 text-xl font-extrabold tabular-nums sm:text-2xl", settled && "text-muted-foreground")}>{amount}</span>
        <span className="text-xs font-semibold text-muted-foreground">{token}</span>
      </div>

      <Connector active={released} animate={released && justChanged} dashed={!released} />

      {winner ? (
        <Party party={winner} align="end" highlight={released} />
      ) : (
        <div className="flex w-[4.5rem] shrink-0 flex-col items-end gap-1 text-right sm:w-44">
          <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-input text-muted-foreground">
            <UserRoundIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="text-xs leading-tight text-muted-foreground">{pendingWinner}</span>
        </div>
      )}
    </div>
  )
}

function Connector({ active, animate, dashed, reverse }: { active: boolean; animate?: boolean; dashed?: boolean; reverse?: boolean }) {
  return (
    <div aria-hidden="true" className="relative mx-1 h-6 min-w-3 flex-1 sm:mx-2">
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2",
          dashed ? "border-dashed border-input" : active ? "border-primary" : "border-border"
        )}
      />
      {animate ? (
        <span
          className={cn(
            "tf-grow absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-primary",
            reverse ? "origin-right" : "origin-left"
          )}
        />
      ) : null}
    </div>
  )
}

function Party({ party, align, highlight }: { party: RailParty; align: "start" | "end"; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-[4.5rem] shrink-0 flex-col gap-1 sm:w-44",
        align === "end" ? "items-end text-right" : "items-start text-left"
      )}
    >
      <span className={cn("rounded-full", highlight && "ring-2 ring-primary ring-offset-2 ring-offset-card")}>
        {party.address ? <WalletAvatar address={party.address} size={36} /> : null}
      </span>
      <span className="max-w-full truncate text-sm font-bold">{party.name}</span>
      <span className="max-w-full truncate text-xs text-muted-foreground">{party.caption}</span>
    </div>
  )
}
