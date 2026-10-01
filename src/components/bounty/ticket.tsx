import { BotIcon, CheckCircle2Icon, ClockIcon, LockIcon, MessageSquareTextIcon, ShieldIcon, UndoIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import type { AgentPolicy, Visibility } from "@/lib/demo/types"

export type TicketStatus = "open" | "closed" | "paid" | "cancelled"

export interface TicketProps {
  href?: string
  linkLabel?: string
  title: string
  org: string
  category: string
  difficulty: string
  visibility: Visibility
  visibilityLabel: string
  /** Shown only when agents may submit. */
  agents?: AgentPolicy
  agentsLabel?: string
  amount: string
  token: string
  stubLabel: string
  status: TicketStatus
  statusLabel: string
  deadline?: string
  submissions?: string
  flag?: string
  className?: string
  /** Heading level for the title inside lists. */
  as?: "h2" | "h3"
  /** Narrow stub, for side columns. */
  compact?: boolean
}

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: "border-primary/60 text-foreground",
  closed: "border-warning/60 text-warning",
  paid: "border-success/60 text-success",
  cancelled: "border-input text-muted-foreground",
}

const STATUS_ICON: Record<TicketStatus, ReactNode> = {
  open: <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />,
  closed: <ClockIcon className="size-3" aria-hidden="true" />,
  paid: <CheckCircle2Icon className="size-3" aria-hidden="true" />,
  cancelled: <UndoIcon className="size-3" aria-hidden="true" />,
}

export function StatusPill({ status, label, className }: { status: TicketStatus; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-bold whitespace-nowrap",
        STATUS_STYLE[status],
        className
      )}
    >
      {STATUS_ICON[status]}
      {label}
    </span>
  )
}

export function VisibilityIcon({ visibility, className }: { visibility: Visibility; className?: string }) {
  if (visibility === "everyone") return null
  return visibility === "ambassadors" ? (
    <ShieldIcon className={cn("size-3.5", className)} aria-hidden="true" />
  ) : (
    <UsersIcon className={cn("size-3.5", className)} aria-hidden="true" />
  )
}

/**
 * A bounty drawn as a ticket: the task on the left, the reward on a stub
 * behind a perforated edge. The one visual motif shared by the hero, the
 * board, the composer preview and the home cards.
 */
export function Ticket(props: TicketProps) {
  const {
    href,
    linkLabel,
    title,
    org,
    category,
    difficulty,
    visibility,
    visibilityLabel,
    agents,
    agentsLabel,
    amount,
    token,
    stubLabel,
    status,
    statusLabel,
    deadline,
    submissions,
    flag,
    className,
    as: Heading = "h3",
    compact = false,
  } = props
  const settled = status === "paid" || status === "cancelled"

  return (
    <article
      className={cn(
        "group relative flex min-w-0 rounded-2xl border bg-card transition-colors duration-150",
        href && "hover:border-primary/70 focus-within:border-primary",
        className
      )}
    >
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2 p-4", !compact && "sm:p-5")}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted-foreground">
          <span className="text-foreground">{org}</span>
          <span aria-hidden="true">·</span>
          <span>{category}</span>
          <span aria-hidden="true">·</span>
          <span>{difficulty}</span>
          {flag ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] font-bold text-foreground">{flag}</span>
          ) : null}
        </p>
        <Heading className="text-base leading-snug font-bold text-balance sm:text-lg">
          {href ? (
            <Link
              href={href}
              aria-label={linkLabel}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <StatusPill status={status} label={statusLabel} />
          {deadline ? (
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" aria-hidden="true" />
              {deadline}
            </span>
          ) : null}
          {submissions ? (
            <span className="inline-flex items-center gap-1">
              <MessageSquareTextIcon className="size-3.5" aria-hidden="true" />
              {submissions}
            </span>
          ) : null}
          {visibility !== "everyone" ? (
            <span className="inline-flex items-center gap-1">
              <VisibilityIcon visibility={visibility} />
              {visibilityLabel}
            </span>
          ) : null}
          {agents && agents !== "humans" ? (
            <span className="inline-flex items-center gap-1">
              <BotIcon className="size-3.5" aria-hidden="true" />
              {agentsLabel}
            </span>
          ) : null}
        </p>
      </div>
      <div
        className={cn(
          "flex w-[7.25rem] shrink-0 flex-col items-end justify-center gap-0.5 border-l-2 border-dashed p-4 text-right",
          !compact && "sm:w-40 sm:p-5"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[0.6875rem] font-bold tracking-wide uppercase",
            settled ? "text-muted-foreground" : "text-primary-ink"
          )}
        >
          {!settled ? <LockIcon className="size-3" aria-hidden="true" /> : null}
          {stubLabel}
        </span>
        <span className="text-xl leading-tight font-extrabold tabular-nums sm:text-2xl">{amount}</span>
        <span className="text-xs font-semibold text-muted-foreground">{token}</span>
      </div>
    </article>
  )
}
