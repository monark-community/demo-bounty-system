"use client"

import { ArrowRightIcon, GavelIcon, TrophyIcon, VoteIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Ticket } from "@/components/bounty/ticket"
import { ticketProps } from "@/components/bounty/ticket-props"
import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatNumber, formatRelative, formatToken, formatUsdWhole, plural } from "@/lib/format"
import { personById, rankOf, waitingOnYou } from "@/lib/demo/select"
import { useDemo } from "@/lib/demo/store"
import { TOKEN_LIST } from "@/lib/demo/tokens"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { ConnectCard } from "./app-frame"

export function YourWork() {
  const demo = useDemo()
  const { app, labels, locale } = useAppCopy()
  const y = app.you
  const [now] = useState(() => Date.now())
  if (!demo) return null

  const header = <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{y.title}</h1>
  if (demo.wallet.status !== "connected") {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <ConnectCard />
      </div>
    )
  }

  const you = personById(demo, demo.youId)
  const { rank, total, standing } = rankOf(demo, demo.youId)
  const waiting = waitingOnYou(demo)
  const mySubs = demo.bounties
    .flatMap((b) => b.submissions.filter((s) => s.personId === demo.youId).map((s) => ({ b, s })))
    .sort((a, c) => c.s.at.localeCompare(a.s.at))
  const posted = demo.bounties.filter((b) => b.posterId === demo.youId)
  return (
    <div className="flex flex-col gap-10">
      {header}

      <section aria-labelledby="rep-title" className="grid gap-4 rounded-3xl border bg-card p-4 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-8">
        <div className="flex items-center gap-4">
          <WalletAvatar address={demo.wallet.address} size={56} />
          <div>
            <h2 id="rep-title" className="eyebrow text-muted-foreground">
              {y.reputation}
            </h2>
            <p className="text-4xl font-extrabold tabular-nums tracking-display">{formatNumber(standing?.reputation ?? 0, locale)}</p>
            <p className="text-sm font-semibold text-muted-foreground">{t(y.rank, { rank, total })}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label={y.completed} value={formatNumber(standing?.completed ?? 0, locale)} />
          <Mini label={y.earned} value={formatUsdWhole(standing?.earnedUsd ?? 0, locale)} />
          <Mini
            label={y.balance}
            value={TOKEN_LIST.map((tk) => formatToken(demo.wallet.balances[tk], tk, locale, tk === "tETH" ? 3 : 0)).join(" · ")}
            small
          />
          <Mini
            label={y.roles}
            value={[...(you?.roles ?? []).map((r) => labels.role[r]), y.validatorRole].join(", ")}
            small
          />
        </dl>
      </section>

      <section aria-labelledby="waiting-title" className="flex flex-col gap-4">
        <h2 id="waiting-title" className="text-xl font-bold">
          {y.waiting}
        </h2>
        {waiting.length ? (
          <ul className="flex flex-col gap-3">
            {waiting.map((w) => (
              <li key={`${w.kind}-${w.bounty.id}`}>
                <Link
                  href={href(locale, `/app/bounty/${w.bounty.id}`)}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-primary/60 bg-card p-4 transition-colors hover:border-primary"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    {w.kind === "review" ? <GavelIcon className="size-5 text-primary" aria-hidden="true" /> : <VoteIcon className="size-5 text-primary" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{w.kind === "review" ? plural(y.toReview, w.count, locale) : y.toVote}</span>
                    <span className="block truncate text-sm text-muted-foreground">{w.bounty.title}</span>
                  </span>
                  <ArrowRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyBox text={y.waitingEmpty} cta={app.nav.board} to={href(locale, "/app")} />
        )}
      </section>

      <section aria-labelledby="subs-title" className="flex flex-col gap-4">
        <h2 id="subs-title" className="text-xl font-bold">
          {y.submissions}
        </h2>
        {mySubs.length ? (
          <ul className="flex flex-col gap-3">
            {mySubs.map(({ b, s }) => (
              <li key={s.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={href(locale, `/app/bounty/${b.id}`)} className="font-bold underline-offset-4 hover:underline">
                    {b.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t(app.bounty.submissions.submittedAt, { date: formatRelative(s.at, locale, now) })} · {formatToken(b.reward, b.token, locale)}
                  </p>
                  {s.status === "rejected" && s.decisionNote ? (
                    <p className="mt-2 rounded-xl bg-destructive/5 p-2.5 text-sm">{t(y.reason, { note: s.decisionNote })}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold",
                    s.status === "approved" && "border-success/60 text-success",
                    s.status === "rejected" && "border-destructive/50 text-destructive",
                    s.status === "review" && "border-warning/60 text-warning",
                    (s.status === "not_selected" || s.status === "withdrawn") && "border-input text-muted-foreground"
                  )}
                >
                  {s.status === "approved" ? <TrophyIcon className="size-3" aria-hidden="true" /> : null}
                  {s.status === "review" && b.review.kind === "validators" ? labels.submissionStatus.voting : labels.submissionStatus[s.status]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyBox text={y.submissionsEmpty} cta={app.nav.board} to={href(locale, "/app")} />
        )}
      </section>

      <section aria-labelledby="posted-title" className="flex flex-col gap-4">
        <h2 id="posted-title" className="text-xl font-bold">
          {y.posted}
        </h2>
        {posted.length ? (
          <ul className="flex flex-col gap-3">
            {posted.map((b) => (
              <li key={b.id}>
                <Ticket {...ticketProps(b, demo, labels, app.ticket, locale, now)} href={href(locale, `/app/bounty/${b.id}`)} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyBox text={y.postedEmpty} cta={app.nav.post} to={href(locale, "/app/new")} />
        )}
      </section>

    </div>
  )
}

function Mini({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-extrabold tabular-nums", small ? "text-sm" : "text-xl")}>{value}</dd>
    </div>
  )
}

function EmptyBox({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5">
      <p className="text-muted-foreground">{text}</p>
      <Button asChild variant="outline" size="sm">
        <Link href={to}>{cta}</Link>
      </Button>
    </div>
  )
}
