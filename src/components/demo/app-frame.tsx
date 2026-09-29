"use client"

import { Loader2Icon, PlusIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { NetworkBadge } from "@/components/ui/network-badge"
import { href } from "@/i18n/config"
import { waitingOnYou } from "@/lib/demo/select"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { NETWORK_NAME } from "@/lib/demo/tokens"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"
import { Disclaimer } from "./disclaimer"
import { useConnect } from "./use-connect"

/** App chrome under the site header: network, disclaimer, demo controls and the board's sub-navigation. */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app, disclaimer } = useAppCopy()

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <NetworkBadge name={NETWORK_NAME} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
          <Disclaimer text={disclaimer} className="order-last min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1" />
          <div className="ml-auto sm:ml-0">
            <DemoControls />
          </div>
        </div>
      </div>
      <SubNav />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.storageError}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : children}
      </div>
    </div>
  )
}

function SubNav() {
  const { app, locale } = useAppCopy()
  const demo = useDemo()
  const pathname = usePathname() ?? ""
  const n = app.nav
  const base = href(locale, "/app")
  const waiting = demo && demo.wallet.status === "connected" ? waitingOnYou(demo).reduce((sum, w) => sum + w.count, 0) : 0
  const items = [
    { href: base, label: n.board, active: pathname === base || pathname.startsWith(`${base}/bounty`) },
    { href: `${base}/you`, label: n.you, active: pathname.startsWith(`${base}/you`), count: waiting },
    { href: `${base}/leaderboard`, label: n.leaderboard, active: pathname.startsWith(`${base}/leaderboard`) },
  ]
  const postActive = pathname.startsWith(`${base}/new`)

  return (
    <div className="border-b">
      <nav aria-label={n.label} className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6">
        <ul className="-mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 py-1">
          {items.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150",
                  item.active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {item.count ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-extrabold text-primary-foreground">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" variant={postActive ? "outline" : "default"} className="shrink-0">
          <Link href={`${base}/new`} aria-current={postActive ? "page" : undefined}>
            <PlusIcon aria-hidden="true" />
            <span className="hidden sm:inline">{n.post}</span>
            <span className="sr-only sm:hidden">{n.post}</span>
          </Link>
        </Button>
      </nav>
    </div>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-56 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}

/** Inline invitation to connect, used wherever an action needs a wallet. */
export function ConnectCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  const demo = useDemo()
  const { app } = useAppCopy()
  const connect = useConnect()
  const g = app.connectCard
  const connecting = demo?.wallet.status === "connecting"
  const rejected = demo?.wallet.lastError === "rejected"

  return (
    <section aria-label={g.title} className={cn("flex flex-col gap-3 rounded-2xl border border-dashed bg-card p-4 sm:p-5", className)}>
      {!compact ? (
        <div>
          <h2 className="font-bold">{g.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{g.body}</p>
        </div>
      ) : null}
      <Button className="self-start" disabled={connecting} onClick={() => void connect()}>
        {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
        {connecting ? app.wallet.connecting : g.button}
      </Button>
      <div aria-live="polite">
        {rejected ? (
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
      </div>
    </section>
  )
}
