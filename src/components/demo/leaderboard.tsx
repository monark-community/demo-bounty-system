"use client"

import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { formatNumber, formatUsdWhole } from "@/lib/format"
import { standings } from "@/lib/demo/select"
import { useDemo } from "@/lib/demo/store"
import { DIFFICULTIES, REPUTATION } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

export function Leaderboard() {
  const demo = useDemo()
  const { app, labels, locale } = useAppCopy()
  const l = app.leaderboard
  if (!demo) return null
  const rows = standings(demo)
  const connected = demo.wallet.status === "connected"
  const max = rows[0]?.reputation ?? 1

  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{l.title}</h1>
        <p className="mt-3 text-muted-foreground">{l.intro}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <caption className="sr-only">{l.title}</caption>
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
                return (
                  <tr key={r.person.id} className={cn(isYou && connected && "bg-secondary/60")}>
                    <td className="px-3 py-3 font-extrabold tabular-nums sm:px-4">{i + 1}</td>
                    <td className="px-2 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <WalletAvatar address={r.person.address} size={28} />
                        <div className="min-w-0 leading-tight">
                          <p className="truncate font-bold">
                            {isYou ? labels.you : r.person.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.person.handle}
                            {r.person.roles.includes("ambassador") ? ` · ${labels.role.ambassador}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right sm:px-4">
                      <span className="font-extrabold tabular-nums">{formatNumber(r.reputation, locale)}</span>
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

        <aside className="rounded-2xl border bg-card p-4">
          <h2 className="font-bold">{l.howTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{l.howBody}</p>
          <dl className="mt-3 divide-y text-sm">
            {DIFFICULTIES.map((d) => (
              <div key={d} className="flex justify-between py-2">
                <dt>{labels.difficulty[d]}</dt>
                <dd className="font-bold">+{t(labels.points, { n: REPUTATION[d] })}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  )
}
