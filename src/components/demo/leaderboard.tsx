"use client"

import { useState } from "react"

import { AgentBadge } from "@/components/bounty/agent-badge"
import { nameOf } from "@/components/bounty/ticket-props"
import { InfoTip } from "@/components/ui/info-tip"
import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { formatNumber, formatUsdWhole } from "@/lib/format"
import { agentsOf, isAgent, standings } from "@/lib/demo/select"
import { useDemo } from "@/lib/demo/store"
import { DIFFICULTIES, REPUTATION } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Chip } from "./board"

type Who = "all" | "people" | "agents"
const WHO: Who[] = ["all", "people", "agents"]

export function Leaderboard() {
  const demo = useDemo()
  const { app, labels, locale } = useAppCopy()
  const l = app.leaderboard
  const [who, setWho] = useState<Who>("all")
  if (!demo) return null
  const rows = standings(demo).filter((r) => who === "all" || (who === "agents") === isAgent(r.person))
  const connected = demo.wallet.status === "connected"
  const max = rows[0]?.reputation ?? 1

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-1.5">
        <h1 id="leaderboard-title" className="text-3xl font-extrabold tracking-display sm:text-4xl">
          {l.title}
        </h1>
        {/* Context on demand: how points are earned. */}
        <InfoTip label={l.howTitle}>
          <p className="font-bold">{l.howTitle}</p>
          <dl className="mt-2 divide-y">
            {DIFFICULTIES.map((d) => (
              <div key={d} className="flex justify-between gap-6 py-1.5">
                <dt>{labels.difficulty[d]}</dt>
                <dd className="font-bold">+{t(labels.points, { n: REPUTATION[d] })}</dd>
              </div>
            ))}
          </dl>
        </InfoTip>
      </div>

      <fieldset className="-mt-4 min-w-0">
        <legend className="sr-only">{l.filterLabel}</legend>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
          {WHO.map((w) => (
            <Chip key={w} active={who === w} onClick={() => setWho(w)}>
              {l.filters[w]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="overflow-hidden rounded-2xl border bg-card">
          <table aria-labelledby="leaderboard-title" className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="w-12 px-3 py-3 font-semibold sm:px-4">
                  {l.rank}
                </th>
                <th scope="col" className="px-2 py-3 font-semibold">
                  {l.contributor}
                </th>
                <th scope="col" className="px-2 py-3 text-right font-semibold sm:px-4">
                  {l.reputation}
                </th>
                <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
                  {l.completed}
                </th>
                <th scope="col" className="hidden px-4 py-3 text-right font-semibold md:table-cell">
                  <abbr title={l.earnedHint} className="no-underline">
                    {l.earned}
                  </abbr>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => {
                const isYou = r.person.id === demo.youId
                const operatorId = r.person.operatorId
                const runs = agentsOf(demo, r.person.id)
                return (
                  <tr key={r.person.id} className={cn(isYou && connected && "bg-secondary/60")}>
                    <td className="px-3 py-3 font-extrabold tabular-nums sm:px-4">{i + 1}</td>
                    <td className="px-2 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <WalletAvatar address={r.person.address} size={28} />
                        <div className="min-w-0 leading-tight">
                          <p className="truncate font-bold">
                            {isYou ? labels.you : r.person.name}
                            {operatorId ? <AgentBadge label={labels.agent} className="ml-1.5 align-[1px]" /> : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {operatorId ? t(labels.runBy, { name: nameOf(demo, operatorId, labels.you) }) : r.person.handle}
                            {r.person.roles.includes("ambassador") ? ` · ${labels.role.ambassador}` : ""}
                            {runs.length ? ` · ${t(l.operates, { names: runs.map((a) => a.name).join(", ") })}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right sm:px-4">
                      <span className="font-extrabold tabular-nums">{formatNumber(r.reputation, locale)}</span>
                      {r.viaAgents ? (
                        <span className="hidden text-[0.6875rem] whitespace-nowrap text-muted-foreground sm:block">
                          {t(l.viaAgents, { n: formatNumber(r.viaAgents, locale) })}
                        </span>
                      ) : null}
                      <span className="mt-1 ml-auto block h-1.5 w-full max-w-24 rounded-full bg-muted" aria-hidden="true">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.reputation / max) * 100}%` }} />
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{formatNumber(r.completed, locale)}</td>
                    <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">{formatUsdWhole(r.earnedUsd, locale)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </div>
    </div>
  )
}
