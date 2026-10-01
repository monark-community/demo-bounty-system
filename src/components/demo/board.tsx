"use client"

import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Ticket } from "@/components/bounty/ticket"
import { ticketProps } from "@/components/bounty/ticket-props"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatNumber, formatUsdWhole, plural } from "@/lib/format"
import { boardSummary, displayStatus, rankOf, submitBlock } from "@/lib/demo/select"
import { useDemo } from "@/lib/demo/store"
import { CATEGORIES, type Category } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { ConnectCard } from "./app-frame"
import { NativeSelect } from "./native-select"

type StatusFilter = "open" | "closed" | "done" | "all"
const STATUS_FILTERS: StatusFilter[] = ["open", "closed", "done", "all"]
const PAGE = 4

export function Board() {
  const demo = useDemo()
  const { app, labels, locale } = useAppCopy()
  const b = app.board
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("open")
  const [category, setCategory] = useState<Category | "all">("all")
  const [mine, setMine] = useState(false)
  // Long lists are paged: the first few, then "Show more".
  const [showAll, setShowAll] = useState(false)
  const [now] = useState(() => Date.now())

  const list = useMemo(() => {
    if (!demo) return []
    const q = query.trim().toLowerCase()
    return demo.bounties
      .filter((x) => {
        const st = displayStatus(x, now)
        if (status === "open" && st !== "open") return false
        if (status === "closed" && st !== "closed") return false
        if (status === "done" && st !== "paid" && st !== "cancelled") return false
        if (category !== "all" && x.category !== category) return false
        if (mine && submitBlock(demo, x, now) !== null) return false
        if (q) {
          const hay = [x.title, x.org, x.description, ...x.skills, labels.category[x.category]].join(" ").toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, c) => {
        // Open first by closest deadline; settled ones by most recent.
        const sa = displayStatus(a, now)
        const sc = displayStatus(c, now)
        const rank = (s: string) => (s === "open" ? 0 : s === "closed" ? 1 : 2)
        if (rank(sa) !== rank(sc)) return rank(sa) - rank(sc)
        return rank(sa) === 0 ? a.deadline.localeCompare(c.deadline) : c.createdAt.localeCompare(a.createdAt)
      })
  }, [demo, query, status, category, mine, labels, now])

  if (!demo) return null
  const connected = demo.wallet.status === "connected"
  const summary = boardSummary(demo)
  const { rank, standing } = rankOf(demo, demo.youId)
  const filtered = query !== "" || status !== "open" || category !== "all" || mine
  const clear = () => {
    setQuery("")
    setStatus("open")
    setCategory("all")
    setMine(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{b.title}</h1>

      <section aria-label={app.summary.label}>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label={app.summary.open} value={formatNumber(summary.open, locale)} />
          <Stat label={app.summary.locked} value={formatUsdWhole(summary.lockedUsd, locale)} title={app.summary.lockedHint} />
          <Stat
            label={app.summary.reputation}
            value={connected && standing ? t(labels.points, { n: formatNumber(standing.reputation, locale) }) : app.summary.notConnected}
            hint={connected ? t(app.summary.rank, { rank }) : undefined}
            muted={!connected}
            className="col-span-2 sm:col-span-1"
          />
        </dl>
      </section>

      {!connected ? <ConnectCard /> : null}

      <section aria-label={b.title} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="board-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={b.searchPlaceholder}
              aria-label={b.search}
              className="h-11 rounded-full pl-10"
            />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <fieldset className="min-w-0">
              <legend className="sr-only">{b.status}</legend>
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
                {STATUS_FILTERS.map((f) => (
                  <Chip key={f} active={status === f} onClick={() => setStatus(f)}>
                    {b.statuses[f]}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="board-category" className="text-sm font-semibold">
                  {b.category}
                </Label>
                <NativeSelect
                  id="board-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | "all")}
                  className="h-9"
                >
                  <option value="all">{b.allCategories}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {labels.category[c]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              {connected ? (
                <div className="flex min-h-9 items-center gap-2">
                  <Checkbox id="board-mine" checked={mine} onCheckedChange={(v) => setMine(v === true)} />
                  <Label htmlFor="board-mine" className="text-sm font-semibold">
                    {b.canSubmit}
                  </Label>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">
            {plural(b.results, list.length, locale)}
          </p>
          {filtered ? (
            <Button variant="ghost" size="sm" onClick={clear}>
              <XIcon aria-hidden="true" />
              {b.clear}
            </Button>
          ) : null}
        </div>

        {list.length ? (
          <ul className="flex flex-col gap-3">
            {(showAll ? list : list.slice(0, PAGE)).map((x) => (
              <li key={x.id}>
                <Ticket {...ticketProps(x, demo, labels, app.ticket, locale, now)} href={href(locale, `/app/bounty/${x.id}`)} />
              </li>
            ))}
          </ul>
        ) : null}
        {list.length > PAGE && !showAll ? (
          <Button variant="outline" className="self-start" onClick={() => setShowAll(true)}>
            {b.more}
          </Button>
        ) : null}
        {list.length ? null : (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-6">
            <p className="text-muted-foreground">{demo.bounties.length ? b.emptyFiltered : b.emptyAll}</p>
            {filtered ? (
              <Button variant="outline" size="sm" onClick={clear}>
                {b.clear}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={href(locale, "/app/new")}>{app.nav.post}</Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  title,
  muted,
  className,
}: {
  label: string
  value: string
  hint?: string
  title?: string
  muted?: boolean
  className?: string
}) {
  return (
    <div title={title} className={cn("flex flex-col gap-1 rounded-2xl border bg-card p-4", className)}>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className={cn("text-xl font-extrabold tabular-nums sm:text-2xl", muted && "text-base text-muted-foreground sm:text-base")}>{value}</dd>
      {hint ? <dd className="text-xs text-muted-foreground">{hint}</dd> : null}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150",
        active ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
