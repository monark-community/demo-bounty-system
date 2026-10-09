"use client"

import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Ticket } from "@/components/bounty/ticket"
import { ticketProps } from "@/components/bounty/ticket-props"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Stat, StatGroup, StatHint, StatLabel, StatValue } from "@/components/ui/stat"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatNumber, formatUsdWhole, plural } from "@/lib/format"
import { boardSummary, displayStatus, rankOf, submitBlock } from "@/lib/demo/select"
import { useDemo } from "@/lib/demo/store"
import { CATEGORIES, type Category } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"
import { ConnectCard } from "./app-frame"

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
  const [agentsOk, setAgentsOk] = useState(false)
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
        if (agentsOk && x.agents === "humans") return false
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
  }, [demo, query, status, category, mine, agentsOk, labels, now])

  if (!demo) return null
  const connected = demo.wallet.status === "connected"
  const summary = boardSummary(demo)
  const { rank, standing } = rankOf(demo, demo.youId)
  const filtered = query !== "" || status !== "open" || category !== "all" || mine || agentsOk
  const clear = () => {
    setQuery("")
    setStatus("open")
    setCategory("all")
    setMine(false)
    setAgentsOk(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{b.title}</h1>

      <section aria-label={app.summary.label}>
        <StatGroup className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
          <Stat>
            <StatLabel>{app.summary.open}</StatLabel>
            <StatValue>{formatNumber(summary.open, locale)}</StatValue>
          </Stat>
          <Stat title={app.summary.lockedHint}>
            <StatLabel>{app.summary.locked}</StatLabel>
            <StatValue>{formatUsdWhole(summary.lockedUsd, locale)}</StatValue>
          </Stat>
          <Stat size={connected ? "default" : "sm"} className="col-span-2 sm:col-span-1">
            <StatLabel>{app.summary.reputation}</StatLabel>
            {connected && standing ? (
              <StatValue>{t(labels.points, { n: formatNumber(standing.reputation, locale) })}</StatValue>
            ) : (
              <StatValue className="text-muted-foreground">{app.summary.notConnected}</StatValue>
            )}
            {connected ? <StatHint>{t(app.summary.rank, { rank })}</StatHint> : null}
          </Stat>
        </StatGroup>
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
            <ToggleGroup
              type="single"
              variant="chip"
              size="sm"
              aria-label={b.status}
              value={status}
              onValueChange={(v) => v && setStatus(v as StatusFilter)}
            >
              {STATUS_FILTERS.map((f) => (
                <ToggleGroupItem key={f} value={f}>
                  {b.statuses[f]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="board-category" className="font-semibold">
                  {b.category}
                </Label>
                <NativeSelect
                  id="board-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | "all")}
                  size="sm"
                >
                  <option value="all">{b.allCategories}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {labels.category[c]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex min-h-9 items-center gap-2">
                <Checkbox id="board-agents" checked={agentsOk} onCheckedChange={(v) => setAgentsOk(v === true)} />
                <Label htmlFor="board-agents" className="font-semibold">
                  {b.agents}
                </Label>
              </div>
              {connected ? (
                <div className="flex min-h-9 items-center gap-2">
                  <Checkbox id="board-mine" checked={mine} onCheckedChange={(v) => setMine(v === true)} />
                  <Label htmlFor="board-mine" className="font-semibold">
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
          <Empty align="start" size="sm" role="status">
            <EmptyDescription className="text-base">{demo.bounties.length ? b.emptyFiltered : b.emptyAll}</EmptyDescription>
            <EmptyContent>
              {filtered ? (
                <Button variant="outline" size="sm" onClick={clear}>
                  {b.clear}
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={href(locale, "/app/new")}>{app.nav.post}</Link>
                </Button>
              )}
            </EmptyContent>
          </Empty>
        )}
      </section>
    </div>
  )
}
